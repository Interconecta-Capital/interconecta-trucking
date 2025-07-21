
// Tipos y constantes para benchmarks de costos vehiculares según industria mexicana

export type ConfiguracionVehicular = 'C2' | 'C3' | 'T2S1' | 'T3S2' | 'T3S3';

export type TipoCombustible = 'diesel' | 'gasolina';

export interface BenchmarkVehicular {
  configuracion: ConfiguracionVehicular;
  descripcion: string;
  rendimiento_km_por_litro: number;
  costo_llantas_por_km: number;
  costo_mantenimiento_por_km: number;
  numero_llantas: number;
  numero_ejes: number;
  factor_peajes: number;
  peso_bruto_vehicular_toneladas: number;
  capacidad_carga_toneladas: number;
}

// Benchmarks basados en IMT/CANACAR y documentación técnica
export const BENCHMARKS_VEHICULARES: Record<ConfiguracionVehicular, BenchmarkVehicular> = {
  'C2': {
    configuracion: 'C2',
    descripcion: 'Camión Unitario de 2 ejes',
    rendimiento_km_por_litro: 4.5, // Mayor rendimiento que tractocamión
    costo_llantas_por_km: 0.65,
    costo_mantenimiento_por_km: 1.50,
    numero_llantas: 6,
    numero_ejes: 2,
    factor_peajes: 1.0, // Base para camión unitario
    peso_bruto_vehicular_toneladas: 17.0,
    capacidad_carga_toneladas: 9.0
  },
  'C3': {
    configuracion: 'C3',
    descripcion: 'Camión Unitario de 3 ejes',
    rendimiento_km_por_litro: 4.0,
    costo_llantas_por_km: 0.85,
    costo_mantenimiento_por_km: 1.75,
    numero_llantas: 10,
    numero_ejes: 3,
    factor_peajes: 1.5,
    peso_bruto_vehicular_toneladas: 25.5,
    capacidad_carga_toneladas: 16.5
  },
  'T2S1': {
    configuracion: 'T2S1',
    descripcion: 'Tractocamión con Semirremolque de 1 eje',
    rendimiento_km_por_litro: 3.0,
    costo_llantas_por_km: 0.95,
    costo_mantenimiento_por_km: 2.00,
    numero_llantas: 14,
    numero_ejes: 4,
    factor_peajes: 2.0,
    peso_bruto_vehicular_toneladas: 40.0,
    capacidad_carga_toneladas: 25.0
  },
  'T3S2': {
    configuracion: 'T3S2',
    descripcion: 'Tractocamión con Semirremolque de 2 ejes',
    rendimiento_km_por_litro: 2.26, // Según documentación técnica
    costo_llantas_por_km: 1.08, // Basado en 18 llantas
    costo_mantenimiento_por_km: 2.07, // Estándar industria
    numero_llantas: 18,
    numero_ejes: 5,
    factor_peajes: 2.5, // Factor alto por 5 ejes
    peso_bruto_vehicular_toneladas: 48.5,
    capacidad_carga_toneladas: 33.5
  },
  'T3S3': {
    configuracion: 'T3S3',
    descripcion: 'Tractocamión con Semirremolque de 3 ejes',
    rendimiento_km_por_litro: 2.0,
    costo_llantas_por_km: 1.25,
    costo_mantenimiento_por_km: 2.30,
    numero_llantas: 22,
    numero_ejes: 6,
    factor_peajes: 3.0, // Factor máximo por 6 ejes
    peso_bruto_vehicular_toneladas: 54.0,
    capacidad_carga_toneladas: 38.0
  }
};

// Precios de referencia combustible (actualizables)
export const PRECIOS_COMBUSTIBLE_BASE = {
  diesel: 24.50, // MXN por litro (promedio México 2024)
  gasolina: 23.80
};

// Tarifas viáticos según región
export const TARIFAS_VIATICOS = {
  nacional_promedio: 1500, // MXN por día
  limite_sat_alimentacion: 750, // Límite deducible SAT
  urbano: 1200,
  carretera: 1800,
  frontera: 2200
};

// Factores de ajuste por tipo de operación
export const FACTORES_OPERACION = {
  transporte_pesado: {
    base_por_km: 1.0,
    factor_urgencia: 1.15,
    factor_carga_especializada: 1.25,
    factor_materiales_peligrosos: 1.40
  },
  ultima_milla: {
    costo_base_por_hora: 280, // MXN por hora
    costo_por_parada: 45, // MXN por parada
    factor_zona_urbana: 1.2,
    factor_trafico_peak: 1.35
  }
};

export function obtenerBenchmarkVehicular(configuracion: ConfiguracionVehicular): BenchmarkVehicular {
  return BENCHMARKS_VEHICULARES[configuracion];
}

export function calcularCostoCombustiblePorKm(
  configuracion: ConfiguracionVehicular, 
  tipoCombustible: TipoCombustible = 'diesel',
  precioActual?: number
): number {
  const benchmark = obtenerBenchmarkVehicular(configuracion);
  const precio = precioActual || PRECIOS_COMBUSTIBLE_BASE[tipoCombustible];
  return precio / benchmark.rendimiento_km_por_litro;
}
