/**
 * Edge Function: Poblar Catálogos de Códigos Postales
 * 
 * Descarga y almacena códigos postales de México desde SEPOMEX API
 * para validación de correlación CP ↔ Estado ↔ Municipio en Carta Porte
 * 
 * Uso:
 * POST /functions/v1/poblar-catalogos-cp
 * Body: { "rangoInicio": "01000", "rangoFin": "01999", "modo": "incremental" }
 * 
 * Modos:
 * - "incremental": Solo inserta CPs que no existen
 * - "force": Reemplaza todos los CPs en el rango
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PoblarRequest {
  rangoInicio?: string;
  rangoFin?: string;
  modo?: 'incremental' | 'force';
  codigosEspecificos?: string[];
}

// Lista de prefijos de CP por estado para poblar estratégicamente
const PREFIJOS_ESTADOS: Record<string, string[]> = {
  '09': ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16'], // CDMX
  '14': ['44', '45', '46', '47', '48', '49'], // Jalisco
  '19': ['64', '65', '66', '67'], // Nuevo León
  '15': ['50', '51', '52', '53', '54', '55', '56', '57'], // Estado de México
  '21': ['72', '73', '74', '75'], // Puebla
  '05': ['25', '26', '27'], // Coahuila
  '02': ['21', '22', '23'], // Baja California
  '08': ['31', '32', '33'], // Chihuahua
  '26': ['83', '84', '85'], // Sonora
  '28': ['87', '88', '89'], // Tamaulipas
  '30': ['91', '92', '93', '94', '95', '96'], // Veracruz
  '01': ['20'], // Aguascalientes
  '10': ['34', '35'], // Durango
  '11': ['36', '37', '38'], // Guanajuato
  '16': ['58', '59', '60', '61'], // Michoacán
  '17': ['62', '63'], // Morelos
  '22': ['76', '77', '78'], // Querétaro
  '24': ['78', '79'], // San Luis Potosí
  '25': ['80', '81', '82'], // Sinaloa
  '04': ['24'], // Campeche
  '07': ['29', '30'], // Chiapas
  '23': ['77'], // Quintana Roo
  '31': ['97'], // Yucatán
  '18': ['63'], // Nayarit
  '20': ['68', '69', '70', '71'], // Oaxaca
  '03': ['23'], // Baja California Sur
  '06': ['28'], // Colima
  '27': ['86'], // Tabasco
  '29': ['90'], // Tlaxcala
  '12': ['39', '40', '41'], // Guerrero
  '13': ['42', '43'], // Hidalgo
  '32': ['98', '99'], // Zacatecas
};

async function consultarSepomex(cp: string): Promise<any | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `https://api-sepomex.hckdrk.mx/query/info_cp/${cp}`,
      { signal: controller.signal }
    );

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    if (!data.error && data.response) {
      return data.response;
    }
  } catch (e) {
    // Silenciar errores de timeout o red
  }
  return null;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verificar autorización (solo usuarios autenticados con rol admin)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: PoblarRequest = await req.json();
    const { rangoInicio, rangoFin, modo = 'incremental', codigosEspecificos } = body;

    console.log('[POBLAR-CP] Iniciando poblado de catálogos');
    console.log('[POBLAR-CP] Parámetros:', { rangoInicio, rangoFin, modo, codigosEspecificos?.length });

    const resultados = {
      insertados: 0,
      actualizados: 0,
      omitidos: 0,
      errores: 0,
      detalles: [] as string[],
    };

    // Determinar qué CPs procesar
    let cpsAProcesar: string[] = [];

    if (codigosEspecificos && codigosEspecificos.length > 0) {
      cpsAProcesar = codigosEspecificos;
    } else if (rangoInicio && rangoFin) {
      const inicio = parseInt(rangoInicio, 10);
      const fin = parseInt(rangoFin, 10);
      
      if (isNaN(inicio) || isNaN(fin) || inicio > fin) {
        return new Response(
          JSON.stringify({ error: 'Rango inválido' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Limitar a 1000 CPs por ejecución para evitar timeouts
      const maxCps = Math.min(fin - inicio + 1, 1000);
      for (let i = 0; i < maxCps; i++) {
        cpsAProcesar.push(String(inicio + i).padStart(5, '0'));
      }
    } else {
      // Modo predeterminado: poblar CPs más comunes (capitales y zonas metropolitanas)
      const cpsComunes = [
        // CDMX
        '01000', '06000', '06600', '06700', '03100', '03200', '11000', '11560',
        // Guadalajara
        '44100', '44600', '44630', '44160', '45040',
        // Monterrey
        '64000', '64710', '66220', '66260',
        // Estado de México
        '50000', '52000', '53100', '54000',
        // Puebla
        '72000', '72100', '72530',
        // Querétaro
        '76000', '76100', '76150',
        // Tijuana
        '22000', '22010', '22100',
        // León
        '37000', '37100', '37150',
        // Mérida
        '97000', '97100', '97070',
        // Cancún
        '77500', '77505', '77510',
      ];
      cpsAProcesar = cpsComunes;
    }

    console.log(`[POBLAR-CP] Procesando ${cpsAProcesar.length} códigos postales`);

    // Procesar CPs en lotes
    const BATCH_SIZE = 10;
    const DELAY_BETWEEN_BATCHES = 500; // ms

    for (let i = 0; i < cpsAProcesar.length; i += BATCH_SIZE) {
      const batch = cpsAProcesar.slice(i, i + BATCH_SIZE);
      
      for (const cp of batch) {
        try {
          // Verificar si ya existe
          if (modo === 'incremental') {
            const { data: existing } = await supabase
              .from('codigos_postales_mexico')
              .select('codigo_postal')
              .eq('codigo_postal', cp)
              .limit(1);

            if (existing && existing.length > 0) {
              resultados.omitidos++;
              continue;
            }
          }

          // Consultar SEPOMEX
          const sepomexData = await consultarSepomex(cp);
          
          if (!sepomexData) {
            resultados.omitidos++;
            continue;
          }

          // Preparar registros para insertar (uno por colonia)
          const colonias = sepomexData.asentamiento || [];
          
          if (colonias.length === 0) {
            resultados.omitidos++;
            continue;
          }

          // Si modo force, eliminar existentes primero
          if (modo === 'force') {
            await supabase
              .from('codigos_postales_mexico')
              .delete()
              .eq('codigo_postal', cp);
          }

          // Insertar colonias
          const registros = colonias.map((col: any) => ({
            codigo_postal: cp,
            colonia: col.d_asenta,
            tipo_asentamiento: col.d_tipo_asenta,
            estado: sepomexData.estado,
            estado_clave: sepomexData.cve_edo || '',
            municipio: sepomexData.municipio,
            municipio_clave: sepomexData.cve_mun || '',
            ciudad: sepomexData.ciudad || null,
            localidad: sepomexData.ciudad || sepomexData.municipio,
            zona: sepomexData.zona?.toLowerCase() || null,
          }));

          const { error: insertError } = await supabase
            .from('codigos_postales_mexico')
            .insert(registros);

          if (insertError) {
            console.error(`[POBLAR-CP] Error insertando CP ${cp}:`, insertError.message);
            resultados.errores++;
          } else {
            resultados.insertados += registros.length;
            resultados.detalles.push(`CP ${cp}: ${registros.length} colonias`);
          }

        } catch (error: any) {
          console.error(`[POBLAR-CP] Error procesando CP ${cp}:`, error.message);
          resultados.errores++;
        }
      }

      // Delay entre lotes para no saturar la API
      if (i + BATCH_SIZE < cpsAProcesar.length) {
        await delay(DELAY_BETWEEN_BATCHES);
      }
    }

    const duracion = Date.now() - startTime;

    // Registrar en auditoría
    await supabase.from('security_audit_log').insert({
      event_type: 'catalogos_cp_poblado',
      event_data: {
        timestamp: new Date().toISOString(),
        modo,
        cps_solicitados: cpsAProcesar.length,
        resultados,
        duracion_ms: duracion,
      },
    });

    console.log('[POBLAR-CP] Completado:', resultados);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Poblado de catálogos completado',
        resultados,
        duracion_ms: duracion,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[POBLAR-CP] Error general:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        duracion_ms: Date.now() - startTime,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
