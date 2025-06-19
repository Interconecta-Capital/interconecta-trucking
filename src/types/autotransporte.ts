
export interface Remolque {
  id?: string;
  placa: string;
  subtipo_rem: string;
  subtipo_remolque?: string; // Alias for compatibility
}

export interface AutotransporteCompleto {
  placa_vm: string;
  anio_modelo_vm: number;
  config_vehicular: string;
  perm_sct: string;
  num_permiso_sct: string;
  asegura_resp_civil: string;
  poliza_resp_civil: string;
  peso_bruto_vehicular: number;
  capacidad_carga: number;
  remolques: Remolque[];
  
  // Campos opcionales adicionales
  numero_permisos_adicionales?: string | string[];
  vigencia_permiso?: string;
  asegura_carga?: string;
  poliza_carga?: string;
  asegura_med_ambiente?: string;
  poliza_med_ambiente?: string;
  vigencia_resp_civil?: string;
  vigencia_carga?: string;
  vigencia_med_ambiente?: string;
  tarjeta_circulacion?: string;
  vigencia_tarjeta_circulacion?: string;
  numero_serie_vin?: string;
  tipo_carroceria?: string;
}

export interface VehiculoGuardado {
  id: string;
  placa: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  tipo?: string;
  estado: 'disponible' | 'en_ruta' | 'mantenimiento' | 'fuera_servicio';
  ubicacion_actual?: string;
  datos_completos: AutotransporteCompleto;
  created_at: string;
  updated_at: string;
}
