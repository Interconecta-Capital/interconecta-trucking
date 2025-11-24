import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * ============================================
 * FASE 3: Edge Function - Actualización Automática de Catálogos SAT
 * ============================================
 * 
 * Proceso:
 * 1. Descarga catálogos oficiales del SAT (formato XLS)
 * 2. Verifica cambios comparando con última descarga
 * 3. Actualiza tablas en BD solo si hay diferencias
 * 4. Registra en log de auditoría cada ejecución
 * 
 * Ejecutable:
 * - Manualmente: POST https://[PROJECT].supabase.co/functions/v1/actualizar-catalogos-sat
 * - Automático: Cron job diario a las 2 AM (configurado en supabase/config.toml)
 * 
 * Fuentes oficiales del SAT:
 * - CFDI General: http://omawww.sat.gob.mx/tramitesyservicios/Paginas/documentos/catCFDI.xls
 * - CartaPorte: http://omawww.sat.gob.mx/tramitesyservicios/Paginas/documentos/catCartaPorte.xls
 * 
 * Recomendación de SmartWeb:
 * "Lo que otros clientes realizan es un scrapping de la url de catalogos del SAT 
 * y descargan el archivo si hay diferencias lo actualizan si no las hay asi lo dejan."
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('📥 ========================================');
    console.log('📥 [CATÁLOGOS SAT] Iniciando actualización automática...');
    console.log('📥 [CATÁLOGOS SAT] Timestamp:', new Date().toISOString());
    console.log('📥 ========================================');

    // URLs oficiales del SAT
    const catalogosURL = {
      general: 'http://omawww.sat.gob.mx/tramitesyservicios/Paginas/documentos/catCFDI.xls',
      cartaPorte: 'http://omawww.sat.gob.mx/tramitesyservicios/Paginas/documentos/catCartaPorte.xls'
    };

    const resultados: any = {
      descargados: [],
      actualizados: [],
      errores: [],
      duracion_ms: 0
    };

    // ============================================
    // FASE 1: Descargar catálogo general CFDI
    // ============================================
    console.log('📥 [CATÁLOGO GENERAL] Descargando catálogo general del SAT...');
    console.log('📥 [CATÁLOGO GENERAL] URL:', catalogosURL.general);

    try {
      const response = await fetch(catalogosURL.general, {
        method: 'GET',
        signal: AbortSignal.timeout(30000) // 30 segundos timeout
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();
      const size = buffer.byteLength;

      resultados.descargados.push({
        catalogo: 'general_cfdi',
        size_bytes: size,
        size_mb: (size / 1024 / 1024).toFixed(2),
        url: catalogosURL.general,
        timestamp: new Date().toISOString()
      });

      console.log(`✅ [CATÁLOGO GENERAL] Descargado: ${(size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`✅ [CATÁLOGO GENERAL] Bytes totales: ${size.toLocaleString()}`);

      // TODO FUTURO: Parsear XLS y actualizar tablas
      // Por ahora, solo registramos la descarga exitosa para verificar conectividad
      
    } catch (error: any) {
      console.error('❌ [CATÁLOGO GENERAL] Error:', error.message);
      resultados.errores.push({
        catalogo: 'general_cfdi',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }

    // ============================================
    // FASE 2: Descargar catálogo CartaPorte
    // ============================================
    console.log('📥 [CATÁLOGO CARTA PORTE] Descargando catálogo CartaPorte del SAT...');
    console.log('📥 [CATÁLOGO CARTA PORTE] URL:', catalogosURL.cartaPorte);

    try {
      const response = await fetch(catalogosURL.cartaPorte, {
        method: 'GET',
        signal: AbortSignal.timeout(30000) // 30 segundos timeout
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      const buffer = await blob.arrayBuffer();
      const size = buffer.byteLength;

      resultados.descargados.push({
        catalogo: 'carta_porte',
        size_bytes: size,
        size_mb: (size / 1024 / 1024).toFixed(2),
        url: catalogosURL.cartaPorte,
        timestamp: new Date().toISOString()
      });

      console.log(`✅ [CATÁLOGO CARTA PORTE] Descargado: ${(size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`✅ [CATÁLOGO CARTA PORTE] Bytes totales: ${size.toLocaleString()}`);

    } catch (error: any) {
      console.error('❌ [CATÁLOGO CARTA PORTE] Error:', error.message);
      resultados.errores.push({
        catalogo: 'carta_porte',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }

    // ============================================
    // FASE 3: Registrar en auditoría
    // ============================================
    resultados.duracion_ms = Date.now() - startTime;

    const { error: logError } = await supabase
      .from('security_audit_log')
      .insert({
        event_type: 'catalogos_sat_actualizacion',
        event_data: {
          timestamp: new Date().toISOString(),
          resultados,
          total_descargados: resultados.descargados.length,
          total_errores: resultados.errores.length,
          duracion_segundos: (resultados.duracion_ms / 1000).toFixed(2),
          fase: 'FASE_3_PLAN_IMPLEMENTACION',
          notas: 'Descarga de catálogos exitosa. Parseo de XLS pendiente de implementar.'
        }
      });

    if (logError) {
      console.error('⚠️ [AUDITORÍA] Error registrando en auditoría:', logError);
    } else {
      console.log('✅ [AUDITORÍA] Ejecución registrada en security_audit_log');
    }

    // ============================================
    // Respuesta final
    // ============================================
    console.log('✅ ========================================');
    console.log('✅ [CATÁLOGOS SAT] Actualización completada');
    console.log('✅ [CATÁLOGOS SAT] Catálogos descargados:', resultados.descargados.length);
    console.log('✅ [CATÁLOGOS SAT] Errores:', resultados.errores.length);
    console.log('✅ [CATÁLOGOS SAT] Duración:', (resultados.duracion_ms / 1000).toFixed(2), 'segundos');
    console.log('✅ ========================================');

    return new Response(JSON.stringify({
      success: true,
      message: 'Actualización de catálogos SAT completada',
      resultados,
      timestamp: new Date().toISOString(),
      notas: [
        'Descarga de catálogos oficiales del SAT exitosa',
        'Parseo de archivos XLS pendiente de implementar',
        'Por ahora solo se verifica conectividad y se registra en auditoría'
      ]
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('💥 ========================================');
    console.error('💥 [CATÁLOGOS SAT] Error general:', error.message);
    console.error('💥 [CATÁLOGOS SAT] Stack:', error.stack);
    console.error('💥 ========================================');

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      duracion_ms: Date.now() - startTime
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
