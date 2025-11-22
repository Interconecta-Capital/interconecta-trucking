
// Unified Viaje type definition with expanded fields
export interface Viaje {
  id: string;
  carta_porte_id: string;
  factura_id?: string; // 🔥 NUEVO: Relación con factura
  origen: string;
  destino: string;
  conductor_id?: string;
  vehiculo_id?: string;
  socio_id?: string;
  remolque_id?: string;
  estado: 'programado' | 'en_transito' | 'completado' | 'cancelado' | 'retrasado' | 'borrador';
  fecha_inicio_programada: string;
  fecha_inicio_real?: string;
  fecha_fin_programada: string;
  fecha_fin_real?: string;
  observaciones?: string;
  
  // IMPORTANTE: tipo_servicio NO es columna directa, está en tracking_data JSONB
  // Valores: 'flete_pagado' | 'flete_por_cobrar'
  tipo_servicio?: string;
  
  // Datos de tracking en JSONB: tipo_servicio, cliente, ubicaciones, etc.
  // ISO 27001 A.18.1.3 - Auditoría completa en JSONB
  tracking_data?: {
    tipo_servicio?: string;
    viaje_id?: string;
    factura_id?: string;
    borrador_carta_porte_id?: string;
    fecha_creacion?: string;
    flujo_completo_creado?: boolean;
    created_from?: string;
    cliente?: {
      id: string;
      nombre_razon_social: string;
      rfc: string;
      uso_cfdi?: string;
      regimen_fiscal?: string;
    };
    ubicaciones?: {
      origen: any;
      destino: any;
    };
    descripcionMercancia?: string;
    ruta?: any;
    ultima_actualizacion?: string;
    [key: string]: any;
  };
  
  user_id: string;
  created_at: string;
  updated_at: string;
  
  // Nuevos campos de costos y rentabilidad
  costo_estimado?: number;
  costo_real?: number;
  precio_cobrado?: number;
  margen_estimado?: number;
  margen_real?: number;
  
  // Campos de ruta y tiempo
  ruta_origen?: string;
  ruta_destino?: string;
  distancia_km?: number;
  tiempo_estimado_horas?: number;
  tiempo_real_horas?: number;
  
  // Campos de costos detallados
  combustible_estimado?: number;
  combustible_real?: number;
  peajes_estimados?: number;
  peajes_reales?: number;
}

// Nuevos tipos para remolques
export interface Remolque {
  id: string;
  user_id: string;
  numero_serie: string;
  placa: string;
  marca?: string;
  modelo?: string;
  año?: number;
  tipo_remolque: string;
  capacidad_carga_kg: number;
  estado: 'disponible' | 'asignado' | 'en_transito' | 'mantenimiento' | 'fuera_servicio' | 'vendido' | 'robado';
  vehiculo_asignado_id?: string;
  viaje_actual_id?: string;
  fecha_proxima_disponibilidad?: string;
  motivo_no_disponible?: string;
  ubicacion_actual?: string;
  vigencia_seguro?: string;
  verificacion_vigencia?: string;
  observaciones?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

// Tipo para programaciones
export interface Programacion {
  id: string;
  user_id: string;
  entidad_tipo: 'conductor' | 'vehiculo' | 'remolque' | 'socio';
  entidad_id: string;
  tipo_programacion: 'viaje' | 'mantenimiento' | 'baja_temporal' | 'vacaciones' | 'reparacion' | 'inspeccion' | 'capacitacion';
  fecha_inicio: string;
  fecha_fin?: string;
  sin_fecha_fin: boolean;
  estado: 'programado' | 'en_curso' | 'completado' | 'cancelado' | 'reprogramado';
  descripcion: string;
  costo?: number;
  proveedor?: string;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

// Tipo para costos detallados
export interface CostosViaje {
  id: string;
  viaje_id: string;
  user_id: string;
  
  // Costos estimados
  combustible_estimado: number;
  peajes_estimados: number;
  casetas_estimadas: number;
  mantenimiento_estimado: number;
  salario_conductor_estimado: number;
  otros_costos_estimados: number;
  costo_total_estimado: number;
  
  // Costos reales
  combustible_real?: number;
  peajes_reales?: number;
  casetas_reales?: number;
  mantenimiento_real?: number;
  salario_conductor_real?: number;
  otros_costos_reales?: number;
  costo_total_real?: number;
  
  // Precios y márgenes
  precio_cotizado: number;
  precio_final_cobrado?: number;
  margen_estimado: number;
  margen_real?: number;
  
  // Metadatos
  notas_costos?: string;
  comprobantes_urls: string[];
  
  created_at: string;
  updated_at: string;
}

// Tipo para validación de disponibilidad
export interface ValidacionDisponibilidad {
  disponible: boolean;
  conflictos: ConflictoDisponibilidad[];
  estado_actual: string;
  fecha_proxima_disponibilidad?: string;
}

export interface ConflictoDisponibilidad {
  tipo: 'estado_no_disponible' | 'conflicto_programacion';
  mensaje?: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  tipo_programacion?: string;
  fecha_disponible?: string;
}
