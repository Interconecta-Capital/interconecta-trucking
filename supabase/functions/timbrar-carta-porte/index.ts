/**
 * Edge Function: timbrar-carta-porte
 * 
 * Timbra Carta Porte CFDI 4.0 con Complemento Carta Porte 3.1
 * utilizando SmartWeb/Conecktia como PAC
 * 
 * ISO 27001 Compliance:
 * - A.14.2.5: Desarrollo seguro de sistemas - Validaciones exhaustivas
 * - A.12.4.1: Registro de eventos - Logging de todas las operaciones
 * - A.18.1.3: Protección de registros - Auditoría de timbrado
 * - A.9.4.1: Restricción de acceso - JWT requerido
 * 
 * @version 2.0.0
 * @author Interconecta Trucking System
 */

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Interface para request de timbrado de Carta Porte
 */
interface TimbrarCartaPorteRequest {
  cartaPorteId?: string;
  viajeId: string;
  ambiente?: 'sandbox' | 'production';
}

const handler = async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  console.log(`[${requestId}] 🚀 Iniciando timbrado de Carta Porte`);

  try {
    // 1. Validar autenticación
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No autorizado');
    }

    // 2. Parsear request body
    const body: TimbrarCartaPorteRequest = await req.json();
    const { cartaPorteId, viajeId, ambiente = 'sandbox' } = body;

    if (!viajeId) {
      throw new Error('viajeId es requerido');
    }

    console.log(`[${requestId}] 📋 Parámetros:`, { 
      cartaPorteId: cartaPorteId?.slice(0, 8), 
      viajeId: viajeId.slice(0, 8),
      ambiente 
    });

    // 3. Validar credenciales de SmartWeb
    const swToken = Deno.env.get('SW_TOKEN');
    const swUrl = ambiente === 'production' 
      ? Deno.env.get('SW_PRODUCTION_URL')
      : Deno.env.get('SW_SANDBOX_URL');
    
    if (!swToken || !swUrl) {
      console.error(`[${requestId}] ❌ Credenciales SW no configuradas`);
      throw new Error('Credenciales de SmartWeb no configuradas');
    }

    console.log(`[${requestId}] 🔐 SmartWeb configurado: ${ambiente} - ${swUrl}`);
    
    // 4. Inicializar Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Configuración de Supabase incompleta');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Obtener user_id del token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error(`[${requestId}] ❌ Error autenticación:`, authError);
      throw new Error('No autorizado');
    }

    console.log(`[${requestId}] 👤 Usuario autenticado: ${user.id.slice(0, 8)}`);
    
    // 5. Obtener datos completos del viaje usando RPC
    console.log(`[${requestId}] 🔍 Obteniendo datos del viaje...`);
    
    const { data: viajeCompleto, error: viajeError } = await supabase.rpc(
      'get_viaje_con_relaciones',
      { p_viaje_id: viajeId }
    );
    
    if (viajeError) {
      console.error(`[${requestId}] ❌ Error obteniendo viaje:`, viajeError);
      throw new Error(`Error al obtener viaje: ${viajeError.message}`);
    }

    if (!viajeCompleto) {
      throw new Error('Viaje no encontrado');
    }

    const viaje = viajeCompleto.viaje;
    const factura = viajeCompleto.factura;
    const mercancias = viajeCompleto.mercancias || [];
    const conductor = viajeCompleto.conductor;
    const vehiculo = viajeCompleto.vehiculo;
    const remolque = viajeCompleto.remolque;

    console.log(`[${requestId}] ✅ Viaje cargado:`, {
      id: viaje.id?.slice(0, 8),
      tipo_servicio: viaje.tracking_data?.tipo_servicio,
      estado: viaje.estado,
      mercancias: mercancias.length,
      tiene_factura: !!factura
    });
    
    // 6. Validación CRÍTICA: Para flete_pagado, factura debe estar timbrada
    const tipoServicio = viaje.tipo_servicio || viaje.tracking_data?.tipo_servicio;
    
    if (tipoServicio === 'flete_pagado') {
      console.log(`[${requestId}] 🔍 Validando factura (flete pagado)...`);
      
      if (!factura || factura.status !== 'timbrado') {
        console.error(`[${requestId}] ❌ Validación fallida: Factura no timbrada`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Para fletes pagados, la factura debe estar timbrada antes de timbrar la Carta Porte',
            code: 'FACTURA_NO_TIMBRADA'
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      console.log(`[${requestId}] ✅ Factura validada: ${factura.uuid_fiscal?.slice(0, 20)}...`);
    }
    
    // 7. Obtener Carta Porte
    let cartaPorte;
    
    if (cartaPorteId) {
      const { data, error } = await supabase
        .from('cartas_porte')
        .select('*')
        .eq('id', cartaPorteId)
        .maybeSingle();
      
      if (error) {
        console.error(`[${requestId}] ❌ Error buscando carta porte:`, error);
        throw new Error('Error al buscar Carta Porte');
      }
      
      cartaPorte = data;
    }
    
    if (!cartaPorte) {
      // Buscar por viaje_id
      const { data, error } = await supabase
        .from('cartas_porte')
        .select('*')
        .eq('viaje_id', viajeId)
        .maybeSingle();
      
      if (error) {
        console.error(`[${requestId}] ❌ Error buscando carta porte por viaje:`, error);
        throw new Error('Error al buscar Carta Porte');
      }
      
      cartaPorte = data;
    }

    if (!cartaPorte) {
      console.error(`[${requestId}] ❌ Carta Porte no encontrada`);
      throw new Error('No se encontró Carta Porte para este viaje. Debe generarla primero.');
    }

    console.log(`[${requestId}] 📄 Carta Porte encontrada:`, {
      id: cartaPorte.id?.slice(0, 8),
      folio: cartaPorte.folio,
      status: cartaPorte.status
    });
    
    // 8. Validar datos mínimos requeridos para Carta Porte
    const trackingData = viaje.tracking_data;
    
    if (!trackingData?.ubicaciones) {
      console.error(`[${requestId}] ❌ Sin ubicaciones en tracking_data`);
      throw new Error('El viaje no tiene ubicaciones configuradas');
    }

    const ubicaciones = Array.isArray(trackingData.ubicaciones) 
      ? trackingData.ubicaciones 
      : [trackingData.ubicaciones.origen, trackingData.ubicaciones.destino].filter(Boolean);

    if (ubicaciones.length < 2) {
      console.error(`[${requestId}] ❌ Ubicaciones insuficientes:`, ubicaciones.length);
      throw new Error('Se requieren al menos 2 ubicaciones (origen y destino)');
    }

    if (mercancias.length === 0) {
      console.error(`[${requestId}] ❌ Sin mercancías`);
      throw new Error('El viaje debe tener al menos una mercancía registrada');
    }

    if (!vehiculo) {
      console.error(`[${requestId}] ❌ Sin vehículo asignado`);
      throw new Error('El viaje debe tener un vehículo asignado');
    }

    if (!conductor) {
      console.error(`[${requestId}] ❌ Sin conductor asignado`);
      throw new Error('El viaje debe tener un conductor asignado');
    }
    
    console.log(`[${requestId}] ✅ Validaciones completadas`);
    
    // 9. Construir XML CFDI 4.0 con Complemento Carta Porte 3.1
    console.log(`[${requestId}] 🔨 Construyendo XML CFDI...`);
    
    const xmlCFDI = construirXMLCartaPorte(
      cartaPorte, 
      viaje, 
      factura,
      mercancias,
      ubicaciones,
      conductor,
      vehiculo,
      remolque
    );
    
    console.log(`[${requestId}] 📦 XML generado (${xmlCFDI.length} caracteres)`);
    
    // 10. Timbrar con SmartWeb
    console.log(`[${requestId}] 🌐 Enviando a SmartWeb...`);
    
    const swResponse = await fetch(`${swUrl}/cfdi33/stamp/v4`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${swToken}`,
        'Content-Type': 'application/jsontoxml',
      },
      body: JSON.stringify({ xml: xmlCFDI }),
    });

    const swResponseText = await swResponse.text();
    console.log(`[${requestId}] 📥 SmartWeb response (${swResponse.status}): ${swResponseText.slice(0, 200)}`);

    if (!swResponse.ok) {
      console.error(`[${requestId}] ❌ Error SmartWeb (${swResponse.status}):`, swResponseText);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Error del PAC (${swResponse.status}): ${swResponseText}`,
          code: 'PAC_ERROR'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        },
      );
    }

    const swData = JSON.parse(swResponseText);
    console.log(`[${requestId}] ✅ SmartWeb response OK`);
    
    // 11. Extraer UUID y XML timbrado
    const uuid = swData.data?.uuid;
    const xmlTimbrado = swData.data?.cfdi;
    
    if (!uuid || !xmlTimbrado) {
      console.error(`[${requestId}] ❌ Respuesta SmartWeb incompleta:`, { uuid: !!uuid, xml: !!xmlTimbrado });
      throw new Error('Respuesta de SmartWeb incompleta');
    }

    console.log(`[${requestId}] 💾 Guardando timbrado: ${uuid.slice(0, 20)}...`);
    
    // 12. Actualizar Carta Porte en DB
    const { error: updateError } = await supabase
      .from('cartas_porte')
      .update({
        status: 'timbrada',
        uuid_fiscal: uuid,
        xml_generado: xmlTimbrado,
        fecha_timbrado: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', cartaPorte.id);
    
    if (updateError) {
      console.error(`[${requestId}] ❌ Error actualizando carta porte:`, updateError);
      throw new Error(`Error al guardar: ${updateError.message}`);
    }

    // 13. Auditoría ISO 27001 A.12.4.1
    await supabase.from('security_audit_log').insert({
      event_type: 'cfdi_carta_porte_timbrado',
      severity: 'medium',
      description: `Carta Porte timbrada exitosamente`,
      metadata: {
        request_id: requestId,
        user_id: user.id,
        viaje_id: viajeId,
        carta_porte_id: cartaPorte.id,
        uuid: uuid,
        ambiente: ambiente,
        tipo_servicio: tipoServicio,
        mercancias_count: mercancias.length,
        timestamp: new Date().toISOString()
      }
    });

    console.log(`[${requestId}] ✅ Timbrado completado exitosamente`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: {
          uuid: uuid,
          carta_porte_id: cartaPorte.id,
          folio: cartaPorte.folio,
          xml_timbrado: xmlTimbrado,
          fecha_timbrado: new Date().toISOString(),
          ambiente: ambiente
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      },
    );
    
  } catch (error) {
    console.error(`[${requestId}] 💥 Error en timbrado:`, error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido',
        code: 'INTERNAL_ERROR'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      },
    );
  }
};

