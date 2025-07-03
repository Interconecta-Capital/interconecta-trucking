
import { supabase } from '@/integrations/supabase/client';
import { AnalisisIA, AnalisisViaje, DatosPrecision, DatosMercado } from '@/types/iaPredictiva';

export class IAPredictiva {
  // Generar hash único para una ruta
  private async generarHashRuta(origen: string, destino: string): Promise<string> {
    const { data, error } = await supabase.rpc('generar_hash_ruta', {
      origen: origen.trim(),
      destino: destino.trim()
    });
    
    if (error) {
      console.error('Error generando hash de ruta:', error);
      // Fallback local
      const rutaString = `${origen.toLowerCase().trim()}|${destino.toLowerCase().trim()}`;
      return btoa(rutaString).slice(0, 32);
    }
    
    return data;
  }

  // Registrar análisis de viaje
  async registrarAnalisisViaje(datos: Partial<AnalisisViaje>): Promise<AnalisisViaje | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const datosCompletos = {
        viaje_id: datos.viaje_id,
        ruta_hash: datos.ruta_hash || '',
        costo_estimado: datos.costo_estimado,
        costo_real: datos.costo_real,
        precio_cobrado: datos.precio_cobrado,
        margen_real: datos.margen_real,
        tiempo_estimado: datos.tiempo_estimado,
        tiempo_real: datos.tiempo_real,
        fecha_viaje: datos.fecha_viaje || new Date().toISOString().split('T')[0], // Ensure fecha_viaje is provided
        vehiculo_tipo: datos.vehiculo_tipo,
        cliente_id: datos.cliente_id,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('analisis_viajes')
        .insert(datosCompletos)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error registrando análisis de viaje:', error);
      return null;
    }
  }

  // Obtener análisis completo para una ruta
  async analizarRuta(origen: string, destino: string): Promise<AnalisisIA> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const rutaHash = await this.generarHashRuta(origen, destino);

      // Obtener datos de precisión
      const { data: precisionData, error: precisionError } = await supabase
        .rpc('calcular_precision_ruta', {
          p_user_id: user.id,
          p_ruta_hash: rutaHash
        });

      if (precisionError) {
        console.error('Error calculando precisión:', precisionError);
      }

      // Obtener datos de mercado
      const { data: mercadoData, error: mercadoError } = await supabase
        .rpc('analizar_mercado_ruta', {
          p_user_id: user.id,
          p_ruta_hash: rutaHash
        });

      if (mercadoError) {
        console.error('Error analizando mercado:', mercadoError);
      }

      const precision: DatosPrecision = precisionData?.[0] || {
        exactitud_costo: 0,
        exactitud_tiempo: 0,
        factor_correccion_costo: 1,
        factor_correccion_tiempo: 1,
        total_viajes: 0
      };

      const mercado: DatosMercado = mercadoData?.[0] || {
        precio_promedio: 0,
        precio_minimo: 0,
        precio_maximo: 0,
        margen_promedio: 0,
        total_cotizaciones: 0,
        tendencia: 'estable'
      };

      // Generar sugerencias inteligentes
      const sugerencias = this.generarSugerencias(precision, mercado, origen, destino);

      return {
        precision: {
          exactitudCosto: Number(precision.exactitud_costo),
          exactitudTiempo: Number(precision.exactitud_tiempo),
          factorCorreccionCosto: Number(precision.factor_correccion_costo),
          factorCorreccionTiempo: Number(precision.factor_correccion_tiempo),
          confianza: this.calcularConfianza(precision.total_viajes),
          totalViajes: precision.total_viajes
        },
        mercado: {
          precioPromedio: Number(mercado.precio_promedio),
          precioMinimo: Number(mercado.precio_minimo),
          precioMaximo: Number(mercado.precio_maximo),
          margenPromedio: Number(mercado.margen_promedio),
          rangoCompetitivo: [
            Number(mercado.precio_minimo) * 0.95,
            Number(mercado.precio_maximo) * 1.05
          ],
          tendencia: mercado.tendencia as 'subida' | 'bajada' | 'estable',
          totalCotizaciones: mercado.total_cotizaciones
        },
        sugerencias
      };

    } catch (error) {
      console.error('Error en análisis de ruta:', error);
      return this.getAnalisisVacio();
    }
  }

  // Generar sugerencias basadas en datos históricos
  private generarSugerencias(
    precision: DatosPrecision, 
    mercado: DatosMercado, 
    origen: string, 
    destino: string
  ) {
    const precioPromedio = Number(mercado.precio_promedio);
    const margenPromedio = Number(mercado.margen_promedio);
    const exactitudCosto = Number(precision.exactitud_costo);
    
    let precioOptimo = precioPromedio;
    let probabilidadAceptacion = 50;
    let justificacion = 'Precio basado en promedio histórico';
    const recomendaciones: string[] = [];

    // Ajustar precio según tendencia
    if (mercado.tendencia === 'subida') {
      precioOptimo = precioPromedio * 1.08;
      probabilidadAceptacion += 15;
      justificacion = 'Tendencia alcista detectada - precio optimizado al alza';
      recomendaciones.push('📈 Mercado en crecimiento - buen momento para incrementar precios');
    } else if (mercado.tendencia === 'bajada') {
      precioOptimo = precioPromedio * 0.95;
      probabilidadAceptacion += 10;
      justificacion = 'Tendencia bajista - precio competitivo recomendado';
      recomendaciones.push('📉 Mercado en descenso - considerar precios más competitivos');
    }

    // Ajustar según precisión histórica
    if (exactitudCosto > 85) {
      probabilidadAceptacion += 20;
      recomendaciones.push('🎯 Alta precisión en estimaciones - confiabilidad elevada');
    } else if (exactitudCosto < 60) {
      probabilidadAceptacion -= 15;
      recomendaciones.push('⚠️ Baja precisión histórica - revisar metodología de cálculo');
    }

    // Ajustar según margen
    if (margenPromedio > 25) {
      recomendaciones.push('💰 Márgenes saludables en esta ruta');
    } else if (margenPromedio < 10) {
      precioOptimo = precioPromedio * 1.05;
      justificacion += ' - Incremento sugerido por márgenes bajos';
      recomendaciones.push('⚡ Márgenes bajos - considerar optimización de costos');
    }

    // Limitar probabilidad
    probabilidadAceptacion = Math.max(10, Math.min(95, probabilidadAceptacion));

    // Recomendaciones específicas de ruta
    if (mercado.total_cotizaciones < 3) {
      recomendaciones.push('📊 Datos limitados para esta ruta - aumentar historial gradualmente');
    }

    if (precision.total_viajes >= 10) {
      recomendaciones.push('📈 Suficientes datos históricos - predicciones más confiables');
    }

    return {
      precioOptimo: Math.round(precioOptimo),
      probabilidadAceptacion: Math.round(probabilidadAceptacion),
      justificacion,
      recomendaciones
    };
  }

  // Calcular nivel de confianza basado en cantidad de datos
  private calcularConfianza(totalViajes: number): number {
    if (totalViajes >= 20) return 95;
    if (totalViajes >= 10) return 80;
    if (totalViajes >= 5) return 65;
    if (totalViajes >= 2) return 45;
    return 20;
  }

  // Análisis vacío para casos sin datos
  private getAnalisisVacio(): AnalisisIA {
    return {
      precision: {
        exactitudCosto: 0,
        exactitudTiempo: 0,
        factorCorreccionCosto: 1,
        factorCorreccionTiempo: 1,
        confianza: 20,
        totalViajes: 0
      },
      mercado: {
        precioPromedio: 0,
        precioMinimo: 0,
        precioMaximo: 0,
        margenPromedio: 0,
        rangoCompetitivo: [0, 0],
        tendencia: 'estable',
        totalCotizaciones: 0
      },
      sugerencias: {
        precioOptimo: 0,
        probabilidadAceptacion: 20,
        justificacion: 'Sin datos históricos suficientes',
        recomendaciones: [
          '📊 Ruta nueva - generar más datos para mejores predicciones',
          '🎯 Establecer precio base y monitorear resultados',
          '📈 Registrar costos reales para mejorar precisión futura'
        ]
      }
    };
  }

  // Obtener historial de análisis
  async obtenerHistorialAnalisis(limite: number = 50): Promise<AnalisisViaje[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('analisis_viajes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limite);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo historial:', error);
      return [];
    }
  }

  // Aplicar factor de corrección a estimación
  aplicarFactorCorreccion(
    costoEstimado: number, 
    factorCorreccion: number, 
    tipoAjuste: 'conservador' | 'moderado' | 'agresivo' = 'moderado'
  ): number {
    let ajuste = factorCorreccion;
    
    switch (tipoAjuste) {
      case 'conservador':
        ajuste = 1 + ((factorCorreccion - 1) * 0.5);
        break;
      case 'agresivo':
        ajuste = 1 + ((factorCorreccion - 1) * 1.2);
        break;
      case 'moderado':
      default:
        // Usar factor sin modificar
        break;
    }

    return Math.round(costoEstimado * ajuste);
  }
}

export const iaPredictiva = new IAPredictiva();
