import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificarPACRequest {
  ambiente?: 'test' | 'production';
}

interface VerificarPACResponse {
  success: boolean;
  configurado: boolean;
  ambiente: string;
  error?: string;
  detalles?: {
    fiscal_api_key_presente: boolean;
    url_pac: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔐 Verificando configuración de PAC...');

    // Obtener API key del PAC (FISCAL_API_KEY)
    const fiscalApiKey = Deno.env.get('FISCAL_API_KEY');

    if (!fiscalApiKey) {
      console.warn('⚠️ FISCAL_API_KEY no configurado');
      return new Response(
        JSON.stringify({
          success: false,
          configurado: false,
          ambiente: 'no_configurado',
          error: 'FISCAL_API_KEY no configurado. Por favor, configure la clave en Configuración > Secrets.',
          detalles: {
            fiscal_api_key_presente: false,
            url_pac: ''
          }
        } as VerificarPACResponse),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request
    const body = await req.json() as VerificarPACRequest;
    const ambiente = body.ambiente || 'test';

    // Determinar URL del PAC según ambiente
    const urlPac = ambiente === 'production'
      ? 'https://api.fiscalapi.com'
      : 'https://api-sandbox.fiscalapi.com';

    console.log(`✅ FISCAL_API_KEY configurado para ambiente: ${ambiente}`);
    console.log(`📍 URL PAC: ${urlPac}`);

    // Intentar validar la conexión con el PAC (ping básico)
    try {
      const response = await fetch(`${urlPac}/v1/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${fiscalApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn(`⚠️ Respuesta del PAC no exitosa: ${response.status}`);
      } else {
        console.log('✅ Conexión con PAC validada exitosamente');
      }
    } catch (error) {
      console.warn('⚠️ No se pudo conectar con el PAC (puede ser normal si no existe endpoint /health):', error);
    }

    return new Response(
      JSON.stringify({
        success: true,
        configurado: true,
        ambiente,
        detalles: {
          fiscal_api_key_presente: true,
          url_pac: urlPac
        }
      } as VerificarPACResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('💥 Error verificando configuración PAC:', error);
    return new Response(
      JSON.stringify({
        success: false,
        configurado: false,
        ambiente: 'error',
        error: error instanceof Error ? error.message : 'Error desconocido'
      } as VerificarPACResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
