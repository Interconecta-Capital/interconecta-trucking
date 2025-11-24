/**
 * Servicio de Validación de RFC con Sistema de Cache
 * 
 * Características:
 * - Cache de 30 días en rfc_validados_sat
 * - Validación contra SAT solo cuando es necesario
 * - Normalización automática de nombres
 * - Soporte para validación en lote
 */

import { supabase } from '@/integrations/supabase/client';
import { NormalizadorSATService } from '../normalizacion/NormalizadorSATService';

export interface RFCValidado {
  rfc: string;
  razonSocial: string;
  razonSocialNormalizada: string;
  regimenFiscal?: string;
  situacion?: string;
  origen: 'cache' | 'sat';
  fechaValidacion: string;
}

export interface ResultadoValidacionLote {
  exitosos: Map<string, RFCValidado>;
  fallidos: Map<string, string>;
  totalProcesados: number;
  totalExitosos: number;
  totalFallidos: number;
}

export class ValidacionRFCConCacheService {
  
  /**
   * Validar RFC con cache (método principal)
   */
  static async validarYCachearRFC(
    rfc: string,
    ambiente: 'sandbox' | 'produccion' = 'produccion'
  ): Promise<RFCValidado> {
    
    console.log(`🔍 Validando RFC: ${rfc} (${ambiente})`);
    
    // 1. Buscar en cache
    const { data: cached, error: cacheError } = await supabase
      .from('rfc_validados_sat')
      .select('*')
      .eq('rfc', rfc.toUpperCase())
      .eq('ambiente', ambiente)
      .gt('fecha_expiracion', new Date().toISOString())
      .maybeSingle() as any;
    
    if (cached && !cacheError) {
      console.log('✅ RFC encontrado en cache');
      
      // Actualizar contador de uso
      await supabase
        .from('rfc_validados_sat')
        .update({
          numero_validaciones: cached.numero_validaciones + 1,
          ultima_actualizacion: new Date().toISOString()
        })
        .eq('rfc', rfc.toUpperCase());
      
      return {
        rfc: cached.rfc,
        razonSocial: cached.razon_social_sat,
        razonSocialNormalizada: cached.razon_social_normalizada,
        regimenFiscal: cached.regimen_fiscal,
        situacion: cached.situacion,
        origen: 'cache',
        fechaValidacion: cached.fecha_validacion
      };
    }
    
    // 2. No está en cache, consultar al SAT
    console.log('📡 RFC no en cache, consultando SAT...');
    
    const { data, error } = await supabase.functions.invoke('consultar-rfc-sat', {
      body: { rfc: rfc.toUpperCase() }
    });
    
    if (error || !data) {
      throw new Error(`Error consultando RFC en SAT: ${error?.message || 'Sin respuesta'}`);
    }
    
    if (!data.encontrado) {
      throw new Error(`RFC ${rfc} no encontrado en el padrón del SAT`);
    }
    
    // 3. Normalizar nombre según especificaciones del SAT
    const razonSocialNormalizada = NormalizadorSATService.normalizarNombreParaTimbrado(
      data.razonSocial
    );
    
    console.log('📝 Nombre normalizado:', {
      original: data.razonSocial,
      normalizado: razonSocialNormalizada
    });
    
    // 4. Guardar en cache (30 días)
    const { error: insertError } = await supabase
      .from('rfc_validados_sat')
      .insert({
        rfc: rfc.toUpperCase(),
        razon_social_sat: data.razonSocial,
        razon_social_normalizada: razonSocialNormalizada,
        regimen_fiscal: data.regimenFiscal,
        situacion: data.situacion || 'Activo',
        ambiente: ambiente,
        fecha_validacion: new Date().toISOString(),
        fecha_expiracion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        numero_validaciones: 1,
        ultima_actualizacion: new Date().toISOString()
      } as any);
    
    if (insertError) {
      console.warn('⚠️ Error guardando en cache:', insertError.message);
    } else {
      console.log('✅ RFC guardado en cache por 30 días');
    }
    
    return {
      rfc: rfc.toUpperCase(),
      razonSocial: data.razonSocial,
      razonSocialNormalizada: razonSocialNormalizada,
      regimenFiscal: data.regimenFiscal,
      situacion: data.situacion,
      origen: 'sat',
      fechaValidacion: new Date().toISOString()
    };
  }
  
