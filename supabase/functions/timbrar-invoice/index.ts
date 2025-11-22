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
    // ✅ CONECKTIA: Obtener credenciales desde environment variables
    const conecktiaToken = Deno.env.get('CONECKTIA_API_TOKEN');
    const conecktiaModoSandbox = Deno.env.get('CONECKTIA_SANDBOX') === 'true';

    if (!conecktiaToken) {
      console.error('[Timbrar] CONECKTIA_API_TOKEN no configurada');
      throw new Error('No se pudo obtener credenciales del PAC');
    }

    console.log(`[Timbrar] Usando Conecktia en modo: ${conecktiaModoSandbox ? 'SANDBOX' : 'PRODUCCIÓN'}`);

    const invoiceData = await req.json();

    // URL de Conecktia según el modo
    const conecktiaUrl = conecktiaModoSandbox
      ? 'https://sandbox.conecktia.com/api/v1/cfdi/stamp'
      : 'https://api.conecktia.com/api/v1/cfdi/stamp';

    const response = await fetch(conecktiaUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${conecktiaToken}`,
        'Content-Type': 'application/json',
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
