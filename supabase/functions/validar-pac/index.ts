
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
    const fiscalApiKey = Deno.env.get('FISCAL_API_KEY')!;

    if (!fiscalApiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'FISCAL_API_KEY no configurado - contacte al administrador'
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const { ambiente }: ValidacionRequest = await req.json();

    // Determinar URL según ambiente
    const statusUrl = ambiente === 'sandbox' 
      ? 'https://sandbox.fiscalapi.com/v1/status'
      : 'https://api.fiscalapi.com/v1/status';

    console.log(`🔍 Validando conexión PAC en ambiente: ${ambiente}`);

    // Validar conexión con FISCAL API
    const response = await fetch(statusUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${fiscalApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    const responseData = await response.text();
    console.log(`📡 Respuesta validación PAC (${response.status}):`, responseData);

    if (!response.ok) {
      let errorMessage = 'Error de conexión con PAC';
      
      try {
        const errorData = JSON.parse(responseData);
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = `HTTP ${response.status}: ${responseData}`;
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: `Error de conexión PAC: ${errorMessage}`
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    let statusData;
    try {
      statusData = JSON.parse(responseData);
    } catch {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Respuesta inválida del proveedor PAC'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    // Validar estructura de respuesta
    const isHealthy = statusData.status === 'ok' || statusData.status === 'active';
    
    return new Response(
      JSON.stringify({
        success: isHealthy,
        message: isHealthy 
          ? `Conexión PAC exitosa en ambiente ${ambiente}. Estado: ${statusData.status}`
          : `PAC no disponible. Estado: ${statusData.status}`,
        data: {
          ambiente,
          estado: statusData.status,
          proveedor: 'FISCAL_API',
          timestamp: new Date().toISOString(),
          detalles: statusData
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
