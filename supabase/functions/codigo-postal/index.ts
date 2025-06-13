
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CodigoPostalRequest {
  codigoPostal: string;
}

interface CodigoPostalResponse {
  codigoPostal: string;
  estado: string;
  estadoClave: string;
  municipio: string;
  municipioClave: string;
  localidad?: string;
  ciudad?: string;
  zona?: string;
  colonias: Array<{
    colonia: string;
    tipo_asentamiento?: string;
  }>;
  fuente: 'database' | 'api_externa';
  error?: string;
}

interface SugerenciasResponse {
  sugerencias: Array<{
    codigo_postal: string;
    ubicacion: string;
  }>;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Método no permitido' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const { codigoPostal }: CodigoPostalRequest = await req.json();

    console.log('[CP_FUNCTION] Buscando código postal:', codigoPostal);

    // Validar formato del código postal
    if (!codigoPostal || !/^\d{5}$/.test(codigoPostal)) {
      return new Response(
        JSON.stringify({ 
          error: 'Formato de código postal inválido. Debe ser de 5 dígitos numéricos.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 1. Buscar en la base de datos local primero
    const { data: dbResult, error: dbError } = await supabase
      .rpc('buscar_codigo_postal', { cp_input: codigoPostal });

    if (dbError) {
      console.error('[CP_FUNCTION] Error en consulta DB:', dbError);
    } else if (dbResult && dbResult.length > 0) {
      const resultado = dbResult[0];
      console.log('[CP_FUNCTION] Encontrado en DB:', resultado);

      const response: CodigoPostalResponse = {
        codigoPostal: resultado.codigo_postal,
        estado: resultado.estado,
        estadoClave: resultado.estado_clave,
        municipio: resultado.municipio,
        municipioClave: resultado.municipio_clave,
        localidad: resultado.localidad,
        ciudad: resultado.ciudad,
        zona: resultado.zona,
        colonias: resultado.colonias || [],
        fuente: 'database'
      };

      return new Response(
        JSON.stringify(response),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // 2. Si no se encuentra en DB, intentar API externa como fallback
    console.log('[CP_FUNCTION] No encontrado en DB, intentando API externa...');
    
    try {
      const apiResponse = await fetch(`https://api-sepomex.hckdrk.mx/query/info_cp/${codigoPostal}`);
      
      if (apiResponse.ok) {
        const apiData = await apiResponse.json();
        
        if (!apiData.error && apiData.response && apiData.response.length > 0) {
          const primeraRespuesta = apiData.response[0];
          const colonias = [...new Set(apiData.response.map((item: any) => ({
            colonia: item.d_asenta,
            tipo_asentamiento: item.d_tipo_asenta
          })))];

          const response: CodigoPostalResponse = {
            codigoPostal,
            estado: primeraRespuesta.d_estado,
            estadoClave: primeraRespuesta.c_estado,
            municipio: primeraRespuesta.d_mnp,
            municipioClave: primeraRespuesta.c_mnp,
            localidad: primeraRespuesta.d_ciudad,
            ciudad: primeraRespuesta.d_ciudad,
            zona: 'urbana', // Valor por defecto
            colonias: colonias,
            fuente: 'api_externa'
          };

          console.log('[CP_FUNCTION] Encontrado en API externa:', response);
          return new Response(
            JSON.stringify(response),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
      }
    } catch (apiError) {
      console.error('[CP_FUNCTION] Error en API externa:', apiError);
    }

    // 3. Si no se encuentra, buscar sugerencias similares
    console.log('[CP_FUNCTION] Generando sugerencias similares...');
    
    const { data: sugerenciasResult, error: sugerenciasError } = await supabase
      .rpc('sugerir_codigos_similares', { cp_input: codigoPostal });

    let sugerencias: SugerenciasResponse['sugerencias'] = [];
    if (!sugerenciasError && sugerenciasResult) {
      sugerencias = sugerenciasResult;
    }

    return new Response(
      JSON.stringify({ 
        error: `Código postal ${codigoPostal} no encontrado`,
        sugerencias: sugerencias.slice(0, 5) // Máximo 5 sugerencias
      }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[CP_FUNCTION] Error general:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Error interno del servidor',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
