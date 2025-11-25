/**
 * CatalogosPoblador - Servicio para poblar catálogos SAT
 * 
 * Permite ejecutar el poblado de catálogos desde el frontend
 * con soporte para progreso y cancelación
 */

import { supabase } from '@/integrations/supabase/client';
import logger from '@/utils/logger';

export interface PobladoProgress {
  estado: 'idle' | 'poblando' | 'completado' | 'error';
  progreso: number;
  cpsProcessados: number;
  coloniasInsertadas: number;
  errores: number;
  mensaje: string;
}

export interface PobladoResult {
  success: boolean;
  insertados: number;
  actualizados: number;
  omitidos: number;
  errores: number;
  duracion_ms: number;
  detalles: string[];
}

/**
 * Rangos de códigos postales por estado para poblado estratégico
 */
const RANGOS_CP_ESTADOS: Record<string, { inicio: string; fin: string; nombre: string }[]> = {
  'CDMX': [
    { inicio: '01000', fin: '01999', nombre: 'Álvaro Obregón' },
    { inicio: '02000', fin: '02999', nombre: 'Azcapotzalco' },
    { inicio: '03000', fin: '03999', nombre: 'Benito Juárez' },
    { inicio: '04000', fin: '04999', nombre: 'Coyoacán' },
    { inicio: '05000', fin: '05999', nombre: 'Cuajimalpa' },
    { inicio: '06000', fin: '06999', nombre: 'Cuauhtémoc' },
    { inicio: '07000', fin: '07999', nombre: 'Gustavo A. Madero' },
    { inicio: '08000', fin: '08999', nombre: 'Iztacalco' },
    { inicio: '09000', fin: '09999', nombre: 'Iztapalapa' },
    { inicio: '10000', fin: '10999', nombre: 'La Magdalena Contreras' },
    { inicio: '11000', fin: '11999', nombre: 'Miguel Hidalgo' },
    { inicio: '14000', fin: '14999', nombre: 'Tlalpan' },
    { inicio: '15000', fin: '16999', nombre: 'Venustiano Carranza/Xochimilco' },
  ],
  'Jalisco': [
    { inicio: '44000', fin: '44999', nombre: 'Guadalajara Centro' },
    { inicio: '45000', fin: '45999', nombre: 'Zapopan' },
    { inicio: '46000', fin: '46999', nombre: 'Tlaquepaque/Tonalá' },
  ],
  'Nuevo_Leon': [
    { inicio: '64000', fin: '64999', nombre: 'Monterrey' },
    { inicio: '66000', fin: '66999', nombre: 'San Pedro/San Nicolás' },
  ],
  'Estado_Mexico': [
    { inicio: '50000', fin: '50999', nombre: 'Toluca' },
    { inicio: '52000', fin: '52999', nombre: 'Naucalpan' },
    { inicio: '53000', fin: '53999', nombre: 'Tlalnepantla' },
    { inicio: '54000', fin: '54999', nombre: 'Ecatepec' },
    { inicio: '55000', fin: '55999', nombre: 'Texcoco' },
    { inicio: '56000', fin: '56999', nombre: 'Nezahualcóyotl' },
    { inicio: '57000', fin: '57999', nombre: 'Chimalhuacán' },
  ],
  'Puebla': [
    { inicio: '72000', fin: '72999', nombre: 'Puebla' },
  ],
  'Queretaro': [
    { inicio: '76000', fin: '76999', nombre: 'Querétaro' },
  ],
  'Veracruz': [
    { inicio: '91000', fin: '91999', nombre: 'Xalapa' },
    { inicio: '94000', fin: '94999', nombre: 'Veracruz Puerto' },
  ],
  'Guanajuato': [
    { inicio: '36000', fin: '36999', nombre: 'Guanajuato' },
    { inicio: '37000', fin: '37999', nombre: 'León' },
    { inicio: '38000', fin: '38999', nombre: 'Celaya/Irapuato' },
  ],
  'Yucatan': [
    { inicio: '97000', fin: '97999', nombre: 'Mérida' },
  ],
  'Quintana_Roo': [
    { inicio: '77500', fin: '77599', nombre: 'Cancún' },
  ],
};

/**
 * Servicio para poblar catálogos de códigos postales
 */
export class CatalogosPoblador {
  
