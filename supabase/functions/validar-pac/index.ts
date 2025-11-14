
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
    // Obtener credenciales de Conectia (SmartWeb)
    const swToken = Deno.env.get('SW_TOKEN');
    const swSandboxUrl = Deno.env.get('SW_SANDBOX_URL');
    const swProductionUrl = Deno.env.get('SW_PRODUCTION_URL');

    if (!swToken || !swSandboxUrl || !swProductionUrl) {
      console.error('Credenciales de Conectia (SW) no configuradas');
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Configuración de PAC Conectia incompleta. Verifique SW_TOKEN, SW_SANDBOX_URL y SW_PRODUCTION_URL'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const { ambiente }: ValidacionRequest = await req.json();

    console.log(`🔍 Validando conexión con Conectia (SmartWeb) en ambiente: ${ambiente}`);

    const swUrl = ambiente === 'production' ? swProductionUrl : swSandboxUrl;
    const healthEndpoint = `${swUrl}/ping`;

    // Verificar conectividad con Conectia API
    const swResponse = await fetch(healthEndpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${swToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!swResponse.ok) {
      console.error(`❌ Error de conexión con Conectia: HTTP ${swResponse.status}`);
      return new Response(
        JSON.stringify({
          success: false,
          message: `Error de conexión PAC Conectia: HTTP ${swResponse.status}`
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const responseText = await swResponse.text();
    console.log('✅ Respuesta de Conectia:', responseText);

    let healthData;
    try {
      healthData = responseText ? JSON.parse(responseText) : { status: 'ok' };
    } catch {
      healthData = { status: 'ok', response: responseText };
    }

    console.log('✅ Conexión con Conectia (SmartWeb) válida');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Conexión PAC Conectia verificada exitosamente',
        data: {
          pac: 'Conectia (SmartWeb)',
          ambiente,
          status: 'online',
          url: swUrl,
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
