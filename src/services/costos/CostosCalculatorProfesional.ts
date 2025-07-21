
import { ConfiguracionVehicular, TipoCombustible, obtenerBenchmarkVehicular, calcularCostoCombustiblePorKm, TARIFAS_VIATICOS, FACTORES_OPERACION } from '@/types/vehiculosBenchmarks';

export interface ParametrosCalculoCostos {
  distanciaKm: number;
  tiempoEstimadoHoras?: number;
  configuracionVehicular: ConfiguracionVehicular;
  tipoCombustible?: TipoCombustible;
  tipoOperacion: 'transporte_pesado' | 'ultima_milla';
  incluirConductor?: boolean;
  precioActualCombustible?: number;
  factorUrgencia?: boolean;
  materialesPeligrosos?: boolean;
  // Parámetros para última milla
  numeroParadas?: number;
  tiempoPromedioParada?: number; // minutos
  zonaUrbana?: boolean;
}

export interface ResultadoCalculoCostos {
  costos: {
    combustible: number;
    llantas: number;
    mantenimiento: number;
    viaticos: number;
    conductor: number;
    peajes_estimados: number;
  };
  costoTotalVariable: number;
  // Para última milla
  costoPorHora?: number;
  costoPorParada?: number;
  recomendaciones: string[];
}

export class CostosCalculatorProfesional {
  
  static calcularCostosViaje(parametros: ParametrosCalculoCostos): ResultadoCalculoCostos {
    const {
      distanciaKm,
      tiempoEstimadoHoras,
      configuracionVehicular,
      tipoCombustible = 'diesel',
      tipoOperacion,
      incluirConductor = true,
      precioActualCombustible,
      factorUrgencia = false,
      materialesPeligrosos = false,
      numeroParadas = 0,
      tiempoPromedioParada = 15,
      zonaUrbana = false
    } = parametros;

    if (tipoOperacion === 'ultima_milla') {
      return this.calcularCostosUltimaMilla(parametros);
    }

    return this.calcularCostosTransportePesado(parametros);
  }

  private static calcularCostosTransportePesado(parametros: ParametrosCalculoCostos): ResultadoCalculoCostos {
    const {
      distanciaKm,
      tiempoEstimadoHoras,
      configuracionVehicular,
      tipoCombustible = 'diesel',
      incluirConductor = true,
      precioActualCombustible,
      factorUrgencia = false,
      materialesPeligrosos = false
    } = parametros;

    const benchmark = obtenerBenchmarkVehicular(configuracionVehicular);
    const recomendaciones: string[] = [];

    // 1. Costo de Combustible (componente más importante)
    const costoCombustiblePorKm = calcularCostoCombustiblePorKm(
      configuracionVehicular, 
      tipoCombustible, 
      precioActualCombustible
    );
    const combustible = Math.round(costoCombustiblePorKm * distanciaKm);

    // 2. Costo de Llantas (desgaste por km)
    const llantas = Math.round(benchmark.costo_llantas_por_km * distanciaKm);

    // 3. Costo de Mantenimiento (desgaste mecánico)
    const mantenimiento = Math.round(benchmark.costo_mantenimiento_por_km * distanciaKm);

    // 4. Viáticos (basado en duración del viaje)
    const tiempoViaje = tiempoEstimadoHoras || (distanciaKm / 60); // 60 km/h promedio
    const diasViaje = Math.ceil(tiempoViaje / 24);
    const viaticos = diasViaje * TARIFAS_VIATICOS.nacional_promedio;

    // 5. Costo del conductor (si aplica)
    let conductor = 0;
    if (incluirConductor) {
      // Salario base más bono por km
      const bonoKm = 1.50; // MXN por km promedio industria
      conductor = Math.round(distanciaKm * bonoKm);
      
      // Salario mínimo si el bono es muy bajo
      if (conductor < 1000) {
        conductor = 1000;
      }
    }

    // 6. Estimación de peajes (se refinará con API externa)
    const peajes_estimados = Math.round(distanciaKm * 2.80 * benchmark.factor_peajes);

    // Aplicar factores de ajuste
    let costoTotalVariable = combustible + llantas + mantenimiento + viaticos + conductor + peajes_estimados;
    
    if (factorUrgencia) {
      costoTotalVariable *= FACTORES_OPERACION.transporte_pesado.factor_urgencia;
      recomendaciones.push('💰 Factor de urgencia aplicado (+15%)');
    }
    
    if (materialesPeligrosos) {
      costoTotalVariable *= FACTORES_OPERACION.transporte_pesado.factor_materiales_peligrosos;
      recomendaciones.push('⚠️ Factor materiales peligrosos aplicado (+40%)');
    }

    // Validaciones y recomendaciones
    if (distanciaKm > 800) {
      recomendaciones.push('🛣️ Viaje de larga distancia - considerar conductor de relevo');
    }
    
    if (combustible / costoTotalVariable > 0.45) {
      recomendaciones.push('⛽ Alto costo de combustible - evaluar ruta más eficiente');
    }

    const costos = {
      combustible,
      llantas,
      mantenimiento,
      viaticos,
      conductor,
      peajes_estimados
    };

    return {
      costos,
      costoTotalVariable: Math.round(costoTotalVariable),
      recomendaciones
    };
  }

