
export interface Viaje {
  id: string;
  carta_porte_id: string;
  origen: string;
  destino: string;
  conductor_id?: string;
  vehiculo_id?: string;
  estado: 'programado' | 'en_transito' | 'completado' | 'cancelado' | 'retrasado' | 'borrador';
  fecha_inicio_programada: string;
  fecha_inicio_real?: string;
  fecha_fin_programada: string;
  fecha_fin_real?: string;
  observaciones?: string;
  tracking_data?: any;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface EventoViaje {
  id: string;
  viaje_id: string;
  tipo_evento: 'inicio' | 'parada' | 'incidente' | 'entrega' | 'retraso' | 'ubicacion';
  descripcion: string;
  ubicacion?: string;
  coordenadas?: { lat: number; lng: number };
  timestamp: string;
  automatico: boolean;
  metadata?: any;
}

export interface ViajeEstadoParams {
  viajeId: string;
  nuevoEstado: Viaje['estado'];
  observaciones?: string;
  ubicacionActual?: string;
}

export interface EventoViajeParams {
  viajeId: string;
  tipoEvento: EventoViaje['tipo_evento'];
  descripcion: string;
  ubicacion?: string;
  coordenadas?: { lat: number; lng: number };
  automatico?: boolean;
  metadata?: any;
}
