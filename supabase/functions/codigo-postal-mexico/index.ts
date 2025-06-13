
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
  fuente: 'database_nacional';
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

    console.log('[CP_MEXICO] Buscando código postal:', codigoPostal);

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

    // Buscar en la base de datos nacional
    const { data: dbResult, error: dbError } = await supabase
      .rpc('buscar_codigo_postal_completo', { cp_input: codigoPostal });

    if (dbError) {
      console.error('[CP_MEXICO] Error en consulta DB:', dbError);
      return new Response(
        JSON.stringify({ 
          error: 'Error interno al consultar código postal',
          details: dbError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (dbResult && dbResult.length > 0) {
      const resultado = dbResult[0];
      console.log('[CP_MEXICO] Encontrado en DB nacional:', {
        cp: resultado.codigo_postal,
        totalColonias: resultado.total_colonias,
        estado: resultado.estado
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

    // Si no se encuentra, generar sugerencias similares
    console.log('[CP_MEXICO] CP no encontrado, generando sugerencias...');
    
    const { data: sugerenciasResult, error: sugerenciasError } = await supabase
      .rpc('sugerir_codigos_similares', { cp_input: codigoPostal });

    let sugerencias: Array<{codigo_postal: string, ubicacion: string}> = [];
    if (!sugerenciasError && sugerenciasResult) {
      sugerencias = sugerenciasResult;
    }

    return new Response(
      JSON.stringify({ 
        error: `Código postal ${codigoPostal} no encontrado en la base de datos nacional`,
        sugerencias: sugerencias.slice(0, 5)
      }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[CP_MEXICO] Error general:', error);
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