  /**
   * Validar múltiples RFCs en lote (para migraciones o procesamiento masivo)
   */
  static async validarLoteRFCs(
    rfcs: string[],
    ambiente: 'sandbox' | 'produccion' = 'produccion',
    onProgress?: (procesados: number, total: number) => void
  ): Promise<ResultadoValidacionLote> {
    
    const exitosos = new Map<string, RFCValidado>();
    const fallidos = new Map<string, string>();
    
    // Eliminar duplicados
    const rfcsUnicos = Array.from(new Set(rfcs.map(r => r.toUpperCase())));
    
    console.log(`📦 Validando ${rfcsUnicos.length} RFCs en lote...`);
    
    // Procesar en chunks de 10 para no saturar
    const chunkSize = 10;
    const chunks = this.chunkArray(rfcsUnicos, chunkSize);
    
    let procesados = 0;
    
    for (const chunk of chunks) {
      const promesas = chunk.map(rfc =>
        this.validarYCachearRFC(rfc, ambiente)
          .then(result => ({ rfc, result, error: null }))
          .catch(error => ({ rfc, result: null, error: error.message }))
      );
      
      const results = await Promise.all(promesas);
      
      results.forEach(({ rfc, result, error }) => {
        procesados++;
        
        if (error) {
          console.error(`❌ Error validando ${rfc}:`, error);
          fallidos.set(rfc, error);
        } else if (result) {
          console.log(`✅ ${rfc} validado`);
          exitosos.set(rfc, result);
        }
        
        // Callback de progreso
        if (onProgress) {
          onProgress(procesados, rfcsUnicos.length);
        }
      });
      
      // Pausa entre chunks para no saturar
      if (chunks.indexOf(chunk) < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('📊 Validación en lote completada:', {
      total: rfcsUnicos.length,
      exitosos: exitosos.size,
      fallidos: fallidos.size
    });
    
    return {
      exitosos,
      fallidos,
      totalProcesados: rfcsUnicos.length,
      totalExitosos: exitosos.size,
      totalFallidos: fallidos.size
    };
  }
  
  /**
   * Obtener estadísticas del cache
   */
  static async obtenerEstadisticasCache(): Promise<{
    totalRFCs: number;
    rfcsActivos: number;
    rfcsExpirados: number;
    usoPromedio: number;
    ambiente: { sandbox: number; produccion: number };
  }> {
    
    const { data: stats } = await supabase
      .from('rfc_validados_sat')
      .select('ambiente, numero_validaciones, fecha_expiracion') as any;
    
    if (!stats) {
      return {
        totalRFCs: 0,
        rfcsActivos: 0,
        rfcsExpirados: 0,
        usoPromedio: 0,
        ambiente: { sandbox: 0, produccion: 0 }
      };
    }
    
    const ahora = new Date().toISOString();
    const activos = stats.filter(s => s.fecha_expiracion > ahora);
    const expirados = stats.filter(s => s.fecha_expiracion <= ahora);
    
    const usoTotal = stats.reduce((sum, s) => sum + (s.numero_validaciones || 0), 0);
    
    return {
      totalRFCs: stats.length,
      rfcsActivos: activos.length,
      rfcsExpirados: expirados.length,
      usoPromedio: stats.length > 0 ? Math.round(usoTotal / stats.length) : 0,
      ambiente: {
        sandbox: stats.filter(s => s.ambiente === 'sandbox').length,
        produccion: stats.filter(s => s.ambiente === 'produccion').length
      }
    };
  }
  
  /**
   * Limpiar cache expirado manualmente
   */
  static async limpiarCacheExpirado(): Promise<number> {
    const { data } = await supabase
      .from('rfc_validados_sat')
      .delete()
      .lt('fecha_expiracion', new Date().toISOString())
      .select() as any;
    
    const eliminados = data?.length || 0;
    console.log(`🧹 Cache limpiado: ${eliminados} RFCs expirados eliminados`);
    
    return eliminados;
  }
  
  /**
   * Dividir array en chunks
   */
  private static chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
