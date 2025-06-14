
import { supabase } from '@/integrations/supabase/client';

export interface PuntoRuta {
  id: string;
  latitud: number;
  longitud: number;
  direccion: string;
  tipo: 'origen' | 'destino' | 'parada';
  tiempo_estimado_parada?: number; // minutos
  ventana_horaria?: {
    inicio: string;
    fin: string;
  };
  prioridad?: number; // 1-5, siendo 5 la más alta
}

export interface RutaOptimizada {
  id: string;
  puntos: PuntoRuta[];
  orden_optimo: string[]; // IDs de puntos en orden óptimo
  distancia_total: number; // kilómetros
  tiempo_total: number; // minutos
  costo_estimado: number;
  consumo_combustible: number; // litros
  eficiencia_score: number; // 0-100
  alternativas?: RutaOptimizada[];
  factores_optimizacion: {
    distancia: number;
    tiempo: number;
    combustible: number;
    trafico: number;
    ventanas_horarias: number;
  };
  alertas?: string[];
  sugerencias?: string[];
}

export interface CriteriosOptimizacion {
  prioridad: 'distancia' | 'tiempo' | 'costo' | 'equilibrado';
  vehiculo?: {
    consumo_por_km: number;
    costo_por_km: number;
    velocidad_promedio: number;
  };
  restricciones?: {
    peso_maximo?: number;
    horario_inicio?: string;
    horario_fin?: string;
    evitar_autopistas?: boolean;
    evitar_centros_urbanos?: boolean;
  };
  consideraciones_trafico?: boolean;
  optimizar_ventanas_horarias?: boolean;
}

export class RouteOptimizer {
  private cache = new Map<string, RutaOptimizada>();
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutos

  async optimizarRuta(
    puntos: PuntoRuta[], 
    criterios: CriteriosOptimizacion = { prioridad: 'equilibrado' }
  ): Promise<RutaOptimizada> {
    const cacheKey = this.generarCacheKey(puntos, criterios);
    
    // Verificar cache
    const cached = this.obtenerDelCache(cacheKey);
    if (cached) return cached;

    try {
      console.log('[RouteOptimizer] Optimizando ruta con', puntos.length, 'puntos');

      // Usar Gemini AI para optimización inteligente
      const { data, error } = await supabase.functions.invoke('gemini-assistant', {
        body: {
          operation: 'optimize_route',
          data: {
            puntos,
            criterios
          }
        }
      });

      if (error) throw error;

      let rutaOptimizada: RutaOptimizada;

      if (data?.ruta_optimizada) {
        rutaOptimizada = data.ruta_optimizada;
      } else {
        // Fallback: optimización básica local
        rutaOptimizada = await this.optimizacionBasica(puntos, criterios);
      }

      // Calcular métricas adicionales
      rutaOptimizada = await this.calcularMetricasCompletas(rutaOptimizada, criterios);

      // Guardar en cache
      this.guardarEnCache(cacheKey, rutaOptimizada);

      return rutaOptimizada;

    } catch (error) {
      console.error('[RouteOptimizer] Error en optimización:', error);
      
      // Fallback: optimización básica
      const rutaBasica = await this.optimizacionBasica(puntos, criterios);
      return this.calcularMetricasCompletas(rutaBasica, criterios);
    }
  }

