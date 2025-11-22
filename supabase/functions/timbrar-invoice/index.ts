import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ✅ SW/CONECKTIA: Obtener credenciales desde Vault (ISO 27001 A.10.1)
    const swToken = Deno.env.get('SW_TOKEN');
    const ambiente = Deno.env.get('AMBIENTE') || 'sandbox';
    
    if (!swToken) {
      console.error('[Timbrar] SW_TOKEN no configurado en Vault');
      throw new Error('No se pudo obtener credenciales del PAC desde Vault');
    }

    console.log(`[Timbrar] Usando PAC SmartWeb/Conecktia en modo: ${ambiente}`);

    const invoiceData = await req.json();

    // URL según ambiente (desde secretos del Vault)
    const swUrl = ambiente === 'production' 
      ? Deno.env.get('SW_PRODUCTION_URL') || 'https://api.smartweb.com.mx'
      : Deno.env.get('SW_SANDBOX_URL') || 'https://sandbox.smartweb.com.mx';

    console.log(`[Timbrar] Endpoint: ${swUrl}/v3/cfdi33/issue/json/v4`);

    const response = await fetch(`${swUrl}/v3/cfdi33/issue/json/v4`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${swToken}`,
        'Content-Type': 'application/jsontoxml',
      },
      body: JSON.stringify(invoiceData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Timbrar] Error de Conecktia:', errorText);
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
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } },
    );
  }
};

serve(handler);
