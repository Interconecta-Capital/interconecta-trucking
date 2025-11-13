import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { facturaId } = await req.json();

    if (!facturaId) {
      return new Response(
        JSON.stringify({ error: 'facturaId es requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Autenticar usuario
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'No autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[generar-pdf-factura] Generando PDF para factura: ${facturaId}`);

    // Obtener datos de la factura
    const { data: factura, error: facturaError } = await supabaseClient
      .from('facturas')
      .select('*')
      .eq('id', facturaId)
      .eq('user_id', user.id)
      .single();

    if (facturaError || !factura) {
      throw new Error('Factura no encontrada');
    }

    // Si ya tiene PDF en Storage, devolverlo
    if (factura.pdf_url) {
      return new Response(
        JSON.stringify({
          success: true,
          pdf_url: factura.pdf_url,
          mensaje: 'PDF ya existente'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generar PDF usando el UUID del SAT
    const swToken = Deno.env.get('SW_TOKEN');
    const swUrl = Deno.env.get('SW_SANDBOX_URL') || 'https://services.test.sw.com.mx';

    if (!swToken) {
      throw new Error('SW_TOKEN no configurado');
    }

    if (!factura.uuid_fiscal) {
      throw new Error('La factura no tiene UUID fiscal. Debe estar timbrada primero.');
    }

    // Llamar al API de SW para obtener el PDF
    const response = await fetch(`${swUrl}/api/v3/pdf/uuid/${factura.uuid_fiscal}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${swToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generar-pdf-factura] Error del PAC:', errorText);
      throw new Error(`Error generando PDF: ${response.status}`);
    }

    const pdfArrayBuffer = await response.arrayBuffer();
    const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
    
    // Subir PDF a Storage
    const fileName = `factura_${factura.folio || factura.uuid_fiscal.slice(0, 8)}_${Date.now()}.pdf`;
    const filePath = `pdfs/${user.id}/${fileName}`;
    
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('facturas')
      .upload(filePath, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (uploadError) {
      console.error('[generar-pdf-factura] Error subiendo PDF:', uploadError);
      throw uploadError;
    }

    const { data: publicUrlData } = supabaseClient.storage
      .from('facturas')
      .getPublicUrl(filePath);

    // Actualizar factura con URL del PDF
    await supabaseClient
      .from('facturas')
      .update({ pdf_url: publicUrlData.publicUrl })
      .eq('id', facturaId);

    console.log('[generar-pdf-factura] PDF generado y guardado exitosamente');

    return new Response(
      JSON.stringify({
        success: true,
        pdf_url: publicUrlData.publicUrl,
        mensaje: 'PDF generado exitosamente'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[generar-pdf-factura] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error interno del servidor',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