  private async optimizacionBasica(
    puntos: PuntoRuta[], 
    criterios: CriteriosOptimizacion
  ): Promise<RutaOptimizada> {
    // Algoritmo básico de nearest neighbor con mejoras
    const origen = puntos.find(p => p.tipo === 'origen');
    const destino = puntos.find(p => p.tipo === 'destino');
    const paradas = puntos.filter(p => p.tipo === 'parada');

    if (!origen || !destino) {
      throw new Error('Debe especificar al menos un origen y un destino');
    }

    let ordenOptimo = [origen.id];
    let puntoActual = origen;
    let paradasRestantes = [...paradas];

    // Ordenar paradas por prioridad y proximidad
    while (paradasRestantes.length > 0) {
      let mejorParada = paradasRestantes[0];
      let menorCosto = Infinity;

      for (const parada of paradasRestantes) {
        const distancia = this.calcularDistancia(puntoActual, parada);
        let costo = distancia;

        // Ajustar costo por prioridad
        if (parada.prioridad) {
          costo = costo / parada.prioridad;
        }

        // Ajustar por ventana horaria si es relevante
        if (criterios.optimizar_ventanas_horarias && parada.ventana_horaria) {
          costo = this.ajustarPorVentanaHoraria(costo, parada);
        }

        if (costo < menorCosto) {
          menorCosto = costo;
          mejorParada = parada;
        }
      }

      ordenOptimo.push(mejorParada.id);
      puntoActual = mejorParada;
      paradasRestantes = paradasRestantes.filter(p => p.id !== mejorParada.id);
    }

    ordenOptimo.push(destino.id);

    // Calcular métricas básicas
    const distanciaTotal = this.calcularDistanciaTotal(puntos, ordenOptimo);
    const tiempoTotal = this.calcularTiempoTotal(puntos, ordenOptimo, criterios);

    return {
      id: `ruta_${Date.now()}`,
      puntos,
      orden_optimo: ordenOptimo,
      distancia_total: distanciaTotal,
      tiempo_total: tiempoTotal,
      costo_estimado: 0, // Se calculará después
      consumo_combustible: 0, // Se calculará después
      eficiencia_score: 0, // Se calculará después
      factores_optimizacion: {
        distancia: 0.25,
        tiempo: 0.25,
        combustible: 0.25,
        trafico: 0.15,
        ventanas_horarias: 0.10
      }
    };
  }

  private async calcularMetricasCompletas(
    ruta: RutaOptimizada, 
    criterios: CriteriosOptimizacion
  ): Promise<RutaOptimizada> {
    
    // Cálculos de costo
    const costoBase = criterios.vehiculo?.costo_por_km || 12; // MXN por km
    const costoEstimado = ruta.distancia_total * costoBase;

    // Cálculos de combustible
    const consumoPorKm = criterios.vehiculo?.consumo_por_km || 0.15; // litros por km
    const consumoCombustible = ruta.distancia_total * consumoPorKm;

    // Score de eficiencia (combinación de factores)
    const eficienciaScore = this.calcularEficienciaScore(ruta, criterios);

    // Generar alertas y sugerencias
    const alertas = this.generarAlertas(ruta, criterios);
    const sugerencias = this.generarSugerencias(ruta, criterios);

    return {
      ...ruta,
      costo_estimado: costoEstimado,
      consumo_combustible: consumoCombustible,
      eficiencia_score: eficienciaScore,
      alertas,
      sugerencias
    };
  }

