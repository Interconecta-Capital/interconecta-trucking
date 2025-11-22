import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SEGURO: Obtener API key desde Edge Function environment (ISO 27001 A.10.1)
    const fiscalApiKey = Deno.env.get('FISCAL_API_KEY');

    if (!fiscalApiKey) {
      console.error('[Timbrar] FISCAL_API_KEY no configurada en Edge Functions');
      throw new Error('No se pudo obtener credenciales del PAC');
    }

    console.log('[Timbrar] API Key obtenida exitosamente desde environment variables');

    const invoiceData = await req.json();

    const response = await fetch('https://api.fiscalapi.com/v1/cfdi/stamp', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${fiscalApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return new Response(
        JSON.stringify({ success: false, error: errorText }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
      );
    }

    const data = await response.json();
    return new Response(
      JSON.stringify({ success: true, data }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    );
  }
};

serve(handler);
