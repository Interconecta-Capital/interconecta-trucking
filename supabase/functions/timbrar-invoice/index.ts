import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
    console.log('📨 [Timbrar] Request recibido:', {
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
      hasBody: req.body !== null
    });

    let requestBody;
    let facturaId;
    
    try {
      const bodyText = await req.text();
      console.log('📋 [Timbrar] Body crudo recibido:', bodyText);
      
      if (!bodyText || bodyText.trim() === '') {
        throw new Error('Request body está vacío');
      }
      
      requestBody = JSON.parse(bodyText);
      facturaId = requestBody.facturaId;
      
      console.log('✅ [Timbrar] Body parseado correctamente:', requestBody);
    } catch (parseError) {
      console.error('❌ [Timbrar] Error parseando JSON:', parseError);
      throw new Error(`Body inválido: ${parseError instanceof Error ? parseError.message : 'Error desconocido'}`);
    }
    
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
      .select(`
        *,
        viaje:viajes(
          id,
          origen,
          destino,
          tracking_data
        )
      `)
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

    // 6️⃣ AUTENTICAR CON SMARTWEB
    const swUser = Deno.env.get('SW_USER');
    const swPassword = Deno.env.get('SW_PASSWORD');
    const ambiente = Deno.env.get('AMBIENTE') || 'sandbox';
    
    if (!swUser || !swPassword) {
      throw new Error('❌ Credenciales de SmartWeb no configuradas en Vault');
    }

    const swUrl = ambiente === 'production' 
      ? 'https://api.smartweb.com.mx'
      : 'https://services.test.sw.com.mx';

    console.log(`🔐 [Timbrar] Autenticando con SmartWeb (${ambiente})...`);
    
    const authResponse = await fetch(`${swUrl}/security/authenticate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: swUser, password: swPassword }),
    });

    if (!authResponse.ok) {
      const authError = await authResponse.text();
      throw new Error(`Error autenticando con SmartWeb: ${authError}`);
    }

    const authData = await authResponse.json();
    const token = authData.data?.token;

    if (!token) {
      throw new Error('No se recibió token de SmartWeb');
    }

    console.log('✅ [Timbrar] Token SmartWeb obtenido');

    // 7️⃣ TIMBRAR CON SMARTWEB
    console.log(`📤 [Timbrar] Enviando a SmartWeb: ${swUrl}/v3/cfdi40/issue/json/v4`);
    
    const timbrarResponse = await fetch(`${swUrl}/v3/cfdi40/issue/json/v4`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/jsontoxml',
      },
      body: JSON.stringify(cfdiPayload),
    });

    const timbrarData = await timbrarResponse.json();

    if (!timbrarResponse.ok || !timbrarData.data) {
      console.error('❌ [Timbrar] Error de SmartWeb:', JSON.stringify(timbrarData, null, 2));
      throw new Error(timbrarData.message || 'Error al timbrar con SmartWeb');
    }

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
    if (factura.viaje?.id) {
      const { error: viajeError } = await supabase
        .from('viajes')
        .update({ 
          factura_id: facturaId,
          estado: 'programado'
        })
        .eq('id', factura.viaje.id);

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
