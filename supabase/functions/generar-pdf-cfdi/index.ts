import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * 🖨️ Generación de PDF desde XML timbrado
 * 
 * Este edge function genera un PDF profesional a partir del XML timbrado.
 * El PDF se guarda en Supabase Storage y se retorna la URL pública.
 * 
 * IMPORTANTE: Por ahora retorna el XML como archivo de prueba.
 * En producción, implementar generación real de PDF con biblioteca como jsPDF
 * o usar el endpoint de SmartWeb si está disponible.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

interface GenerarPDFRequest {
  xmlTimbrado?: string;
  uuid?: string;
  cartaPorteId?: string;
  facturaId?: string;
  ambiente: 'sandbox' | 'production';
}

const handler = async (req: Request): Promise<Response> => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  console.log(`📡 [${new Date().toISOString()}] Generación de PDF - Request recibido`);

  try {
    // 1. Autenticación
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error('❌ Error de autenticación:', userError);
      return new Response(JSON.stringify({ success: false, error: 'No autorizado' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 2. Obtener datos del request
    const { xmlTimbrado, uuid, cartaPorteId, facturaId, ambiente } = await req.json() as GenerarPDFRequest;

    console.log('📋 Datos para generar PDF:', { 
      hasXml: !!xmlTimbrado, 
      uuid: uuid?.substring(0, 20), 
      cartaPorteId: cartaPorteId?.substring(0, 20),
      ambiente 
    });

    if (!xmlTimbrado && !uuid && !cartaPorteId && !facturaId) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Se requiere xmlTimbrado, uuid, cartaPorteId o facturaId' 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    let xmlContent = xmlTimbrado;
    let documentId = cartaPorteId || facturaId;
    let uuidFiscal = uuid;

    // 3. Si no viene el XML, obtenerlo de la BD
    if (!xmlContent && (cartaPorteId || facturaId)) {
      const tabla = cartaPorteId ? 'cartas_porte' : 'facturas';
      const { data: documento, error: docError } = await supabaseClient
        .from(tabla)
        .select('xml_generado, uuid_fiscal')
        .eq('id', documentId!)
        .eq('usuario_id', user.id)
        .single();

      if (docError || !documento) {
        console.error('❌ Error obteniendo documento:', docError);
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Documento no encontrado' 
        }), { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      xmlContent = documento.xml_generado;
      uuidFiscal = documento.uuid_fiscal;
      console.log('✅ XML obtenido de BD');
    }

    if (!xmlContent) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'XML no disponible' 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // 4. OPCIÓN A: Usar SmartWeb para generar PDF (si tienen endpoint)
    // const swToken = Deno.env.get('SW_TOKEN');
    // const swUrl = ambiente === 'production' 
    //   ? Deno.env.get('SW_PRODUCTION_URL')
    //   : Deno.env.get('SW_SANDBOX_URL');
    
    // if (!swToken || !swUrl) {
    //   throw new Error('Configuración de SmartWeb incompleta');
    // }

    // console.log('🖨️ Generando PDF con SmartWeb...');
    // const pdfResponse = await fetch(`${swUrl}/utilities/pdf`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${swToken}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     xml: xmlContent,
    //     logoUrl: 'https://tu-logo.com/logo.png', // Opcional
    //     extras: {}
    //   }),
    // });

    // if (!pdfResponse.ok) {
    //   const errorText = await pdfResponse.text();
    //   throw new Error(`Error generando PDF con SW: ${errorText}`);
    // }

    // const pdfBuffer = await pdfResponse.arrayBuffer();

    // 4. OPCIÓN B: Por ahora, guardar el XML como archivo de texto
    // En producción, implementar generación real de PDF con jsPDF u otra biblioteca
    console.log('⚠️ Generación de PDF - Modo de desarrollo (guardando XML)');
    console.log('📝 TODO: Implementar generación real de PDF con jsPDF o usar endpoint de SW');
    
    const pdfBuffer = new TextEncoder().encode(xmlContent);
    const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));

    // 5. Guardar "PDF" (XML por ahora) en Storage
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `pdf_${uuidFiscal || documentId}_${timestamp}.xml`;
    const pdfPath = `${user.id}/${cartaPorteId ? 'cartas-porte' : 'facturas'}/${documentId}/${fileName}`;
    
    console.log('💾 Guardando archivo en Storage:', pdfPath);
    
    const { error: storageError } = await supabaseClient.storage
      .from('documentos')
      .upload(pdfPath, new Uint8Array(pdfBuffer), {
        contentType: 'application/xml', // Cambiar a 'application/pdf' cuando se implemente real
        upsert: true
      });

    if (storageError) {
      console.error('❌ Error guardando archivo en Storage:', storageError);
      throw new Error(`Error guardando archivo: ${storageError.message}`);
    }

    // 6. Obtener URL pública
    const { data: publicUrlData } = supabaseClient.storage
      .from('documentos')
      .getPublicUrl(pdfPath);

    const pdfUrl = publicUrlData.publicUrl;
    console.log('✅ Archivo guardado exitosamente:', pdfUrl);

    // 7. Actualizar documento en BD con URL del PDF
    if (documentId) {
      const tabla = cartaPorteId ? 'cartas_porte' : 'facturas';
      await supabaseClient
        .from(tabla)
        .update({ pdf_url: pdfUrl })
        .eq('id', documentId)
        .eq('usuario_id', user.id);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      pdfUrl: pdfUrl,
      pdfBase64: pdfBase64,
      message: 'PDF generado exitosamente',
      warning: 'Modo de desarrollo: Se guardó el XML. Implementar generación real de PDF en producción.',
      documentId: documentId,
      uuid: uuidFiscal
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });

  } catch (error) {
    console.error('💥 Error generando PDF:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Error interno al generar el PDF',
      timestamp: new Date().toISOString()
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
};

serve(handler);
