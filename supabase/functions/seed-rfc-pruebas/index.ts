/**
 * Edge Function: Seed RFC de Pruebas SAT
 * 
 * Siembra los RFCs de prueba oficiales del SAT en la base de datos
 * para validación en ambiente sandbox
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// RFCs de prueba oficiales del SAT
const RFC_PRUEBAS_SAT = [
  {
    rfc: 'EKU9003173C9',
    nombre: 'ESCUELA KEMPER URGATE',
    tipo: 'moral',
    descripcion: 'RFC de prueba principal para personas morales',
    regimenes: ['601', '603', '612']
  },
  {
    rfc: 'XAXX010101000',
    nombre: 'PUBLICO EN GENERAL',
    tipo: 'generico',
    descripcion: 'RFC genérico para ventas al público en general',
    regimenes: ['616']
  },
  {
    rfc: 'XEXX010101000',
    nombre: 'EXTRANJERO SIN RFC',
    tipo: 'extranjero',
    descripcion: 'RFC para operaciones con extranjeros sin RFC mexicano',
    regimenes: ['616']
  },
  {
    rfc: 'AAA010101AAA',
    nombre: 'RFC PRUEBA PERSONA MORAL',
    tipo: 'moral_prueba',
    descripcion: 'RFC adicional de prueba para personas morales',
    regimenes: ['601']
  },
  {
    rfc: 'CACX7605101P8',
    nombre: 'CESAR ALEJANDRO CRUZ XOTLA',
    tipo: 'fisica',
    descripcion: 'RFC de prueba para persona física',
    regimenes: ['612', '625']
  }
];

// Certificados CSD de prueba (información pública)
const CSD_PRUEBAS = [
  {
    rfc: 'EKU9003173C9',
    numero_certificado: '30001000000500003416',
    nombre: 'CSD Prueba EKU',
    descripcion: 'Certificado de Sello Digital de prueba para EKU9003173C9',
    vigente: true
  }
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('[SEED-RFC] Iniciando sembrado de RFCs de prueba');

    const resultados = {
      rfcInsertados: 0,
      rfcActualizados: 0,
      csdInsertados: 0,
      errores: [] as string[]
    };

    // 1. Crear tabla rfc_pruebas_sat si no existe
    // (La migración debería haberla creado, pero verificamos)

    // 2. Insertar RFCs de prueba
    for (const rfcData of RFC_PRUEBAS_SAT) {
      try {
        const { data, error } = await supabase
          .from('rfc_pruebas_sat')
          .upsert({
            rfc: rfcData.rfc,
            nombre: rfcData.nombre,
            tipo: rfcData.tipo,
            descripcion: rfcData.descripcion,
            regimenes_fiscales: rfcData.regimenes,
            activo: true,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'rfc'
          });

        if (error) {
          // Si la tabla no existe, intentar crearla
          if (error.code === '42P01') {
            console.log('[SEED-RFC] Creando tabla rfc_pruebas_sat...');
            
            await supabase.rpc('exec_sql', {
              sql: `
                CREATE TABLE IF NOT EXISTS public.rfc_pruebas_sat (
                  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                  rfc VARCHAR(13) NOT NULL UNIQUE,
                  nombre VARCHAR(255) NOT NULL,
                  tipo VARCHAR(50),
                  descripcion TEXT,
                  regimenes_fiscales TEXT[],
                  activo BOOLEAN DEFAULT true,
                  created_at TIMESTAMPTZ DEFAULT NOW(),
                  updated_at TIMESTAMPTZ DEFAULT NOW()
                );
                
                CREATE INDEX IF NOT EXISTS idx_rfc_pruebas_rfc ON public.rfc_pruebas_sat(rfc);
              `
            });

            // Reintentar inserción
            await supabase
              .from('rfc_pruebas_sat')
              .upsert({
                rfc: rfcData.rfc,
                nombre: rfcData.nombre,
                tipo: rfcData.tipo,
                descripcion: rfcData.descripcion,
                regimenes_fiscales: rfcData.regimenes,
                activo: true
              });
          } else {
            resultados.errores.push(`Error insertando ${rfcData.rfc}: ${error.message}`);
            continue;
          }
        }

        resultados.rfcInsertados++;
        console.log(`[SEED-RFC] RFC ${rfcData.rfc} insertado/actualizado`);

      } catch (error: any) {
        resultados.errores.push(`Error con ${rfcData.rfc}: ${error.message}`);
      }
    }

    // 3. Registrar en auditoría
    await supabase.from('security_audit_log').insert({
      event_type: 'seed_rfc_pruebas',
      event_data: {
        timestamp: new Date().toISOString(),
        resultados,
        total_rfcs: RFC_PRUEBAS_SAT.length
      }
    });

    console.log('[SEED-RFC] Sembrado completado:', resultados);

    return new Response(
      JSON.stringify({
        success: resultados.errores.length === 0,
        message: 'Sembrado de RFCs de prueba completado',
        resultados,
        rfcs_disponibles: RFC_PRUEBAS_SAT.map(r => ({
          rfc: r.rfc,
          nombre: r.nombre,
          tipo: r.tipo
        }))
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[SEED-RFC] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
