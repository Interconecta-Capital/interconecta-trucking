
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
    const fiscalApiKey = Deno.env.get('FISCAL_API_KEY')!;

    // Validar conexión con FISCAL API
    const response = await fetch('https://api.fiscalapi.com/v1/status', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${fiscalApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Error de conexión con FISCAL API'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const statusData = await response.json();

    return new Response(
      JSON.stringify({
        success: true,
        message: `Conexión exitosa con FISCAL API. Estado: ${statusData.status}`,
        data: statusData
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Error validando PAC:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: `Error interno: ${error instanceof Error ? error.message : 'Error desconocido'}`
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
