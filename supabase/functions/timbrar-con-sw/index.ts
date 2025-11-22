import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { TimbrarCartaPorteSchema, createValidationErrorResponse } from "../_shared/validation.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

const handler = async (req: Request): Promise<Response> => {
  // 🔐 CORS: Manejar preflight requests SIEMPRE primero
  if (req.method === 'OPTIONS') {
    console.log('✅ [CORS] Preflight request recibido');
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  console.log(`📡 [${new Date().toISOString()}] Request recibido: ${req.method} ${req.url}`);

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
    console.log(`🚀 [${new Date().toISOString()}] Timbrando ${tipoDocumento} para usuario ${user.id.substring(0, 8)}... en ${ambiente}`, {
      documentoId: documentoId?.substring(0, 8),
      esFacturaConCartaPorte,
      hasUbicaciones: esFacturaConCartaPorte
    });
    
    // 🔐 ISO 27001 A.12.4.1 - Validación de integridad de datos
    // Validar estructura según tipo de documento
    if (esFacturaConCartaPorte) {
      const dataSource = cartaPorteData || facturaData;
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

    // 3. Obtener credenciales de SW con limpieza mejorada
    const rawToken = Deno.env.get('SW_TOKEN');
    const swUrl = ambiente === 'production' 
      ? Deno.env.get('SW_PRODUCTION_URL')
      : Deno.env.get('SW_SANDBOX_URL');

    if (!rawToken || !swUrl) {
      throw new Error('Credenciales de SW no configuradas en Vault');
    }

    // 🔐 Limpiar token: eliminar TODOS los espacios/tabs/newlines
    const swToken = rawToken.replace(/\s+/g, '').trim();
    
    // 🔍 Validar formato JWT (debe tener 3 partes separadas por puntos)
    const jwtParts = swToken.split('.');
    if (jwtParts.length !== 3) {
      console.error('❌ Token inválido - partes JWT:', jwtParts.length);
      throw new Error('Token JWT inválido (debe tener 3 partes separadas por puntos)');
    }
    
    // 📊 Logs de debugging del token
    console.log('🔑 Token limpiado:');
    console.log('  - Longitud total:', swToken.length);
    console.log('  - Primeros 30 chars:', swToken.substring(0, 30) + '...');
    console.log('  - Últimos 30 chars:', '...' + swToken.substring(swToken.length - 30));
    console.log('  - Partes JWT:', jwtParts.map(p => p.length));
    console.log('  - Ambiente:', ambiente);
    console.log('  - URL SW:', swUrl);

    // 4. Construir el CFDI JSON según formato de SW
    const cfdiJson = construirCFDIJson(cartaPorteData || facturaData, esFacturaConCartaPorte);

    console.log('📦 Enviando CFDI a SW:', JSON.stringify(cfdiJson).substring(0, 500));

    // 5. Llamar a la API de SW
    const swResponse = await fetch(`${swUrl}/v3/cfdi33/issue/json/v4`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${swToken}`,
        'Content-Type': 'application/jsontoxml',
      },
      body: JSON.stringify(cfdiJson),
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
    
    return new Response(JSON.stringify(errorResponse), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
};

// Función para construir el JSON del CFDI según formato de SW
function construirCFDIJson(cartaPorteData: any, requiereComplementoCartaPorte: boolean = false) {
  const fecha = new Date().toISOString().replace('Z', '');
  const esTipoIngreso = cartaPorteData.tipoCfdi === 'Ingreso';
  
  // Calcular subtotal y total
  let subtotal = 0;
  let totalImpuestos = 0;
  
  // Calcular basado en conceptos directos (factura) o mercancías (carta porte)
  if (cartaPorteData.conceptos && cartaPorteData.conceptos.length > 0) {
    // Factura con conceptos directos
    subtotal = cartaPorteData.conceptos.reduce((sum: number, c: any) => sum + (c.importe || 0), 0);
  } else if (esTipoIngreso && cartaPorteData.mercancias) {
    // Carta porte con mercancías
    subtotal = cartaPorteData.mercancias.reduce((sum: number, m: any) => 
      sum + (m.valor_mercancia || 0), 0
    );
  }
  
  if (esTipoIngreso && subtotal > 0) {
    totalImpuestos = subtotal * 0.16; // IVA 16%
  }
  
  // 🔐 ISO 27001 A.12.2.1 - Protección contra procesamiento incorrecto
  // Solo verificar ubicaciones si se requiere complemento de CartaPorte
  const tieneUbicaciones = requiereComplementoCartaPorte && (() => {
    const ubicaciones = cartaPorteData.ubicaciones || cartaPorteData.tracking_data?.ubicaciones;
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
    Serie: cartaPorteData.serie || "CP",
    Folio: cartaPorteData.folio || "1",
    Fecha: fecha,
    Sello: "", // SW lo genera automáticamente
    NoCertificado: "", // SW lo genera automáticamente
    Certificado: "", // SW lo genera automáticamente
    SubTotal: subtotal.toFixed(2),
    Moneda: cartaPorteData.moneda || "MXN",
    Total: (subtotal + totalImpuestos).toFixed(2),
    TipoDeComprobante: esTipoIngreso ? "I" : "T",
    Exportacion: cartaPorteData.exportacion || "01",
    LugarExpedicion: obtenerCPEmisor(cartaPorteData),
    FormaPago: esTipoIngreso ? (cartaPorteData.formaPago || "01") : undefined,
    MetodoPago: esTipoIngreso ? (cartaPorteData.metodoPago || "PUE") : undefined,
    
    Emisor: {
      Rfc: cartaPorteData.rfcEmisor,
      Nombre: cartaPorteData.nombreEmisor,
      RegimenFiscal: cartaPorteData.regimenFiscalEmisor || "601"
    },
    
    Receptor: {
      Rfc: cartaPorteData.rfcReceptor,
      Nombre: cartaPorteData.nombreReceptor,
      DomicilioFiscalReceptor: obtenerCPReceptor(cartaPorteData),
      RegimenFiscalReceptor: cartaPorteData.regimenFiscalReceptor || "601",
      UsoCFDI: cartaPorteData.usoCfdi || "S01"
    },
    
    Conceptos: construirConceptos(cartaPorteData),
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
    cfdi.Complemento = construirComplementoCartaPorte(cartaPorteData);
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
      FechaHoraSalidaLlegada: u.fecha_llegada_salida || u.fechaHoraSalidaLlegada || new Date().toISOString(),
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

// Mapeo de errores de SW/SAT
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
