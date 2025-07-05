
export interface PerformanceConductor {
  metricas: {
    eficienciaCombustible: number; // km/litro real vs esperado
    puntualidad: number; // % entregas a tiempo
    cuidadoVehiculo: number; // basado en reportes mantenimiento
    satisfaccionCliente: number; // promedio calificaciones
  };
  tendencias: {
    mejora: boolean;
    areaMejora: string[];
    fortalezas: string[];
  };
  recomendaciones: {
    capacitacion: string[];
    rutasOptimas: string[];
    tiposCargaIdeales: string[];
  };
}

export interface CalificacionConductor {
  id: string;
  conductor_id: string;
  viaje_id?: string;
  cliente_id?: string;
  calificacion: number; // 1-5 estrellas
  comentarios?: string;
  tipo_calificacion: 'cliente_a_conductor' | 'conductor_a_cliente';
  criterios: {
    puntualidad?: number;
    trato?: number;
    cuidado_carga?: number;
    comunicacion?: number;
    profesionalismo?: number;
  };
  created_at: string;
  user_id: string;
}

export interface MetricaConductor {
  id: string;
  conductor_id: string;
  fecha: string;
  km_recorridos: number;
  combustible_consumido: number;
  viajes_completados: number;
  entregas_a_tiempo: number;
  total_entregas: number;
  incidentes: number;
  costo_total: number;
  ingresos_total: number;
  tiempo_conduccion_horas: number;
  created_at: string;
  user_id: string;
}

export interface ConductorExtendido {
  id: string;
  nombre: string;
  rfc?: string;
  curp?: string;
  num_licencia?: string;
  tipo_licencia?: string;
  vigencia_licencia?: string;
  telefono?: string;
  email?: string;
  estado: string;
  activo: boolean;
  historial_performance: {
    viajes_completados: number;
    km_totales: number;
    calificacion_promedio: number;
    incidentes: number;
    eficiencia_combustible: number;
    puntualidad_promedio: number;
    costo_promedio_viaje: number;
  };
  certificaciones: {
    materiales_peligrosos: boolean;
    carga_especializada: boolean;
    primeros_auxilios: boolean;
    manejo_defensivo: boolean;
    vigencias: Record<string, string>;
  };
  preferencias: {
    rutas_preferidas: string[];
    tipos_carga: string[];
    disponibilidad_horarios: Record<string, any>;
    radio_operacion_km: number;
  };
  performance?: PerformanceConductor;
}

export interface AsignacionInteligente {
  conductor_id: string;
  score_compatibilidad: number;
  factores: {
    distancia: number;
    especializacion: number;
    disponibilidad: number;
    performance: number;
    preferencias: number;
  };
  recomendacion: 'alta' | 'media' | 'baja';
  observaciones: string[];
}