  /**
   * Ejecutar poblado de catálogos por estado
   */
  static async poblarEstado(
    estado: string,
    modo: 'incremental' | 'force' = 'incremental',
    onProgress?: (progress: PobladoProgress) => void
  ): Promise<PobladoResult> {
    const rangos = RANGOS_CP_ESTADOS[estado];
    
    if (!rangos) {
      throw new Error(`Estado "${estado}" no encontrado en configuración`);
    }

    logger.info('catalogos', `Iniciando poblado de catálogos para ${estado}`, {
      rangos: rangos.length,
      modo
    });

    let totalInsertados = 0;
    let totalOmitidos = 0;
    let totalErrores = 0;
    const detalles: string[] = [];
    const startTime = Date.now();

    for (let i = 0; i < rangos.length; i++) {
      const rango = rangos[i];
      
      if (onProgress) {
        onProgress({
          estado: 'poblando',
          progreso: Math.round((i / rangos.length) * 100),
          cpsProcessados: i,
          coloniasInsertadas: totalInsertados,
          errores: totalErrores,
          mensaje: `Poblando ${rango.nombre} (${rango.inicio}-${rango.fin})`
        });
      }

      try {
        const result = await this.ejecutarPobladoRango(rango.inicio, rango.fin, modo);
        
        totalInsertados += result.insertados;
        totalOmitidos += result.omitidos;
        totalErrores += result.errores;
        
        if (result.detalles.length > 0) {
          detalles.push(`${rango.nombre}: ${result.insertados} colonias`);
        }
      } catch (error: any) {
        totalErrores++;
        detalles.push(`${rango.nombre}: Error - ${error.message}`);
        logger.error('catalogos', `Error poblando rango ${rango.inicio}-${rango.fin}`, { error: error.message });
      }

      // Pausa entre rangos para no saturar
      await this.delay(500);
    }

    if (onProgress) {
      onProgress({
        estado: 'completado',
        progreso: 100,
        cpsProcessados: rangos.length,
        coloniasInsertadas: totalInsertados,
        errores: totalErrores,
        mensaje: 'Poblado completado'
      });
    }

    logger.info('catalogos', `Poblado de ${estado} completado`, {
      insertados: totalInsertados,
      omitidos: totalOmitidos,
      errores: totalErrores,
      duracion_ms: Date.now() - startTime
    });

    return {
      success: totalErrores === 0,
      insertados: totalInsertados,
      actualizados: 0,
      omitidos: totalOmitidos,
      errores: totalErrores,
      duracion_ms: Date.now() - startTime,
      detalles
    };
  }

  /**
   * Ejecutar poblado de rango específico via edge function
   */
  private static async ejecutarPobladoRango(
    rangoInicio: string,
    rangoFin: string,
    modo: 'incremental' | 'force'
  ): Promise<{ insertados: number; omitidos: number; errores: number; detalles: string[] }> {
    const { data, error } = await supabase.functions.invoke('poblar-catalogos-cp', {
      body: {
        rangoInicio,
        rangoFin,
        modo
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      insertados: data?.resultados?.insertados || 0,
      omitidos: data?.resultados?.omitidos || 0,
      errores: data?.resultados?.errores || 0,
      detalles: data?.resultados?.detalles || []
    };
  }

  /**
   * Poblar códigos postales específicos
   */
  static async poblarCodigosEspecificos(
    codigosPostales: string[],
    modo: 'incremental' | 'force' = 'incremental'
  ): Promise<PobladoResult> {
    const startTime = Date.now();

    logger.info('catalogos', `Poblando ${codigosPostales.length} códigos postales específicos`);

    const { data, error } = await supabase.functions.invoke('poblar-catalogos-cp', {
      body: {
        codigosEspecificos: codigosPostales,
        modo
      }
    });

    if (error) {
      logger.error('catalogos', 'Error poblando CPs específicos', { error: error.message });
      throw new Error(error.message);
    }

    return {
      success: true,
      insertados: data?.resultados?.insertados || 0,
      actualizados: 0,
      omitidos: data?.resultados?.omitidos || 0,
      errores: data?.resultados?.errores || 0,
      duracion_ms: Date.now() - startTime,
      detalles: data?.resultados?.detalles || []
    };
  }

  /**
   * Obtener estadísticas actuales de catálogos
   */
  static async getEstadisticas(): Promise<{
    totalCPs: number;
    totalColonias: number;
    estadosCubiertos: string[];
    ultimaActualizacion: string | null;
  }> {
    // Contar CPs únicos
    const { count: totalCPs } = await supabase
      .from('codigos_postales_mexico')
      .select('codigo_postal', { count: 'exact', head: true });

    // Contar colonias totales
    const { count: totalColonias } = await supabase
      .from('codigos_postales_mexico')
      .select('*', { count: 'exact', head: true });

    // Obtener estados cubiertos
    const { data: estadosData } = await supabase
      .from('codigos_postales_mexico')
      .select('estado')
      .limit(1000);

    const estadosCubiertos = [...new Set(estadosData?.map(e => e.estado) || [])];

    // Última actualización
    const { data: lastUpdate } = await supabase
      .from('codigos_postales_mexico')
      .select('updated_at')
      .order('updated_at', { ascending: false })
      .limit(1);

    return {
      totalCPs: totalCPs || 0,
      totalColonias: totalColonias || 0,
      estadosCubiertos: estadosCubiertos.filter(Boolean) as string[],
      ultimaActualizacion: lastUpdate?.[0]?.updated_at || null
    };
  }

  /**
   * Obtener lista de estados disponibles para poblado
   */
  static getEstadosDisponibles(): string[] {
    return Object.keys(RANGOS_CP_ESTADOS);
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
