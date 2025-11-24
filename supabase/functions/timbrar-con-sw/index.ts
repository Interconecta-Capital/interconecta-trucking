import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { TimbrarCartaPorteSchema, createValidationErrorResponse } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

// Función para formatear fecha según especificación SAT (sin milisegundos ni zona horaria)
function formatFechaSAT(fecha: Date = new Date()): string {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  const hours = String(fecha.getHours()).padStart(2, '0');
  const minutes = String(fecha.getMinutes()).padStart(2, '0');
  const seconds = String(fecha.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

/**
 * Normaliza fechas para cumplir con formato SAT
 * - Agrega segundos (:00) si solo tiene minutos
 * - Remueve milisegundos y zona horaria si existen
 * - Retorna fecha en formato YYYY-MM-DDTHH:MM:SS
 */
function normalizarFechaSAT(fecha: string | Date | undefined): string {
  if (!fecha) {
    return formatFechaSAT(new Date());
  }

  let fechaStr = typeof fecha === 'string' ? fecha : fecha.toISOString();
  
  // Remover zona horaria (Z, +00:00, etc.)
  fechaStr = fechaStr.replace(/Z$/, '').replace(/[+-]\d{2}:\d{2}$/, '');
  
  // Remover milisegundos (.123, .456, etc.)
  fechaStr = fechaStr.replace(/\.\d{3}/, '');
  
  // Si tiene formato YYYY-MM-DDTHH:MM (sin segundos), agregar :00
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(fechaStr)) {
    fechaStr += ':00';
  }
  
  // Validar formato final
  const fechaPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
  if (!fechaPattern.test(fechaStr)) {
    console.warn(`⚠️ Fecha inválida "${fechaStr}", usando fecha actual`);
    return formatFechaSAT(new Date());
  }
  
  return fechaStr;
}

/**
 * Valida la coherencia entre tipo de comprobante e importes
 * Según regla SAT CFDI40109
 */
function validarCoherenciaTipoComprobante(cfdi: any): { valid: boolean; error?: string } {
  const tipo = cfdi.TipoDeComprobante;
  const subtotal = parseFloat(cfdi.SubTotal);
  const total = parseFloat(cfdi.Total);
  
  // Regla SAT: Si TipoDeComprobante es "T" o "P", SubTotal y Total deben ser 0
  if ((tipo === "T" || tipo === "P") && (subtotal !== 0 || total !== 0)) {
    return {
      valid: false,
      error: `CFDI40109: TipoDeComprobante "${tipo}" requiere SubTotal y Total en 0. Valores actuales: SubTotal=${subtotal}, Total=${total}`
    };
  }
  
  // Regla: Si es tipo "I" (Ingreso), debe tener importes
  if (tipo === "I" && subtotal === 0) {
    return {
      valid: false,
      error: `Tipo "I" (Ingreso) requiere SubTotal > 0. Valor actual: ${subtotal}`
    };
  }
  
  return { valid: true };
}

// Función de validación exhaustiva pre-timbrado
function validarCFDIAntesDeTimbrar(cfdi: any) {
  const errores: string[] = [];
  const advertencias: string[] = [];

  // 1. Validar formato de fecha
  const fechaPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
  if (!fechaPattern.test(cfdi.Fecha)) {
    errores.push(`Fecha inválida: "${cfdi.Fecha}". Debe ser YYYY-MM-DDTHH:MM:SS (sin milisegundos)`);
  }

  // 2. Validar RFCs
  const rfcPattern = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
  if (!rfcPattern.test(cfdi.Emisor?.Rfc)) {
    errores.push(`RFC Emisor inválido: "${cfdi.Emisor?.Rfc}"`);
  }
  if (!rfcPattern.test(cfdi.Receptor?.Rfc)) {
    errores.push(`RFC Receptor inválido: "${cfdi.Receptor?.Rfc}"`);
  }

  // 3. Validar valores monetarios (2 decimales)
  const validarMonetario = (valor: string, campo: string) => {
    if (!/^\d+\.\d{2}$/.test(valor)) {
      errores.push(`${campo} debe tener exactamente 2 decimales: "${valor}"`);
    }
  };

  validarMonetario(cfdi.SubTotal, 'SubTotal');
  validarMonetario(cfdi.Total, 'Total');

  // 4. Validar catálogos SAT
  const regimenesFiscales = ['601', '603', '605', '606', '607', '608', '610', '611', '612', '614', '615', '616', '620', '621', '622', '623', '624', '625', '626', '628', '629', '630'];
  const usosCFDI = ['G01', 'G02', 'G03', 'I01', 'I02', 'I03', 'I04', 'I05', 'I06', 'I07', 'I08', 'D01', 'D02', 'D03', 'D04', 'D05', 'D06', 'D07', 'D08', 'D09', 'D10', 'S01', 'CP01', 'CN01'];
  
  if (!regimenesFiscales.includes(cfdi.Emisor?.RegimenFiscal)) {
    errores.push(`Régimen fiscal emisor inválido: "${cfdi.Emisor?.RegimenFiscal}"`);
  }
  if (!regimenesFiscales.includes(cfdi.Receptor?.RegimenFiscalReceptor)) {
    errores.push(`Régimen fiscal receptor inválido: "${cfdi.Receptor?.RegimenFiscalReceptor}"`);
  }
  if (!usosCFDI.includes(cfdi.Receptor?.UsoCFDI)) {
    errores.push(`Uso CFDI inválido: "${cfdi.Receptor?.UsoCFDI}"`);
  }

  // 5. Validar códigos postales
  const cpPattern = /^\d{5}$/;
  if (!cpPattern.test(cfdi.LugarExpedicion)) {
    errores.push(`Lugar de expedición (CP) inválido: "${cfdi.LugarExpedicion}"`);
  }
  if (!cpPattern.test(cfdi.Receptor?.DomicilioFiscalReceptor)) {
    errores.push(`Domicilio fiscal receptor (CP) inválido: "${cfdi.Receptor?.DomicilioFiscalReceptor}"`);
  }

  // 6. Validar conceptos
  if (!cfdi.Conceptos || cfdi.Conceptos.length === 0) {
    errores.push('Debe haber al menos un concepto');
  } else {
    cfdi.Conceptos.forEach((c: any, i: number) => {
      if (!c.ClaveProdServ || !/^\d{8}$/.test(c.ClaveProdServ)) {
        errores.push(`Concepto ${i+1}: ClaveProdServ inválida (debe ser 8 dígitos)`);
      }
      if (!c.Cantidad || c.Cantidad === '0') {
        errores.push(`Concepto ${i+1}: Cantidad debe ser mayor a 0`);
      }
      if (!c.Descripcion || c.Descripcion.trim().length < 5) {
        errores.push(`Concepto ${i+1}: Descripción muy corta`);
      }
    });
  }

  // 7. Validar método y forma de pago (solo para tipo Ingreso)
  if (cfdi.TipoDeComprobante === 'I') {
    const formasPago = ['01', '02', '03', '04', '05', '06', '08', '12', '13', '14', '15', '17', '23', '24', '25', '26', '27', '28', '29', '30', '31', '99'];
    const metodosPago = ['PUE', 'PPD'];
    
    if (cfdi.FormaPago && !formasPago.includes(cfdi.FormaPago)) {
      errores.push(`Forma de pago inválida: "${cfdi.FormaPago}"`);
    }
    if (cfdi.MetodoPago && !metodosPago.includes(cfdi.MetodoPago)) {
      errores.push(`Método de pago inválido: "${cfdi.MetodoPago}"`);
    }
  }

  // 8. Advertencias (no bloquean pero se deben revisar)
  if (cfdi.SubTotal === '0.00' && cfdi.TipoDeComprobante === 'I') {
    advertencias.push('SubTotal en 0 para comprobante de Ingreso (verificar si es correcto)');
  }

  return {
    valido: errores.length === 0,
    errores,
    advertencias
  };
}

// Función de validación de datos fuente (antes de construir CFDI)
function validarDatosParaTimbrado(dataSource: any, esFacturaConCartaPorte: boolean) {
  const errores: string[] = [];
  const advertencias: string[] = [];

  // Validar fechas en ubicaciones (si hay CartaPorte)
  if (esFacturaConCartaPorte) {
    const ubicaciones = dataSource?.ubicaciones || dataSource?.tracking_data?.ubicaciones || [];
    const ubicacionesArray = Array.isArray(ubicaciones) ? ubicaciones : 
      (ubicaciones.origen && ubicaciones.destino ? [ubicaciones.origen, ubicaciones.destino] : []);
    
    ubicacionesArray.forEach((u: any, i: number) => {
      const fechaOriginal = u.fecha_llegada_salida || u.fechaHoraSalidaLlegada;
      if (fechaOriginal) {
        const fechaNormalizada = normalizarFechaSAT(fechaOriginal);
        // Actualizar la fecha en el objeto para usar la normalizada
        if (u.fecha_llegada_salida) {
          u.fecha_llegada_salida = fechaNormalizada;
        }
        if (u.fechaHoraSalidaLlegada) {
          u.fechaHoraSalidaLlegada = fechaNormalizada;
        }
        console.log(`✅ Ubicación ${i+1}: Fecha normalizada "${fechaOriginal}" → "${fechaNormalizada}"`);
      }
    });
  }

  // Validar RFCs básicos
  const rfcPattern = /^[A-ZÑ&]{3,4}\d{6}[A-Z0-9]{3}$/;
  if (dataSource?.rfcEmisor && !rfcPattern.test(dataSource.rfcEmisor)) {
    errores.push(`RFC Emisor inválido: "${dataSource.rfcEmisor}"`);
  }
  if (dataSource?.rfcReceptor && !rfcPattern.test(dataSource.rfcReceptor)) {
    errores.push(`RFC Receptor inválido: "${dataSource.rfcReceptor}"`);
  }

  // Validar códigos postales
  const cpPattern = /^\d{5}$/;
  if (dataSource?.lugarExpedicion && !cpPattern.test(dataSource.lugarExpedicion)) {
    errores.push(`Lugar de expedición inválido: "${dataSource.lugarExpedicion}"`);
  }

  return {
    valido: errores.length === 0,
    errores,
    advertencias
  };
}

// 🔐 ISO 27001 A.10.1.1 - Usar token estático de SW
async function obtenerTokenSW(ambiente: 'sandbox' | 'production'): Promise<string> {
  // ✅ SmartWeb usa token estático en lugar de autenticación dinámica
  const swToken = Deno.env.get('SW_TOKEN');
  
  if (!swToken) {
    console.error('❌ Token SW no configurado en secretos');
    throw new Error('SW_TOKEN no configurado. Agrega tu token de SmartWeb en los secretos.');
  }

  console.log('✅ Usando token estático de SW para ambiente:', ambiente);
  console.log('🔑 Token (primeros 10 chars):', swToken.substring(0, 10) + '...');
  
  // ISO 27001 A.9.4.5 - Token configurado desde Vault
  return swToken;
}

const handler = async (req: Request): Promise<Response> => {
  // 🔐 CORS: Manejar preflight requests SIEMPRE primero
  if (req.method === 'OPTIONS') {
    console.log('✅ [CORS] Preflight request recibido');
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  console.log(`📡 [${formatFechaSAT(new Date())}] Request recibido: ${req.method} ${req.url}`);

  // Declarar variables fuera del try para uso en catch y en todo el scope
  let user: any = null;
  let ambiente: 'sandbox' | 'production' = 'sandbox';
  let supabaseClient: any = null;

  try {
    // 1. Autenticación
    supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user: authUser }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !authUser) {
      console.error('❌ Error de autenticación:', userError);
      return new Response(JSON.stringify({ success: false, error: 'No autorizado' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    user = authUser; // Asignar para uso en catch block

    // 2. Obtener y validar datos del request
    const requestBody = await req.json();
    
    const validationResult = TimbrarCartaPorteSchema.safeParse(requestBody);
    if (!validationResult.success) {
      return createValidationErrorResponse(validationResult.error, corsHeaders);
    }

    const { cartaPorteData, cartaPorteId, facturaData, facturaId, ambiente: reqAmbiente } = validationResult.data;
    ambiente = reqAmbiente; // Asignar para uso en catch block

    // 🔐 ISO 27001 A.14.2.1 - Validación de entrada robusta
    if (!cartaPorteData && !facturaData) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Faltan datos requeridos: cartaPorteData o facturaData' 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // ✅ DECLARAR DATASOURCE UNA SOLA VEZ AQUÍ (evita duplicaciones)
    const dataSource = facturaData || cartaPorteData;
    const tipoDocumentoFinal = facturaId ? 'factura' : 'cartaporte';

    // 🔐 Detectar si es factura simple o con complemento CartaPorte
    const esFacturaConCartaPorte = !!(
      cartaPorteData?.ubicaciones || 
      facturaData?.ubicaciones ||
      cartaPorteData?.tracking_data?.ubicaciones ||
      facturaData?.tracking_data?.ubicaciones
    );

    const documentoId = cartaPorteId || facturaId;
    const tipoDocumento = cartaPorteData ? 'Carta Porte' : esFacturaConCartaPorte ? 'Factura con CartaPorte' : 'Factura Simple';
    
    // 🔒 Logging seguro (sin exponer datos sensibles)
    console.log(`🚀 [${formatFechaSAT(new Date())}] Timbrando ${tipoDocumento} para usuario ${user.id.substring(0, 8)}... en ${ambiente}`, {
      documentoId: documentoId?.substring(0, 8),
      esFacturaConCartaPorte,
      hasUbicaciones: esFacturaConCartaPorte
    });
    
    // 🔐 ISO 27001 A.12.4.1 - Validación de integridad de datos
    // Validar estructura según tipo de documento
    if (esFacturaConCartaPorte) {
      const ubicaciones = dataSource?.ubicaciones || dataSource?.tracking_data?.ubicaciones;
      
      if (!ubicaciones) {
        console.error('❌ Factura marcada con CartaPorte pero sin ubicaciones');
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Para factura con CartaPorte se requieren ubicaciones (origen y destino)' 
        }), { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      // Validar formato de ubicaciones
      const ubicacionesArray = Array.isArray(ubicaciones) ? ubicaciones : 
        (ubicaciones.origen && ubicaciones.destino ? [ubicaciones.origen, ubicaciones.destino] : []);
      
      if (ubicacionesArray.length < 2) {
        console.error('❌ Se requieren mínimo 2 ubicaciones (origen y destino)');
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Se requieren al menos 2 ubicaciones: origen y destino' 
        }), { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      console.log('✅ Validación de ubicaciones exitosa:', {
        cantidadUbicaciones: ubicacionesArray.length,
        formatoArray: Array.isArray(ubicaciones)
      });
    }

    // 🔍 VALIDACIONES EXHAUSTIVAS PRE-TIMBRADO
    console.log('🔍 Iniciando validación exhaustiva pre-timbrado...');
    const validacionDatosResult = validarDatosParaTimbrado(dataSource, esFacturaConCartaPorte);
    
    if (!validacionDatosResult.valido) {
      console.error('❌ Validación pre-timbrado fallida:', validacionDatosResult.errores);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Validación pre-timbrado fallida',
        errores: validacionDatosResult.errores,
        advertencias: validacionDatosResult.advertencias
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    if (validacionDatosResult.advertencias.length > 0) {
      console.warn('⚠️ Advertencias pre-timbrado:', validacionDatosResult.advertencias);
    }

    console.log('✅ Validación pre-timbrado exitosa');

    // 3. 🔐 ISO 27001 A.10.1.1 - Obtener token dinámico mediante autenticación
    console.log('🔐 Obteniendo token dinámico de SW...');
    const swToken = await obtenerTokenSW(ambiente);
    
    const swUrl = ambiente === 'production' 
      ? Deno.env.get('SW_PRODUCTION_URL')
      : Deno.env.get('SW_SANDBOX_URL');

    if (!swUrl) {
      throw new Error('URL de SW no configurada');
    }

    console.log('✅ Token dinámico obtenido, procesando CFDI...');

    // 4. Construir el CFDI JSON según formato de SW
    console.log('🎯 [DEBUG] Construyendo CFDI con:', {
      tipoDocumento: tipoDocumentoFinal,
      hasFacturaId: !!facturaId,
      hasFacturaData: !!facturaData,
      hasCartaPorteData: !!cartaPorteData,
      dataSourceKeys: Object.keys(dataSource).slice(0, 10)
    });
    
    const cfdiJson = construirCFDIJson(dataSource, esFacturaConCartaPorte, tipoDocumentoFinal);
    
    console.log('🎯 [DEBUG] CFDI construido:', {
      TipoDeComprobante: cfdiJson.TipoDeComprobante,
      SubTotal: cfdiJson.SubTotal,
      Total: cfdiJson.Total,
      Serie: cfdiJson.Serie,
      Folio: cfdiJson.Folio
    });

    // VALIDACIÓN PRE-TIMBRADO EXHAUSTIVA
    console.log('🔍 Iniciando validación pre-timbrado exhaustiva...');
    const validacionCFDIResult = validarCFDIAntesDeTimbrar(cfdiJson);

    if (!validacionCFDIResult.valido) {
      console.error('❌ Validación pre-timbrado fallida:', validacionCFDIResult.errores);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Validación pre-timbrado fallida',
        errores: validacionCFDIResult.errores,
        advertencias: validacionCFDIResult.advertencias
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    if (validacionCFDIResult.advertencias.length > 0) {
      console.warn('⚠️ Advertencias pre-timbrado:', validacionCFDIResult.advertencias);
    }

    console.log('✅ Validación pre-timbrado exitosa');

    // ✅ VALIDACIÓN DE COHERENCIA: Verificar tipo de comprobante vs importes
    const validacionTipo = validarCoherenciaTipoComprobante(cfdiJson);
    if (!validacionTipo.valid) {
      console.error('❌ [VALIDACIÓN] Error de coherencia:', validacionTipo.error);
      return new Response(JSON.stringify({ 
        success: false, 
        error: validacionTipo.error,
        codigo: 'CFDI40109'
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Logging detallado para debugging
    console.log('📋 CFDI JSON completo a enviar:', JSON.stringify({
      fecha: cfdiJson.Fecha,
      fechaPattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(cfdiJson.Fecha),
      emisor: {
        rfc: cfdiJson.Emisor?.Rfc,
        nombre: cfdiJson.Emisor?.Nombre,
        regimen: cfdiJson.Emisor?.RegimenFiscal
      },
      receptor: {
        rfc: cfdiJson.Receptor?.Rfc,
        nombre: cfdiJson.Receptor?.Nombre,
        regimen: cfdiJson.Receptor?.RegimenFiscalReceptor,
        usoCFDI: cfdiJson.Receptor?.UsoCFDI
      },
      importes: {
        subtotal: cfdiJson.SubTotal,
        total: cfdiJson.Total,
        moneda: cfdiJson.Moneda
      },
      conceptos: cfdiJson.Conceptos?.length,
      tieneCartaPorte: !!cfdiJson.Complemento
    }, null, 2));

    console.log('📦 Enviando CFDI a SW con multipart/form-data para mejor rendimiento...');

    // 5. Convertir JSON a XML string
    const xmlString = jsonToXML(cfdiJson);
    console.log('🔄 XML generado (primeros 500 chars):', xmlString.substring(0, 500));

    // 6. Crear FormData con multipart/form-data (método optimizado según docs de SW)
    const formData = new FormData();
    formData.append('xml', new Blob([xmlString], { type: 'application/xml' }), 'cfdi.xml');

    // 7. Llamar a la API de SW con multipart/form-data (mejor rendimiento)
    const swResponse = await fetch(`${swUrl}/cfdi33/issue/v4`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${swToken}`,
        // No agregar Content-Type, FormData lo maneja automáticamente con boundary correcto
      },
      body: formData,
    });

    const responseText = await swResponse.text();
    console.log('📥 Respuesta de SW (raw):', responseText);

    let swData;
    try {
      swData = JSON.parse(responseText);
    } catch (e) {
      console.error('❌ Error parseando respuesta de SW:', e);
      throw new Error(`Respuesta inválida de SW: ${responseText.substring(0, 200)}`);
    }

    // 6. Manejar respuesta de SW
    if (!swResponse.ok || swData.status !== 'success') {
      const errorMapeado = mapearErrorSW(swData);
      console.error('❌ Error del PAC SW:', errorMapeado);
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: errorMapeado.mensaje,
        codigo: errorMapeado.codigo,
        details: swData 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 7. Extraer datos del timbrado exitoso
    const timbradoData = {
      uuid: swData.data.uuid,
      xmlTimbrado: swData.data.cfdi,
      qrCode: swData.data.qrCode,
      cadenaOriginal: swData.data.cadenaOriginalSAT,
      selloDigital: swData.data.selloCFDI,
      selloSAT: swData.data.selloSAT,
      fechaTimbrado: swData.data.fechaTimbrado,
      noCertificadoCFDI: swData.data.noCertificadoCFDI,
      noCertificadoSAT: swData.data.noCertificadoSAT,
      pac: 'SW/Conectia'
    };

    console.log(`✅ Timbrado exitoso - UUID: ${timbradoData.uuid}`);

    // 8. Guardar XML timbrado en Storage
    const xmlPath = `${user.id}/cartas-porte/${cartaPorteId}/xml_timbrado.xml`;
    const { error: storageError } = await supabaseClient.storage
      .from('documentos')
      .upload(xmlPath, new Blob([timbradoData.xmlTimbrado], { type: 'application/xml' }), {
        upsert: true
      });

    if (storageError) {
      console.error('⚠️ Error guardando XML en storage:', storageError);
    }

    // 9. Guardar QR Code en Storage
    if (timbradoData.qrCode) {
      const qrPath = `${user.id}/cartas-porte/${cartaPorteId}/qr_code.png`;
      const qrBuffer = Uint8Array.from(atob(timbradoData.qrCode), c => c.charCodeAt(0));
      const { error: qrError } = await supabaseClient.storage
        .from('documentos')
        .upload(qrPath, qrBuffer, {
          contentType: 'image/png',
          upsert: true
        });

      if (qrError) {
        console.error('⚠️ Error guardando QR en storage:', qrError);
      }
    }

    // 10. Actualizar registro en BD (Carta Porte o Factura)
    if (cartaPorteId) {
      const { error: updateError } = await supabaseClient
        .from('cartas_porte')
        .update({
          uuid_fiscal: timbradoData.uuid,
          xml_generado: timbradoData.xmlTimbrado,
          fecha_timbrado: timbradoData.fechaTimbrado,
          status: 'timbrado',
          pac_proveedor: 'SW/Conectia',
          cadena_original: timbradoData.cadenaOriginal,
          sello_digital: timbradoData.selloDigital,
          no_certificado: timbradoData.noCertificadoCFDI,
          updated_at: new Date().toISOString()
        })
        .eq('id', cartaPorteId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('⚠️ Error actualizando Carta Porte:', updateError);
      }
    } else if (facturaId) {
      const { error: updateError } = await supabaseClient
        .from('facturas')
        .update({
          uuid_fiscal: timbradoData.uuid,
          xml_generado: timbradoData.xmlTimbrado,
          fecha_timbrado: timbradoData.fechaTimbrado,
          status: 'timbrado',
          cadena_original: timbradoData.cadenaOriginal,
          sello_digital: timbradoData.selloDigital,
          sello_sat: timbradoData.selloSAT,
          certificado_sat: timbradoData.noCertificadoSAT,
          updated_at: new Date().toISOString()
        })
        .eq('id', facturaId)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('⚠️ Error actualizando Factura:', updateError);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      ...timbradoData 
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    // 🔐 ISO 27001 A.16.1.5 - Respuesta segura a incidentes
    // No exponer stack traces ni información sensible en producción
    const userId = user?.id?.substring(0, 8) || 'unknown';
    
    console.error('💥 [ERROR] Timbrado fallido:', {
      message: error.message,
      timestamp: new Date().toISOString(),
      userId,
      ambiente,
      errorType: error.name
    });
    
    // Solo incluir stack trace en modo sandbox (desarrollo)
    const isDev = ambiente === 'sandbox';
    const errorResponse: any = { 
      success: false, 
      error: error.message || 'Error interno al procesar el timbrado',
      timestamp: new Date().toISOString(),
      support: 'Contacte a soporte si el problema persiste'
    };
    
    // Stack trace solo en desarrollo para debugging
    if (isDev && error.stack) {
      errorResponse.debug = {
        stack: error.stack,
        name: error.name
      };
    }
    
    // Determinar status code apropiado
    const statusCode = error.message?.includes('autenticación') ? 401 : 500;
    
    return new Response(JSON.stringify(errorResponse), { 
      status: statusCode, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
};

// Función para construir el JSON del CFDI según formato de SW
function construirCFDIJson(
  documentoData: any, 
  requiereComplementoCartaPorte: boolean = false,
  tipoDocumento: 'factura' | 'cartaporte' = 'cartaporte'
) {
  const fecha = formatFechaSAT(new Date());
  
  // Determinar si es tipo Ingreso o Traslado
  // Prioridad: 1) Si es factura = Ingreso, 2) tipo_comprobante, 3) tipoCfdi
  const esTipoIngreso = tipoDocumento === 'factura' 
    || documentoData.tipo_comprobante === 'I'
    || documentoData.tipoCfdi === 'Ingreso';
  
  // Calcular subtotal y total
  let subtotal = 0;
  let totalImpuestos = 0;
  
  // Calcular basado en conceptos directos (factura) o mercancías (carta porte)
  if (documentoData.conceptos && documentoData.conceptos.length > 0) {
    // Factura con conceptos directos
    subtotal = documentoData.conceptos.reduce((sum: number, c: any) => sum + (c.importe || 0), 0);
  } else if (esTipoIngreso && documentoData.mercancias) {
    // Carta porte con mercancías
    subtotal = documentoData.mercancias.reduce((sum: number, m: any) => 
      sum + (m.valor_mercancia || 0), 0
    );
  }
  
  if (esTipoIngreso && subtotal > 0) {
    totalImpuestos = subtotal * 0.16; // IVA 16%
  }
  
  // Determinar el tipo de comprobante final
  const tipoComprobante = tipoDocumento === 'factura' ? "I" : (esTipoIngreso ? "I" : "T");
  
  // Si es tipo T o P, los importes deben ser 0 según SAT
  const subtotalFinal = tipoComprobante === "T" || tipoComprobante === "P" ? 0 : subtotal;
  const totalFinal = tipoComprobante === "T" || tipoComprobante === "P" ? 0 : (subtotal + totalImpuestos);

  console.log('🔍 [CFDI] Configuración del documento:', {
    tipoDocumento,
    esFacturaConCartaPorte: requiereComplementoCartaPorte,
    esTipoIngreso,
    tipoCfdiRecibido: documentoData.tipoCfdi,
    tipoComprobanteDB: documentoData.tipo_comprobante,
    tipoComprobanteCalculado: tipoComprobante,
    importes: {
      subtotal: subtotalFinal.toFixed(2),
      totalImpuestos: totalImpuestos.toFixed(2),
      total: totalFinal.toFixed(2)
    }
  });
  
  // 🔐 ISO 27001 A.12.2.1 - Protección contra procesamiento incorrecto
  // Solo verificar ubicaciones si se requiere complemento de CartaPorte
  const tieneUbicaciones = requiereComplementoCartaPorte && (() => {
    const ubicaciones = documentoData.ubicaciones || documentoData.tracking_data?.ubicaciones;
    if (!ubicaciones) return false;
    
    // Formato array
    if (Array.isArray(ubicaciones) && ubicaciones.length >= 2) return true;
    
    // Formato objeto con origen y destino
    if (ubicaciones.origen && ubicaciones.destino) return true;
    
    return false;
  })();
  
  if (requiereComplementoCartaPorte) {
    console.log('🔍 [CFDI] Verificación de ubicaciones para CartaPorte:', {
      tieneUbicaciones,
      requiereComplementoCartaPorte
    });
  }

  const cfdi: any = {
    Version: "4.0",
    Serie: documentoData.serie || "CP",
    Folio: documentoData.folio || "1",
    Fecha: fecha,
    Sello: "", // SW lo genera automáticamente
    NoCertificado: "", // SW lo genera automáticamente
    Certificado: "", // SW lo genera automáticamente
    SubTotal: subtotalFinal.toFixed(2),
    Moneda: documentoData.moneda || "MXN",
    Total: totalFinal.toFixed(2),
    TipoDeComprobante: tipoComprobante,
    Exportacion: documentoData.exportacion || "01",
    LugarExpedicion: obtenerCPEmisor(documentoData),
    FormaPago: esTipoIngreso ? (documentoData.formaPago || "01") : undefined,
    MetodoPago: esTipoIngreso ? (documentoData.metodoPago || "PUE") : undefined,
    
    Emisor: {
      Rfc: documentoData.rfcEmisor || documentoData.rfc_emisor,
      Nombre: documentoData.nombreEmisor || documentoData.nombre_emisor,
      RegimenFiscal: documentoData.regimenFiscalEmisor || documentoData.regimen_fiscal_emisor || "601"
    },
    
    Receptor: {
      Rfc: documentoData.rfcReceptor || documentoData.rfc_receptor,
      Nombre: documentoData.nombreReceptor || documentoData.nombre_receptor,
      DomicilioFiscalReceptor: obtenerCPReceptor(documentoData),
      RegimenFiscalReceptor: (documentoData.regimenFiscalReceptor || documentoData.regimen_fiscal_receptor) && 
                            (documentoData.regimenFiscalReceptor !== 'N/A' && documentoData.regimen_fiscal_receptor !== 'N/A')
        ? (documentoData.regimenFiscalReceptor || documentoData.regimen_fiscal_receptor)
        : "616", // Régimen fiscal por defecto para personas físicas
      UsoCFDI: (documentoData.usoCfdi || documentoData.uso_cfdi) && 
              (documentoData.usoCfdi !== 'N/A' && documentoData.uso_cfdi !== 'N/A')
        ? (documentoData.usoCfdi || documentoData.uso_cfdi)
        : "G03" // Gastos en general
    },
    
    Conceptos: construirConceptos(documentoData),
  };

  // Agregar impuestos solo si es tipo Ingreso
  if (esTipoIngreso && totalImpuestos > 0) {
    cfdi.Impuestos = {
      TotalImpuestosTrasladados: totalImpuestos.toFixed(2),
      Traslados: [{
        Base: subtotal.toFixed(2),
        Importe: totalImpuestos.toFixed(2),
        Impuesto: "002",
        TasaOCuota: "0.160000",
        TipoFactor: "Tasa"
      }]
    };
  }

  // ✅ Agregar complemento Carta Porte SOLO si tiene ubicaciones
  if (tieneUbicaciones) {
    console.log('✅ [CFDI] Agregando complemento CartaPorte (tiene ubicaciones)');
    cfdi.Complemento = construirComplementoCartaPorte(documentoData);
  } else {
    console.log('ℹ️ [CFDI] Factura sin complemento CartaPorte (sin ubicaciones)');
  }

  return cfdi;
}

function construirConceptos(data: any) {
  // Si vienen conceptos directos (de factura), usarlos
  if (data.conceptos && data.conceptos.length > 0) {
    return data.conceptos.map((c: any) => ({
      ClaveProdServ: c.clave_prod_serv || "78101800",
      Cantidad: (c.cantidad || 1).toString(),
      ClaveUnidad: c.clave_unidad || "E48",
      Descripcion: c.descripcion || "Servicio",
      ValorUnitario: (c.valor_unitario || 0).toFixed(4),
      Importe: (c.importe || 0).toFixed(2),
      ObjetoImp: "01"
    }));
  }

  // Si no hay mercancías, concepto genérico
  if (!data.mercancias || data.mercancias.length === 0) {
    return [{
      ClaveProdServ: "78101800",
      Cantidad: "1",
      ClaveUnidad: "E48",
      Descripcion: "Servicio de transporte de carga",
      ValorUnitario: "0",
      Importe: "0",
      ObjetoImp: "01"
    }];
  }

  // Usar mercancías de carta porte
  return data.mercancias.map((m: any) => ({
    ClaveProdServ: m.bienes_transp || "78101800",
    Cantidad: (m.cantidad || 1).toString(),
    ClaveUnidad: m.clave_unidad || "KGM",
    Descripcion: m.descripcion || "Mercancía",
    ValorUnitario: data.tipoCfdi === 'Ingreso' ? (m.valor_mercancia || 0).toFixed(4) : "0",
    Importe: data.tipoCfdi === 'Ingreso' ? (m.valor_mercancia || 0).toFixed(2) : "0",
    ObjetoImp: "01"
  }));
}

function construirComplementoCartaPorte(data: any) {
  const version = data.cartaPorteVersion || '3.1';
  const namespace = version === '3.1' ? 'cartaporte31' : 'cartaporte30';
  
  const complemento: any = {
    [namespace + ':CartaPorte']: {
      Version: version,
      IdCCP: data.cartaPorteId || generateCartaPorteId(),
      TranspInternac: data.transporteInternacional ? "Sí" : "No",
      
      Ubicaciones: construirUbicaciones(data),
      Mercancias: construirMercanciasComplemento(data),
      FiguraTransporte: construirFigurasTransporte(data)
    }
  };

  // Agregar Autotransporte si existe
  if (data.autotransporte) {
    complemento[namespace + ':CartaPorte'].Autotransporte = construirAutotransporte(data);
  }

  return complemento;
}

function construirUbicaciones(data: any) {
  // 🔐 ISO 27001 A.12.1 - Validación de estructura de datos
  // Defense in depth: validar antes de procesar
  
  let ubicacionesArray: any[] = [];
  
  // ✅ Buscar ubicaciones en múltiples fuentes con prioridad
  const ubicacionesSource = data.ubicaciones 
    || data.tracking_data?.ubicaciones 
    || data.cartaPorteData?.ubicaciones
    || data.facturaData?.tracking_data?.ubicaciones;
  
  // 🔒 Validación robusta con mensaje claro
  if (!ubicacionesSource) {
    console.error('❌ [construirUbicaciones] No se encontraron ubicaciones', {
      hasData: !!data,
      hasUbicaciones: !!data.ubicaciones,
      hasTrackingData: !!data.tracking_data,
      dataKeys: data ? Object.keys(data).filter(k => !k.includes('password')) : []
    });
    
    throw new Error(
      'Complemento de Carta Porte requiere ubicaciones. ' +
      'Proporcione al menos origen y destino en el campo "ubicaciones" o "tracking_data.ubicaciones"'
    );
  }
  
  // Manejar formato objeto {origen, destino, intermedias}
  if (ubicacionesSource && !Array.isArray(ubicacionesSource)) {
    console.log('📍 Procesando ubicaciones en formato objeto');
    if (ubicacionesSource.origen) {
      ubicacionesArray.push({
        ...ubicacionesSource.origen,
        tipo_ubicacion: 'Origen',
        tipo: 'Origen'
      });
    }
    
    if (ubicacionesSource.destino) {
      ubicacionesArray.push({
        ...ubicacionesSource.destino,
        tipo_ubicacion: 'Destino',
        tipo: 'Destino'
      });
    }
    
    // Agregar intermedias si existen
    if (ubicacionesSource.intermedias && Array.isArray(ubicacionesSource.intermedias)) {
      ubicacionesArray = [
        ubicacionesArray[0],
        ...ubicacionesSource.intermedias.map((u: any) => ({
          ...u,
          tipo_ubicacion: u.tipo_ubicacion || 'Paso Intermedio',
          tipo: u.tipo || 'Paso Intermedio'
        })),
        ubicacionesArray[1]
      ];
    }
    console.log(`✅ Procesadas ${ubicacionesArray.length} ubicaciones desde objeto`);
  } 
  // Manejar formato array
  else if (Array.isArray(ubicacionesSource)) {
    console.log('📍 Procesando ubicaciones en formato array');
    ubicacionesArray = ubicacionesSource;
    console.log(`✅ Procesadas ${ubicacionesArray.length} ubicaciones desde array`);
  }
  
  console.log(`🔍 ubicacionesArray final length: ${ubicacionesArray.length}`);
  
  // Validación: Al menos origen y destino
  if (ubicacionesArray.length < 2) {
    throw new Error('Se requieren al menos 2 ubicaciones (origen y destino)');
  }

  return ubicacionesArray.map((u: any, index: number) => {
    const tipoUbicacion = u.tipo_ubicacion || u.tipo || (index === 0 ? 'Origen' : index === ubicacionesArray.length - 1 ? 'Destino' : 'Paso Intermedio');
    
    return {
      TipoUbicacion: tipoUbicacion,
      IDUbicacion: u.id_ubicacion || u.idUbicacion || `${tipoUbicacion === 'Origen' ? 'OR' : tipoUbicacion === 'Destino' ? 'DE' : 'PI'}${String(index + 1).padStart(6, '0')}`,
      RFCRemitenteDestinatario: u.rfc || u.rfcRemitenteDestinatario || data.rfcReceptor,
      NombreRemitenteDestinatario: u.nombre || u.nombreRemitenteDestinatario || data.nombreReceptor,
      FechaHoraSalidaLlegada: normalizarFechaSAT(u.fecha_llegada_salida || u.fechaHoraSalidaLlegada || new Date()),
      DistanciaRecorrida: u.distancia_recorrida?.toString() || u.distanciaRecorrida?.toString() || "0",
      Domicilio: {
        Calle: u.domicilio?.calle || "Sin calle",
        CodigoPostal: u.domicilio?.codigo_postal || u.domicilio?.codigoPostal || "01000",
        Estado: u.domicilio?.estado || "CIUDAD DE MEXICO",
        Pais: u.domicilio?.pais || "MEX",
        Municipio: u.domicilio?.municipio || "CUAUHTEMOC"
      }
    };
  });
}

function construirMercanciasComplemento(data: any) {
  const pesoTotal = data.mercancias?.reduce((sum: number, m: any) => 
    sum + ((m.peso_bruto_total || m.peso_kg * m.cantidad) || 0), 0
  ) || 0;

  const cantidadTotal = data.mercancias?.reduce((sum: number, m: any) => 
    sum + (m.cantidad || 0), 0
  ) || 0;

  return {
    PesoBrutoTotal: pesoTotal.toFixed(2),
    UnidadPeso: "KGM",
    NumTotalMercancias: cantidadTotal.toString(),
    Mercancia: data.mercancias?.map((m: any) => ({
      BienesTransp: m.bienes_transp || "78101800",
      ClaveSTCC: m.clave_stcc || "0",
      Descripcion: m.descripcion || "Mercancía",
      Cantidad: (m.cantidad || 1).toString(),
      ClaveUnidad: m.clave_unidad || "KGM",
      Unidad: m.unidad || "Kilogramo",
      Dimensiones: m.dimensiones || undefined,
      MaterialPeligroso: m.material_peligroso ? "Sí" : "No",
      CveMaterialPeligroso: m.clave_material_peligroso || undefined,
      Embalaje: m.embalaje || undefined,
      DescripEmbalaje: m.descripcion_embalaje || undefined,
      PesoEnKg: (m.peso_bruto_total || m.peso_kg * m.cantidad || 0).toFixed(2),
      ValorMercancia: m.valor_mercancia?.toFixed(2) || "0",
      Moneda: m.moneda || "MXN"
    })) || []
  };
}

function construirAutotransporte(data: any) {
  const auto = data.autotransporte;
  
  return {
    PermSCT: auto.perm_sct || "TPAF01",
    NumPermisoSCT: auto.num_permiso_sct || "0000000",
    IdentificacionVehicular: {
      ConfigVehicular: auto.config_vehicular || "C2",
      PlacaVM: auto.placa_vm,
      AnioModeloVM: auto.anio_modelo?.toString() || new Date().getFullYear().toString()
    },
    Seguros: {
      AseguraRespCivil: auto.aseguradora_resp_civil || "Sin aseguradora",
      PolizaRespCivil: auto.poliza_resp_civil || "0000000"
    }
  };
}

function construirFigurasTransporte(data: any) {
  let figuras = data.figuras || [];
  
  // Si no hay figuras, intentar generarlas desde conductor en tracking_data
  if (figuras.length === 0 && data.tracking_data?.conductor) {
    const conductor = data.tracking_data.conductor;
    console.log('🚗 [FIGURAS] Generando figura desde conductor:', conductor);
    
    figuras = [{
      tipo_figura: "01", // Operador
      rfc_figura: conductor.rfc || "XAXX010101000",
      num_licencia: conductor.num_licencia || conductor.numLicencia,
      nombre_figura: conductor.nombre,
      domicilio: conductor.direccion || conductor.domicilio
    }];
  }
  
  // Si aún no hay figuras, crear una figura por defecto
  if (figuras.length === 0) {
    console.log('⚠️ [FIGURAS] No se encontraron figuras, usando figura por defecto');
    figuras = [{
      tipo_figura: "01",
      rfc_figura: "XAXX010101000",
      nombre_figura: "Operador No Especificado"
    }];
  }

  return figuras.map((f: any) => ({
    TipoFigura: f.tipo_figura || "01",
    RFCFigura: f.rfc_figura || "XAXX010101000",
    NumLicencia: f.num_licencia || undefined,
    NombreFigura: f.nombre_figura || "Sin nombre",
    Domicilio: f.domicilio ? {
      Calle: f.domicilio.calle || "Sin calle",
      CodigoPostal: f.domicilio.codigo_postal || f.domicilio.codigoPostal || "01000",
      Estado: f.domicilio.estado || "CIUDAD DE MEXICO",
      Pais: f.domicilio.pais || "MEX",
      Municipio: f.domicilio.municipio || "CUAUHTEMOC"
    } : undefined
  }));
}

function obtenerCPEmisor(data: any): string {
  // Buscar ubicaciones en múltiples ubicaciones posibles
  const ubicaciones = data.ubicaciones || data.tracking_data?.ubicaciones;
  let origen: any;
  
  if (!ubicaciones) {
    return data.cpEmisor || "01000";
  }
  
  // Manejar formato array
  if (Array.isArray(ubicaciones)) {
    origen = ubicaciones.find((u: any) => u.tipo_ubicacion === 'Origen' || u.tipo === 'Origen');
  }
  // Manejar formato objeto
  else if (ubicaciones.origen) {
    origen = ubicaciones.origen;
  }
  
  return origen?.domicilio?.codigo_postal || origen?.domicilio?.codigoPostal || data.cpEmisor || "01000";
}

function obtenerCPReceptor(data: any): string {
  // Buscar ubicaciones en múltiples ubicaciones posibles
  const ubicaciones = data.ubicaciones || data.tracking_data?.ubicaciones;
  let destino: any;
  
  if (!ubicaciones) {
    return data.cpReceptor || "01000";
  }
  
  // Manejar formato array
  if (Array.isArray(ubicaciones)) {
    destino = ubicaciones.find((u: any) => u.tipo_ubicacion === 'Destino' || u.tipo === 'Destino');
  }
  // Manejar formato objeto
  else if (ubicaciones.destino) {
    destino = ubicaciones.destino;
  }
  
  return destino?.domicilio?.codigo_postal || destino?.domicilio?.codigoPostal || data.cpReceptor || "01000";
}

function generateCartaPorteId(): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `CCC${timestamp}${random}`.substring(0, 36);
}

// Función para convertir JSON a XML string (optimizada con validaciones)
function jsonToXML(json: any): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>';
  
  // Función para escapar caracteres especiales XML
  function escapeXML(str: string): string {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  
  // Función para agregar atributo solo si existe y no está vacío
  function addAttr(name: string, value: any): string {
    if (value === undefined || value === null || value === '') return '';
    return ` ${name}="${escapeXML(String(value))}"`;
  }
  
  const { Version, Serie, Folio, Fecha, Sello, NoCertificado, Certificado, SubTotal, Moneda, Total, 
          TipoDeComprobante, Exportacion, LugarExpedicion, FormaPago, MetodoPago, 
          Emisor, Receptor, Conceptos, Impuestos, Complemento } = json;
  
  // Validar fecha antes de incluirla
  const fechaPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
  if (!fechaPattern.test(Fecha)) {
    console.error(`⚠️ Fecha con formato incorrecto detectada en XML: "${Fecha}"`);
  }
  
  // Construir elemento raíz con validaciones
  xml += '\n<cfdi:Comprobante';
  xml += ' xmlns:cfdi="http://www.sat.gob.mx/cfd/4"';
  xml += ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"';
  xml += ' xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd"';
  xml += addAttr('Version', Version);
  xml += addAttr('Serie', Serie);
  xml += addAttr('Folio', Folio);
  xml += addAttr('Fecha', Fecha);
  xml += addAttr('Sello', Sello);
  xml += addAttr('NoCertificado', NoCertificado);
  xml += addAttr('Certificado', Certificado);
  xml += addAttr('SubTotal', SubTotal);
  xml += addAttr('Moneda', Moneda);
  xml += addAttr('Total', Total);
  xml += addAttr('TipoDeComprobante', TipoDeComprobante);
  xml += addAttr('Exportacion', Exportacion);
  xml += addAttr('LugarExpedicion', LugarExpedicion);
  xml += addAttr('FormaPago', FormaPago);
  xml += addAttr('MetodoPago', MetodoPago);
  xml += '>';
  
  // Emisor
  if (Emisor) {
    xml += `\n  <cfdi:Emisor Rfc="${Emisor.Rfc}" Nombre="${escapeXML(Emisor.Nombre)}" RegimenFiscal="${Emisor.RegimenFiscal}"/>`;
  }
  
  // Receptor
  if (Receptor) {
    xml += `\n  <cfdi:Receptor Rfc="${Receptor.Rfc}" Nombre="${escapeXML(Receptor.Nombre)}" DomicilioFiscalReceptor="${Receptor.DomicilioFiscalReceptor}" RegimenFiscalReceptor="${Receptor.RegimenFiscalReceptor}" UsoCFDI="${Receptor.UsoCFDI}"/>`;
  }
  
  // Conceptos
  if (Conceptos && Array.isArray(Conceptos)) {
    xml += '\n  <cfdi:Conceptos>';
    Conceptos.forEach(c => {
      xml += `\n    <cfdi:Concepto ClaveProdServ="${c.ClaveProdServ}" Cantidad="${c.Cantidad}" ClaveUnidad="${c.ClaveUnidad}" Descripcion="${escapeXML(c.Descripcion)}" ValorUnitario="${c.ValorUnitario}" Importe="${c.Importe}" ObjetoImp="${c.ObjetoImp}"/>`;
    });
    xml += '\n  </cfdi:Conceptos>';
  }
  
  // Impuestos
  if (Impuestos && Impuestos.TotalImpuestosTrasladados) {
    xml += `\n  <cfdi:Impuestos TotalImpuestosTrasladados="${Impuestos.TotalImpuestosTrasladados}">`;
    if (Impuestos.Traslados) {
      xml += '\n    <cfdi:Traslados>';
      Impuestos.Traslados.forEach((t: any) => {
        xml += `\n      <cfdi:Traslado Base="${t.Base}" Importe="${t.Importe}" Impuesto="${t.Impuesto}" TasaOCuota="${t.TasaOCuota}" TipoFactor="${t.TipoFactor}"/>`;
      });
      xml += '\n    </cfdi:Traslados>';
    }
    xml += '\n  </cfdi:Impuestos>';
  }
  
  // Complemento CartaPorte (si existe)
  if (Complemento && Complemento.CartaPorte31) {
    xml += '\n  <cfdi:Complemento>';
    xml += '\n    <!-- CartaPorte complemento aquí -->';
    xml += '\n  </cfdi:Complemento>';
  }
  
  xml += '\n</cfdi:Comprobante>';
  
  return xml;
}

function mapearErrorSW(errorResponse: any) {
  const codigosError: Record<string, any> = {
    // Errores de Carta Porte 3.1
    'CCP215': {
      codigo: 'CCP215',
      mensaje: 'El RFC del operador no es válido',
      sugerencia: 'Verifica que el RFC en el catálogo de Operadores coincida con el del SAT.'
    },
    'CCP216': {
      codigo: 'CCP216',
      mensaje: 'La placa del vehículo no es válida',
      sugerencia: 'Verifica que la placa en el catálogo de Vehículos esté correcta.'
    },
    'CCP301': {
      codigo: 'CCP301',
      mensaje: 'El peso bruto total excede la capacidad del vehículo',
      sugerencia: 'Reduce la carga o asigna un vehículo con mayor capacidad.'
    },
    'CCP302': {
      codigo: 'CCP302',
      mensaje: 'El ID de la ubicación no cumple con el formato requerido',
      sugerencia: 'El ID debe tener formato OR000001 para origen y DE000001 para destino.'
    },
    
    // Errores generales de CFDI
    'CFDI304': {
      codigo: 'CFDI304',
      mensaje: 'El RFC del receptor no existe en el padrón del SAT',
      sugerencia: 'Verifica que el RFC del cliente esté correcto y dado de alta en el SAT.'
    },
    'CFDI305': {
      codigo: 'CFDI305',
      mensaje: 'El RFC del emisor no existe en el padrón del SAT',
      sugerencia: 'Verifica que tu RFC esté correcto y dado de alta en el SAT.'
    },
    
    // Errores de certificado
    'CERT301': {
      codigo: 'CERT301',
      mensaje: 'El certificado ha expirado',
      sugerencia: 'Debes renovar tu e.firma (FIEL) en el SAT.'
    },
    'CERT302': {
      codigo: 'CERT302',
      mensaje: 'El certificado no está registrado en SW',
      sugerencia: 'Debes subir tu certificado (.cer) y llave privada (.key) en el portal de SW.'
    }
  };

  // Intentar extraer código de error de diferentes formatos de respuesta
  let codigo = 'DESCONOCIDO';
  let mensajeOriginal = '';

  if (errorResponse.message) {
    mensajeOriginal = errorResponse.message;
    // Buscar código en el mensaje
    const match = mensajeOriginal.match(/[A-Z]{3,4}\d{3}/);
    if (match) {
      codigo = match[0];
    }
  } else if (errorResponse.messageDetail) {
    mensajeOriginal = errorResponse.messageDetail;
    const match = mensajeOriginal.match(/[A-Z]{3,4}\d{3}/);
    if (match) {
      codigo = match[0];
    }
  } else if (errorResponse.status === 'error') {
    mensajeOriginal = errorResponse.message || 'Error desconocido';
  }

  // Retornar error mapeado o genérico
  return codigosError[codigo] || {
    codigo: codigo,
    mensaje: mensajeOriginal || 'Error desconocido del PAC/SAT',
    sugerencia: 'Contacta a soporte técnico con el código de error.',
    detalles: errorResponse
  };
}

serve(handler);