/**
 * Construye XML CFDI 4.0 con Complemento Carta Porte 3.1
 * Siguiendo estándares SAT y cumplimiento ISO 27001
 * 
 * @param cartaPorte - Datos de la carta porte
 * @param viaje - Datos del viaje
 * @param factura - Datos de la factura (si aplica)
 * @param mercancias - Array de mercancías
 * @param ubicaciones - Array de ubicaciones desde tracking_data
 * @param conductor - Datos del conductor
 * @param vehiculo - Datos del vehículo
 * @param remolque - Datos del remolque
 * @returns XML string CFDI 4.0
 */
function construirXMLCartaPorte(
  cartaPorte: any,
  viaje: any,
  factura: any,
  mercancias: any[],
  ubicaciones: any[],
  conductor: any,
  vehiculo: any,
  remolque: any
): string {
  const fecha = new Date().toISOString();
  const rfcEmisor = cartaPorte.rfc_emisor || factura?.rfc_emisor;
  const nombreEmisor = cartaPorte.nombre_emisor || factura?.nombre_emisor;
  const rfcReceptor = cartaPorte.rfc_receptor || factura?.rfc_receptor;
  const nombreReceptor = cartaPorte.nombre_receptor || factura?.nombre_receptor;
  
  // Calcular totales
  const subtotal = cartaPorte.subtotal || viaje.precio_cobrado || 0;
  const total = cartaPorte.total || viaje.precio_cobrado || 0;
  
  // Tipo de CFDI: T (Traslado) para Carta Porte independiente
  const tipoCfdi = 'T';
  
  // Procesar ubicaciones desde tracking_data
  const ubicacionesArray = Array.isArray(ubicaciones) 
    ? ubicaciones 
    : [ubicaciones.origen, ubicaciones.destino].filter(Boolean);
  
  // Calcular peso bruto total
  const pesoBrutoTotal = mercancias.reduce((sum, m) => sum + (m.peso_kg || 0), 0);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante 
  xmlns:cfdi="http://www.sat.gob.mx/cfd/4" 
  xmlns:cartaporte31="http://www.sat.gob.mx/CartaPorte31"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd http://www.sat.gob.mx/CartaPorte31 http://www.sat.gob.mx/sitio_internet/cfd/CartaPorte/CartaPorte31.xsd"
  Version="4.0"
  Serie="${cartaPorte.serie || 'CCP'}"
  Folio="${cartaPorte.folio || '001'}"
  Fecha="${fecha}"
  Sello=""
  FormaPago="99"
  NoCertificado=""
  Certificado=""
  SubTotal="${subtotal.toFixed(2)}"
  Moneda="XXX"
  Total="${total.toFixed(2)}"
  TipoDeComprobante="${tipoCfdi}"
  Exportacion="01"
  LugarExpedicion="${cartaPorte.domicilio_fiscal_emisor?.codigo_postal || '00000'}">
  
  <cfdi:Emisor 
    Rfc="${rfcEmisor}" 
    Nombre="${nombreEmisor}"
    RegimenFiscal="${cartaPorte.regimen_fiscal_emisor || '601'}" />
  
  <cfdi:Receptor 
    Rfc="${rfcReceptor}" 
    Nombre="${nombreReceptor}"
    DomicilioFiscalReceptor="${cartaPorte.domicilio_fiscal_receptor?.codigo_postal || '00000'}"
    RegimenFiscalReceptor="${cartaPorte.regimen_fiscal_receptor || '601'}"
    UsoCFDI="${cartaPorte.uso_cfdi || 'G03'}" />
  
  <cfdi:Conceptos>
    <cfdi:Concepto 
      ClaveProdServ="78101800" 
      Cantidad="1" 
      ClaveUnidad="E48"
      Descripcion="Servicio de transporte de carga"
      ValorUnitario="${subtotal.toFixed(2)}"
      Importe="${subtotal.toFixed(2)}"
      ObjetoImp="01" />
  </cfdi:Conceptos>
  
  <cfdi:Complemento>
    <cartaporte31:CartaPorte 
      Version="3.1"
      TranspInternac="${viaje.transporte_internacional ? 'Sí' : 'No'}"
      ${viaje.transporte_internacional ? `EntradaSalidaMerc="${viaje.entrada_salida_merc || 'Salida'}"` : ''}
      ${viaje.transporte_internacional ? `PaisOrigenDestino="${viaje.pais_origen_destino || 'USA'}"` : ''}
      TotalDistRec="${viaje.distancia_km || 0}">
      
      <cartaporte31:Ubicaciones>
        ${ubicacionesArray.map((ub: any, index: number) => {
          const domicilio = ub.domicilio || {};
          const fechaHora = ub.fecha_hora_salida_llegada || ub.fechaHoraSalidaLlegada || new Date().toISOString();
          
          return `
        <cartaporte31:Ubicacion
          TipoUbicacion="${ub.tipo || (index === 0 ? 'Origen' : 'Destino')}"
          ${ub.rfc_remitente_destinatario ? `RFCRemitenteDestinatario="${ub.rfc_remitente_destinatario}"` : ''}
          ${ub.nombre_remitente_destinatario ? `NombreRemitenteDestinatario="${ub.nombre_remitente_destinatario}"` : ''}
          FechaHoraSalidaLlegada="${fechaHora}"
          ${ub.distancia_recorrida ? `DistanciaRecorrida="${ub.distancia_recorrida}"` : ''}>
          
          <cartaporte31:Domicilio
            ${domicilio.calle ? `Calle="${domicilio.calle}"` : ''}
            ${domicilio.numero_exterior || domicilio.numeroExterior ? `NumeroExterior="${domicilio.numero_exterior || domicilio.numeroExterior}"` : ''}
            ${domicilio.colonia ? `Colonia="${domicilio.colonia}"` : ''}
            Municipio="${domicilio.municipio || 'Desconocido'}"
            Estado="${domicilio.estado || 'Desconocido'}"
            Pais="${domicilio.pais || 'MEX'}"
            CodigoPostal="${domicilio.codigo_postal || domicilio.codigoPostal || '00000'}" />
        </cartaporte31:Ubicacion>`;
        }).join('\n')}
      </cartaporte31:Ubicaciones>
      
      <cartaporte31:Mercancias
        PesoBrutoTotal="${pesoBrutoTotal.toFixed(3)}"
        UnidadPeso="KGM"
        NumTotalMercancias="${mercancias.length}">
        
        ${mercancias.map((m: any) => `
        <cartaporte31:Mercancia
          BienesTransp="${m.bienes_transp || '01010101'}"
          Descripcion="${m.descripcion || 'Mercancía general'}"
          Cantidad="${m.cantidad || 1}"
          ClaveUnidad="${m.clave_unidad || 'KGM'}"
          ${m.material_peligroso ? `MaterialPeligroso="Sí"` : ''}
          PesoEnKg="${(m.peso_kg || 0).toFixed(3)}"
          ${m.valor_mercancia ? `ValorMercancia="${m.valor_mercancia.toFixed(2)}"` : ''}
          Moneda="${m.moneda || 'MXN'}" />
        `).join('\n')}
        
        <cartaporte31:Autotransporte
          PermSCT="${vehiculo.perm_sct || 'TPAF01'}"
          NumPermisoSCT="${vehiculo.num_permiso_sct || 'N/A'}">
          
          <cartaporte31:IdentificacionVehicular
            ConfigVehicular="${vehiculo.config_vehicular || 'C2'}"
            PlacaVM="${vehiculo.placa}"
            AnioModeloVM="${vehiculo.anio || new Date().getFullYear()}" />
          
          ${remolque ? `
          <cartaporte31:Remolques>
            <cartaporte31:Remolque
              SubTipoRem="${remolque.subtipo_rem || 'CTR001'}"
              Placa="${remolque.placa}" />
          </cartaporte31:Remolques>
          ` : ''}
          
          <cartaporte31:Seguros
            AseguraRespCivil="${vehiculo.asegura_resp_civil || 'N/A'}"
            PolizaRespCivil="${vehiculo.poliza_resp_civil || 'N/A'}"
            ${vehiculo.asegura_carga ? `AseguraCarga="${vehiculo.asegura_carga}"` : ''}
            ${vehiculo.poliza_carga ? `PolizaCarga="${vehiculo.poliza_carga}"` : ''}
            ${vehiculo.asegura_med_ambiente ? `AseguraMedAmbiente="${vehiculo.asegura_med_ambiente}"` : ''}
            ${vehiculo.poliza_med_ambiente ? `PolizaMedAmbiente="${vehiculo.poliza_med_ambiente}"` : ''} />
        </cartaporte31:Autotransporte>
      </cartaporte31:Mercancias>
      
      <cartaporte31:FiguraTransporte>
        <cartaporte31:TiposFigura
          TipoFigura="01"
          ${conductor.rfc ? `RFCFigura="${conductor.rfc}"` : ''}
          ${conductor.num_licencia ? `NumLicencia="${conductor.num_licencia}"` : ''}
          NombreFigura="${conductor.nombre || 'Operador'}"
          ${conductor.num_reg_id_trib ? `NumRegIdTribFigura="${conductor.num_reg_id_trib}"` : ''}
          ${conductor.residencia_fiscal ? `ResidenciaFiscalFigura="${conductor.residencia_fiscal}"` : ''}>
          
          ${conductor.direccion ? `
          <cartaporte31:Domicilio
            Calle="${conductor.direccion.calle || 'N/A'}"
            Municipio="${conductor.direccion.municipio || 'N/A'}"
            Estado="${conductor.direccion.estado || 'N/A'}"
            Pais="${conductor.direccion.pais || 'MEX'}"
            CodigoPostal="${conductor.direccion.codigo_postal || '00000'}" />
          ` : ''}
        </cartaporte31:TiposFigura>
      </cartaporte31:FiguraTransporte>
    </cartaporte31:CartaPorte>
  </cfdi:Complemento>
</cfdi:Comprobante>`;
}

serve(handler);
