
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
  fuente: 'database_nacional' | 'sepomex_api';
}

// Función para consultar SEPOMEX API
async function consultarSepomex(codigoPostal: string): Promise<CodigoPostalResponse | null> {
  try {
    console.log('[CP_EDGE] Consultando SEPOMEX API para:', codigoPostal);
    const response = await fetch(
      `https://api-sepomex.hckdrk.mx/query/info_cp/${codigoPostal}`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.error && data.response) {
      const colonias = (data.response.asentamiento || []).map((a: any) => ({
        nombre: a.d_asenta,
        tipo: a.d_tipo_asenta
      }));
      
      return {
        codigoPostal: data.response.cp,
        estado: data.response.estado,
        estadoClave: data.response.cve_edo || '',
        municipio: data.response.municipio,
        municipioClave: data.response.cve_mun || '',
        localidad: data.response.ciudad || data.response.municipio,
        ciudad: data.response.ciudad,
        zona: data.response.zona || '',
        totalColonias: colonias.length,
        colonias,
        fuente: 'sepomex_api'
      };
    }
  } catch (error) {
    console.error('[CP_EDGE] Error consultando SEPOMEX:', error);
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

    // PASO 1: Intentar SEPOMEX API primero
    const sepomexResult = await consultarSepomex(codigoPostal);
    if (sepomexResult) {
      console.log('[CP_EDGE] Encontrado en SEPOMEX API:', {
        cp: sepomexResult.codigoPostal,
        totalColonias: sepomexResult.totalColonias
      });

      return new Response(
        JSON.stringify(sepomexResult),
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
