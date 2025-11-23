import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// 🔐 ISO 27001 A.10.1.1 - Usar token estático de SW
async function obtenerTokenSW(ambiente: 'sandbox' | 'production'): Promise<string> {
  const swToken = Deno.env.get('SW_TOKEN');
  
  if (!swToken) {
    console.error('❌ Token SW no configurado en secretos');
    throw new Error('SW_TOKEN no configurado. Agrega tu token de SmartWeb en los secretos.');
  }

  console.log('✅ Usando token estático de SW para ambiente:', ambiente);
  console.log('🔑 Token (primeros 10 chars):', swToken.substring(0, 10) + '...');
  
  return swToken;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1️⃣ OBTENER facturaId DEL BODY
    const requestBody = await req.json();
    const facturaId = requestBody?.facturaId;
    
    if (!facturaId) {
      throw new Error('facturaId es requerido en el body');
    }

    console.log('🎬 [Timbrar] Iniciando timbrado de factura:', facturaId);

    // 2️⃣ CREAR CLIENTE SUPABASE
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3️⃣ CARGAR FACTURA COMPLETA DESDE BD
    console.log('📄 [Timbrar] Cargando factura desde BD...');
    const { data: factura, error: facturaError } = await supabase
      .from('facturas')
      .select('*')
      .eq('id', facturaId)
      .single();

    if (facturaError || !factura) {
      throw new Error(`Factura no encontrada: ${facturaError?.message}`);
    }

    console.log('✅ [Timbrar] Factura cargada:', {
      id: factura.id,
      serie: factura.serie,
      folio: factura.folio,
      total: factura.total,
      rfc_emisor: factura.rfc_emisor,
      rfc_receptor: factura.rfc_receptor,
      regimen_fiscal_receptor: factura.regimen_fiscal_receptor
    });

    // 4️⃣ VALIDAR DATOS FISCALES OBLIGATORIOS
    if (!factura.rfc_emisor || !factura.nombre_emisor || !factura.regimen_fiscal_emisor) {
      throw new Error('❌ Faltan datos del EMISOR. Configura tu empresa en Configuración.');
    }

    if (!factura.rfc_receptor || !factura.nombre_receptor) {
      throw new Error('❌ Faltan datos del RECEPTOR (cliente).');
    }

    if (!factura.regimen_fiscal_receptor) {
      console.warn('⚠️ [Timbrar] regimen_fiscal_receptor es NULL, usando "616" (Sin obligaciones fiscales)');
    }

    // 5️⃣ CONSTRUIR PAYLOAD PARA SMARTWEB API (CFDI 4.0)
    const cfdiPayload = {
      Version: "4.0",
      Serie: factura.serie || 'ZS',
      Folio: factura.folio?.toString() || '1',
      Fecha: new Date(factura.fecha_expedicion).toISOString(),
      FormaPago: factura.forma_pago || '01', // Efectivo por defecto
      NoCertificado: "00000000000000000000",
      SubTotal: factura.subtotal || 0,
      Moneda: factura.moneda || 'MXN',
      Total: factura.total || 0,
      TipoDeComprobante: factura.tipo_comprobante || 'I',
      MetodoPago: factura.metodo_pago || 'PUE',
      LugarExpedicion: "64000", // Monterrey por defecto, ajustar según configuración
      
      Emisor: {
        Rfc: factura.rfc_emisor,
        Nombre: factura.nombre_emisor,
        RegimenFiscal: factura.regimen_fiscal_emisor || '601'
      },
      
      Receptor: {
        Rfc: factura.rfc_receptor,
        Nombre: factura.nombre_receptor,
        DomicilioFiscalReceptor: "64000", // Ajustar según cliente
        RegimenFiscalReceptor: factura.regimen_fiscal_receptor || '616',
        UsoCFDI: factura.uso_cfdi || 'G03'
      },
      
      Conceptos: [
        {
          ClaveProdServ: "78101800", // Servicios de transporte de carga
          Cantidad: 1,
          ClaveUnidad: "E48", // Unidad de servicio
          Unidad: "Servicio",
          Descripcion: factura.notas || "Servicio de transporte de carga",
          ValorUnitario: factura.subtotal || 0,
          Importe: factura.subtotal || 0,
          ObjetoImp: "02", // Sí objeto de impuestos
          Impuestos: {
            Traslados: [
              {
                Base: factura.subtotal || 0,
                Impuesto: "002", // IVA
                TipoFactor: "Tasa",
                TasaOCuota: "0.160000",
                Importe: factura.total_impuestos_trasladados || 0
              }
            ]
          }
        }
      ],
      
      Impuestos: {
        TotalImpuestosTrasladados: factura.total_impuestos_trasladados || 0,
        Traslados: [
          {
            Base: factura.subtotal || 0,
            Impuesto: "002",
            TipoFactor: "Tasa",
            TasaOCuota: "0.160000",
            Importe: factura.total_impuestos_trasladados || 0
          }
        ]
      }
    };

    console.log('📋 [Timbrar] Payload CFDI construido:', JSON.stringify(cfdiPayload, null, 2));

    // 6️⃣ AUTENTICAR CON SMARTWEB usando token estático
    const ambiente = Deno.env.get('AMBIENTE') || 'sandbox';
    console.log(`🔐 [Timbrar] Usando token estático de SW (${ambiente})...`);
    
    const swToken = await obtenerTokenSW(ambiente as 'sandbox' | 'production');

    const swUrl = ambiente === 'production' 
      ? 'https://services.sw.com.mx'
      : 'https://services.test.sw.com.mx';

    console.log('✅ [Timbrar] Token SW obtenido');

    // 7️⃣ TIMBRAR CON SMARTWEB - Usar endpoint correcto
    // SmartWeb requiere XML, no JSON - usando el endpoint de stamp
    console.log(`📤 [Timbrar] Enviando a SmartWeb: ${swUrl}/cfdi33/stamp/v4`);
    
    // Primero necesitamos convertir el JSON a XML (SmartWeb solo acepta XML)
    // Por ahora, retornamos un error indicando que se debe usar timbrar-con-sw
    throw new Error('Para timbrar con SmartWeb, usa la función timbrar-con-sw que maneja correctamente el formato XML requerido por SW. Este endpoint (timbrar-invoice) está deprecado.');

    const { cfdi, cadenaOriginalSAT, noCertificadoSAT, fechaTimbrado } = timbrarData.data;
    
    // Extraer UUID del XML
    const uuidMatch = cfdi.match(/UUID="([^"]+)"/);
    const uuid = uuidMatch ? uuidMatch[1] : null;

    if (!uuid) {
      throw new Error('No se pudo extraer el UUID del XML timbrado');
    }

    console.log('✅ [Timbrar] Factura timbrada exitosamente. UUID:', uuid);

    // 8️⃣ GUARDAR RESULTADO EN BD
    const { error: updateError } = await supabase
      .from('facturas')
      .update({
        status: 'timbrado',
        uuid_fiscal: uuid,
        xml_timbrado: cfdi,
        cadena_original: cadenaOriginalSAT,
        no_certificado_sat: noCertificadoSAT,
        fecha_timbrado: new Date(fechaTimbrado).toISOString(),
        metadata: {
          ...factura.metadata,
          timbrado_timestamp: new Date().toISOString(),
          ambiente: ambiente
        }
      })
      .eq('id', facturaId);

    if (updateError) {
      console.error('❌ [Timbrar] Error guardando resultado:', updateError);
      throw new Error(`Error guardando factura timbrada: ${updateError.message}`);
    }

    // 9️⃣ VINCULAR CARTA PORTE SI EXISTE (actualizar viaje)
    if (factura.viaje_id) {
      const { error: viajeError } = await supabase
        .from('viajes')
        .update({ 
          factura_id: facturaId,
          estado: 'programado'
        })
        .eq('id', factura.viaje_id);

      if (viajeError) {
        console.warn('⚠️ [Timbrar] Error actualizando viaje:', viajeError);
      }
    }

    console.log('✅ [Timbrar] Proceso completado exitosamente');

    return new Response(
      JSON.stringify({ 
        success: true, 
        uuid,
        message: 'Factura timbrada exitosamente',
        data: {
          uuid_fiscal: uuid,
          fecha_timbrado: fechaTimbrado,
          no_certificado_sat: noCertificadoSAT
        }
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error) {
    console.error('❌ [Timbrar] Error general:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido al timbrar'
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

serve(handler);
