
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ValidacionRequest {
  ambiente: 'sandbox' | 'production';
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const fiscalApiKey = Deno.env.get('FISCAL_API_KEY');

    if (!fiscalApiKey) {
      console.error('FISCAL_API_KEY no configurado');
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Configuración de PAC incompleta'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const { ambiente }: ValidacionRequest = await req.json();

    console.log(`🔍 Validando conexión PAC en ambiente: ${ambiente}`);

    const apiUrl = ambiente === 'sandbox' 
      ? 'https://sandbox.fiscalapi.com/v1/health'
      : 'https://api.fiscalapi.com/v1/health';

    // Verificar conectividad con FISCAL API
    const fiscalResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${fiscalApiKey}`,
        'Accept': 'application/json',
      },
    });

    if (!fiscalResponse.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Error de conexión PAC: HTTP ${fiscalResponse.status}`
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const healthData = await fiscalResponse.json();

    console.log('✅ Conexión PAC válida');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Conexión PAC verificada exitosamente',
        data: {
          pac: 'FISCAL_API',
          ambiente,
          status: 'online',
          timestamp: new Date().toISOString(),
          ...healthData
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('💥 Error validando PAC:', error);
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
