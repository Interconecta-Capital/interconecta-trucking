
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
  totalColonias: number;
  colonias: Array<{
    nombre: string;
    tipo: string;
  }>;
  fuente: 'database_nacional' | 'api_externa';
}

// Función para consultar API externa de códigos postales
async function consultarAPIExterna(codigoPostal: string): Promise<CodigoPostalResponse | null> {
  try {
    console.log('[CP_EDGE] Consultando API externa para:', codigoPostal);
    
    // Usar API gratuita de códigos postales mexicanos
    const response = await fetch(
      `https://api.tau.com.mx/dipomex/v1/cp/${codigoPostal}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Agregar timeout
        signal: AbortSignal.timeout(10000), // 10 segundos
      }
    );
    
    if (!response.ok) {
      console.log('[CP_EDGE] API externa respondió con error:', response.status);
      return null;
    }
    
    const data = await response.json();
    console.log('[CP_EDGE] Respuesta de API externa:', data);
    
    if (data && data.cp_estado && data.cp_municipio) {
      const colonias = data.cp_asentamientos ? data.cp_asentamientos.map((asentamiento: any) => ({
        nombre: asentamiento.asentamiento || asentamiento.nombre || asentamiento,
        tipo: asentamiento.tipo_asentamiento || 'Colonia'
      })) : [];
      
      return {
        codigoPostal: data.cp || codigoPostal,
        estado: data.cp_estado,
        estadoClave: data.cp_cve_estado || '',
        municipio: data.cp_municipio,
        municipioClave: data.cp_cve_municipio || '',
        localidad: data.cp_ciudad || data.cp_municipio,
        ciudad: data.cp_ciudad,
        zona: data.cp_zona || '',
        totalColonias: colonias.length,
        colonias,
        fuente: 'api_externa'
      };
    }
  } catch (error) {
    console.error('[CP_EDGE] Error consultando API externa:', error);
  }
  
  // Fallback: intentar con API de códigos postales de México (gratuita)
  try {
    console.log('[CP_EDGE] Intentando fallback API para:', codigoPostal);
    
    const fallbackResponse = await fetch(
      `https://api.copomex.com/query/info_cp/${codigoPostal}?type=simplified`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      }
    );
    
    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json();
      console.log('[CP_EDGE] Respuesta de fallback API:', fallbackData);
      
      if (fallbackData && fallbackData.response && fallbackData.response.estado) {
        const colonias = fallbackData.response.asentamiento ? 
          fallbackData.response.asentamiento.map((a: any) => ({
            nombre: a.asentamiento || a.nombre,
            tipo: a.tipo || 'Colonia'
          })) : [];
        
        return {
          codigoPostal: fallbackData.response.cp || codigoPostal,
          estado: fallbackData.response.estado,
          estadoClave: fallbackData.response.cve_estado || '',
          municipio: fallbackData.response.municipio,
          municipioClave: fallbackData.response.cve_municipio || '',
          localidad: fallbackData.response.ciudad || fallbackData.response.municipio,
          ciudad: fallbackData.response.ciudad,
          zona: fallbackData.response.zona || '',
          totalColonias: colonias.length,
          colonias,
          fuente: 'api_externa'
        };
      }
    }
  } catch (fallbackError) {
    console.error('[CP_EDGE] Error en fallback API:', fallbackError);
  }
  
  return null;
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

    console.log('[CP_EDGE] Procesando código postal:', codigoPostal);

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

    // PASO 1: Intentar API externa primero
    const apiResult = await consultarAPIExterna(codigoPostal);
    if (apiResult && apiResult.colonias.length > 0) {
      console.log('[CP_EDGE] Encontrado en API externa:', {
        cp: apiResult.codigoPostal,
        totalColonias: apiResult.totalColonias
      });

      return new Response(
        JSON.stringify(apiResult),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // PASO 2: Fallback a la base de datos nacional
    const { data: dbResult, error: dbError } = await supabase
      .rpc('buscar_codigo_postal_completo', { cp_input: codigoPostal });

    if (!dbError && dbResult && dbResult.length > 0) {
      const resultado = dbResult[0];
      console.log('[CP_EDGE] Encontrado en base de datos:', {
        cp: resultado.codigo_postal,
        totalColonias: resultado.total_colonias
      });

      const response: CodigoPostalResponse = {
        codigoPostal: resultado.codigo_postal,
        estado: resultado.estado,
        estadoClave: resultado.estado_clave,
        municipio: resultado.municipio,
        municipioClave: resultado.municipio_clave,
        localidad: resultado.localidad,
        ciudad: resultado.ciudad,
        zona: resultado.zona,
        totalColonias: resultado.total_colonias,
        colonias: resultado.colonias || [],
        fuente: 'database_nacional'
      };

      return new Response(
        JSON.stringify(response),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // PASO 3: Si no se encuentra, generar sugerencias
    console.log('[CP_EDGE] No encontrado en ninguna fuente, generando sugerencias');
    const { data: sugerenciasResult } = await supabase
      .rpc('sugerir_codigos_similares', { cp_input: codigoPostal });

    return new Response(
      JSON.stringify({ 
        error: `Código postal ${codigoPostal} no encontrado`,
        sugerencias: sugerenciasResult?.slice(0, 5) || []
      }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[CP_EDGE] Error general:', error);
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
