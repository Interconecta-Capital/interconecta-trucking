
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CodigoPostalResponse {
  codigoPostal: string;
  estado: string;
  municipio: string;
  localidad?: string;
  colonias: string[];
  fuente: 'api_sepomex' | 'api_backup' | 'local_data';
}

// Datos locales de respaldo (versión simplificada)
const codigosPostalesBackup: Record<string, Omit<CodigoPostalResponse, 'fuente'>> = {
  "62577": {
    codigoPostal: "62577",
    estado: "Morelos",
    municipio: "Jiutepec",
    localidad: "Jiutepec",
    colonias: ["Ampliación Bugambilias"]
  },
  "03100": {
    codigoPostal: "03100", 
    estado: "Ciudad de México",
    municipio: "Benito Juárez",
    localidad: "Ciudad de México",
    colonias: ["Del Valle Centro"]
  },
  "06600": {
    codigoPostal: "06600",
    estado: "Ciudad de México",
    municipio: "Cuauhtémoc", 
    localidad: "Ciudad de México",
    colonias: ["Roma Norte"]
  }
};

async function consultarSEPOMEX(codigoPostal: string): Promise<CodigoPostalResponse | null> {
  try {
    console.log(`[SEPOMEX] Consultando CP: ${codigoPostal}`);
    
    const response = await fetch(`https://api-sepomex.hckdrk.mx/query/info_cp/${codigoPostal}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'InterconectaTrucking/1.0'
      }
    });

    if (!response.ok) {
      console.log(`[SEPOMEX] Error HTTP: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (data.error || !data.response || data.response.length === 0) {
      console.log(`[SEPOMEX] No hay datos para CP: ${codigoPostal}`);
      return null;
    }

    const primeraRespuesta = data.response[0];
    const colonias = [...new Set(data.response.map((item: any) => item.d_asenta))].sort();

    return {
      codigoPostal,
      estado: primeraRespuesta.d_estado,
      municipio: primeraRespuesta.d_mnp,
      localidad: primeraRespuesta.d_ciudad,
      colonias,
      fuente: 'api_sepomex'
    };
  } catch (error) {
    console.error(`[SEPOMEX] Error en consulta:`, error);
    return null;
  }
}

async function consultarAPIBackup(codigoPostal: string): Promise<CodigoPostalResponse | null> {
  try {
    console.log(`[API_BACKUP] Consultando CP: ${codigoPostal}`);
    
    // API alternativa (puede usar otra fuente confiable)
    const response = await fetch(`https://sepomex.icalialabs.com/api/v1/zip_codes?zip_code=${codigoPostal}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.log(`[API_BACKUP] Error HTTP: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (!data.zip_codes || data.zip_codes.length === 0) {
      console.log(`[API_BACKUP] No hay datos para CP: ${codigoPostal}`);
      return null;
    }

    const primero = data.zip_codes[0];
    const colonias = [...new Set(data.zip_codes.map((item: any) => item.d_asenta))].sort();

    return {
      codigoPostal,
      estado: primero.d_estado,
      municipio: primero.d_mnp,
      localidad: primero.d_ciudad || primero.d_mnp,
      colonias,
      fuente: 'api_backup'
    };
  } catch (error) {
    console.error(`[API_BACKUP] Error en consulta:`, error);
    return null;
  }
}

function obtenerDatosLocales(codigoPostal: string): CodigoPostalResponse | null {
  const datos = codigosPostalesBackup[codigoPostal];
  if (!datos) return null;

  return {
    ...datos,
    fuente: 'local_data'
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const codigoPostal = url.pathname.split('/').pop();

    if (!codigoPostal || !/^\d{5}$/.test(codigoPostal)) {
      return new Response(
        JSON.stringify({ 
          error: 'Código postal inválido. Debe tener 5 dígitos.' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`[CP_PROXY] Buscando código postal: ${codigoPostal}`);

    // Estrategia de múltiples fuentes:
    // 1. Intentar API SEPOMEX principal
    let resultado = await consultarSEPOMEX(codigoPostal);
    
    // 2. Si falla, intentar API de respaldo
    if (!resultado) {
      console.log(`[CP_PROXY] SEPOMEX falló, intentando API backup...`);
      resultado = await consultarAPIBackup(codigoPostal);
    }
    
    // 3. Si ambas APIs fallan, usar datos locales
    if (!resultado) {
      console.log(`[CP_PROXY] APIs externas fallaron, usando datos locales...`);
      resultado = obtenerDatosLocales(codigoPostal);
    }

    if (!resultado) {
      return new Response(
        JSON.stringify({ 
          error: `Código postal ${codigoPostal} no encontrado en ninguna fuente.`,
          sugerencias: []
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`[CP_PROXY] CP encontrado via: ${resultado.fuente}`);

    return new Response(
      JSON.stringify(resultado),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('[CP_PROXY] Error interno:', error);
    
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