  private calcularDistancia(punto1: PuntoRuta, punto2: PuntoRuta): number {
    // Fórmula de Haversine para calcular distancia entre coordenadas
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(punto2.latitud - punto1.latitud);
    const dLon = this.deg2rad(punto2.longitud - punto1.longitud);
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(punto1.latitud)) * Math.cos(this.deg2rad(punto2.latitud)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  private calcularDistanciaTotal(puntos: PuntoRuta[], orden: string[]): number {
    let distanciaTotal = 0;
    
    for (let i = 0; i < orden.length - 1; i++) {
      const puntoActual = puntos.find(p => p.id === orden[i])!;
      const siguientePunto = puntos.find(p => p.id === orden[i + 1])!;
      distanciaTotal += this.calcularDistancia(puntoActual, siguientePunto);
    }
    
    return Math.round(distanciaTotal * 100) / 100; // Redondear a 2 decimales
  }

  private calcularTiempoTotal(
    puntos: PuntoRuta[], 
    orden: string[], 
    criterios: CriteriosOptimizacion
  ): number {
    const velocidadPromedio = criterios.vehiculo?.velocidad_promedio || 50; // km/h
    const distanciaTotal = this.calcularDistanciaTotal(puntos, orden);
    
    let tiempoViaje = (distanciaTotal / velocidadPromedio) * 60; // minutos
    
    // Agregar tiempo de paradas
    for (const puntoId of orden) {
      const punto = puntos.find(p => p.id === puntoId);
      if (punto?.tiempo_estimado_parada) {
        tiempoViaje += punto.tiempo_estimado_parada;
      }
    }
    
    return Math.round(tiempoViaje);
  }

  private ajustarPorVentanaHoraria(costo: number, parada: PuntoRuta): number {
    // Lógica simplificada para ajustar costo por ventana horaria
    if (!parada.ventana_horaria) return costo;
    
    const ahora = new Date();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
    
    const [horaInicio, minutoInicio] = parada.ventana_horaria.inicio.split(':').map(Number);
    const [horaFin, minutoFin] = parada.ventana_horaria.fin.split(':').map(Number);
    
    const inicioVentana = horaInicio * 60 + minutoInicio;
    const finVentana = horaFin * 60 + minutoFin;
    
    if (horaActual >= inicioVentana && horaActual <= finVentana) {
      return costo * 0.8; // Reducir costo si está dentro de la ventana
    } else {
      return costo * 1.5; // Aumentar costo si está fuera de la ventana
    }
  }

  private calcularEficienciaScore(
    ruta: RutaOptimizada, 
    criterios: CriteriosOptimizacion
  ): number {
    let score = 100;
    
    // Penalizar rutas muy largas
    if (ruta.distancia_total > 500) {
      score -= 20;
    } else if (ruta.distancia_total > 300) {
      score -= 10;
    }
    
    // Bonificar rutas eficientes en tiempo
    if (ruta.tiempo_total < ruta.distancia_total * 2) { // Menos de 2 min por km
      score += 10;
    }
    
    // Ajustar por número de paradas
    const numeroParadas = ruta.puntos.filter(p => p.tipo === 'parada').length;
    if (numeroParadas > 5) {
      score -= numeroParadas * 2;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  private generarAlertas(
    ruta: RutaOptimizada, 
    criterios: CriteriosOptimizacion
  ): string[] {
    const alertas: string[] = [];
    
    if (ruta.distancia_total > 500) {
      alertas.push('Ruta muy larga: considere dividir en múltiples viajes');
    }
    
    if (ruta.tiempo_total > 12 * 60) { // Más de 12 horas
      alertas.push('Tiempo de viaje excede límites legales de conducción');
    }
    
    if (ruta.puntos.some(p => p.ventana_horaria)) {
      alertas.push('Verificar cumplimiento de ventanas horarias');
    }
    
    return alertas;
  }

  private generarSugerencias(
    ruta: RutaOptimizada, 
    criterios: CriteriosOptimizacion
  ): string[] {
    const sugerencias: string[] = [];
    
    if (ruta.eficiencia_score < 70) {
      sugerencias.push('Considere reorganizar paradas para mejorar eficiencia');
    }
    
    if (ruta.consumo_combustible > 50) {
      sugerencias.push('Alto consumo de combustible: evalúe vehículo más eficiente');
    }
    
    const numeroParadas = ruta.puntos.filter(p => p.tipo === 'parada').length;
    if (numeroParadas > 8) {
      sugerencias.push('Muchas paradas: considere dividir en rutas más pequeñas');
    }
    
    return sugerencias;
  }

  private generarCacheKey(puntos: PuntoRuta[], criterios: CriteriosOptimizacion): string {
    const puntosString = puntos.map(p => `${p.id}_${p.latitud}_${p.longitud}`).join('|');
    const criteriosString = JSON.stringify(criterios);
    return `route_${btoa(puntosString + criteriosString)}`;
  }

  private obtenerDelCache(key: string): RutaOptimizada | null {
    const cached = this.cache.get(key);
    if (cached) {
      // Verificar si no ha expirado (simplificado)
      return cached;
    }
    return null;
  }

  private guardarEnCache(key: string, ruta: RutaOptimizada): void {
    this.cache.set(key, ruta);
    
    // Limpiar cache después de cierto tiempo
    setTimeout(() => {
      this.cache.delete(key);
    }, this.CACHE_DURATION);
  }

  async calcularCostoRuta(distancia: number, tiempoHoras: number): Promise<number> {
    // Cálculo básico de costo
    const costoPorKm = 12; // MXN base
    const costoPorHora = 150; // MXN conductor
    const costoFijo = 200; // MXN operación
    
    return costoPorKm * distancia + costoPorHora * tiempoHoras + costoFijo;
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const routeOptimizer = new RouteOptimizer();
