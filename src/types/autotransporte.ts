
export interface Remolque {
  id?: string;
  subtipo_remolque: string;
  subtipo_rem: string;
  placa: string;
}

export interface AutotransporteData {
  perm_sct: string;
  num_permiso_sct: string;
  asegura_resp_civil: string;
  poliza_resp_civil: string;
  vigencia_resp_civil?: string;
  config_vehicular: string;
  placa_vm: string;
  anio_modelo_vm: number;
  tipo_carroceria?: string;
  tarjeta_circulacion?: string;
  vigencia_tarjeta_circulacion?: string;
  asegura_med_ambiente?: string;
  poliza_med_ambiente?: string;
  asegura_carga?: string;
  poliza_carga?: string;
  vigencia_med_ambiente?: string;
  peso_bruto_vehicular: number;
  capacidad_carga: number;
  remolques: Remolque[];
  marca_vehiculo?: string;
  modelo_vehiculo?: string;
  numero_serie_vin?: string;
  dimensiones?: {
    largo?: number;
    ancho?: number;
    alto?: number;
  };
  vigencia_permiso?: string;
  numero_permisos_adicionales?: string[];
}
