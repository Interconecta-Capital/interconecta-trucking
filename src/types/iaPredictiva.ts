
export interface AnalisisIA {
  precision: {
    exactitudCosto: number; // % precisión histórica
    exactitudTiempo: number; // % precisión temporal
    factorCorreccionCosto: number; // ajuste automático
    factorCorreccionTiempo: number; // ajuste temporal
    confianza: number; // nivel de confianza
    totalViajes: number; // datos históricos disponibles
  };
  mercado: {
    precioPromedio: number; // por ruta
    precioMinimo: number;
    precioMaximo: number;
    margenPromedio: number;
    rangoCompetitivo: [number, number];
    tendencia: 'subida' | 'bajada' | 'estable';
    totalCotizaciones: number;
  };
  sugerencias: {
    precioOptimo: number;
    probabilidadAceptacion: number;
    justificacion: string;
    recomendaciones: string[];
  };
}

export interface AnalisisViaje {
  id: string;
  viaje_id?: string;
  ruta_hash: string;
  costo_estimado?: number;
  costo_real?: number;
  precio_cobrado?: number;
  margen_real?: number;
  tiempo_estimado?: number;
  tiempo_real?: number;
  fecha_viaje: string;
  vehiculo_tipo?: string;
  cliente_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface DatosPrecision {
  exactitud_costo: number;
  exactitud_tiempo: number;
  factor_correccion_costo: number;
  factor_correccion_tiempo: number;
  total_viajes: number;
}

export interface DatosMercado {
  precio_promedio: number;
  precio_minimo: number;
  precio_maximo: number;
  margen_promedio: number;
  total_cotizaciones: number;
  tendencia: string;
}