  private static calcularCostosUltimaMilla(parametros: ParametrosCalculoCostos): ResultadoCalculoCostos {
    const {
      tiempoEstimadoHoras = 4,
      numeroParadas = 1,
      tiempoPromedioParada = 15,
      zonaUrbana = true,
      incluirConductor = true
    } = parametros;

    const recomendaciones: string[] = [];
    
    // Para última milla el costo se basa en tiempo y número de paradas
    let costoPorHora = FACTORES_OPERACION.ultima_milla.costo_base_por_hora;
    const costoPorParada = FACTORES_OPERACION.ultima_milla.costo_por_parada;
    
    if (zonaUrbana) {
      costoPorHora *= FACTORES_OPERACION.ultima_milla.factor_zona_urbana;
      recomendaciones.push('🏙️ Factor zona urbana aplicado (+20%)');
    }

    // Tiempo total incluyendo tiempo de servicio en paradas
    const tiempoServicioHoras = (numeroParadas * tiempoPromedioParada) / 60;
    const tiempoTotalHoras = tiempoEstimadoHoras + tiempoServicioHoras;

    const costoTotalTiempo = Math.round(costoPorHora * tiempoTotalHoras);
    const costoTotalParadas = Math.round(costoPorParada * numeroParadas);
    
    // Costos simplificados para última milla
    const combustible = Math.round(tiempoTotalHoras * 85); // Consumo urbano
    const mantenimiento = Math.round(tiempoTotalHoras * 25); // Desgaste urbano
    const conductor = incluirConductor ? Math.round(tiempoTotalHoras * 180) : 0; // Salario por hora

    const costoTotalVariable = costoTotalTiempo + costoTotalParadas + combustible + mantenimiento + conductor;

    // Recomendaciones específicas
    if (numeroParadas > 15) {
      recomendaciones.push('📦 Alto número de paradas - optimizar ruta con algoritmo TSP');
    }
    
    if (tiempoPromedioParada > 20) {
      recomendaciones.push('⏱️ Tiempo de parada alto - evaluar eficiencia en entrega');
    }

    const costos = {
      combustible,
      llantas: 0, // Menos relevante en última milla
      mantenimiento,
      viaticos: 0, // No aplica en distribución local
      conductor,
      peajes_estimados: 0 // Generalmente no hay peajes en última milla
    };

    return {
      costos,
      costoTotalVariable: Math.round(costoTotalVariable),
      costoPorHora,
      costoPorParada,
      recomendaciones
    };
  }

  // Método para obtener costo fijo prorrateado (se implementará en Fase 2)
  static calcularCostoFijoProrrateado(
    costosFixosAnuales: number,
    kilometrajeAnualProyectado: number,
    distanciaViaje: number
  ): number {
    const costoFijoPorKm = costosFixosAnuales / kilometrajeAnualProyectado;
    return Math.round(costoFijoPorKm * distanciaViaje);
  }
}
