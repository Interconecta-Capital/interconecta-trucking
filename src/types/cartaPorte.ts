
// Interfaces completas para Carta Porte SAT 3.1
export interface MercanciaCompleta {
  // Campos básicos existentes
  id?: string;
  descripcion: string;
  bienes_transp: string;
  clave_unidad: string;
  cantidad: number;
  peso_kg: number;
  valor_mercancia: number;
  material_peligroso: boolean;
  cve_material_peligroso?: string;
  moneda: string;
  
  // Campos SAT obligatorios agregados
  fraccion_arancelaria?: string;
  uuid_comercio_exterior?: string;
  tipo_embalaje?: string;
  material_embalaje?: string;
  descripcion_embalaje?: string;
  peso_bruto_total?: number;
  unidad_peso_bruto?: string;
  
  // Dimensiones del embalaje
  dimensiones?: {
    largo: number;
    ancho: number;
    alto: number;
    unidad: string; // CM, M, etc.
  };
}

export interface AutotransporteCompleto {
  // Campos básicos existentes
  placa_vm: string;
  anio_modelo_vm: number;
  config_vehicular: string;
  perm_sct: string;
  num_permiso_sct: string;
  asegura_resp_civil: string;
  poliza_resp_civil: string;
  asegura_med_ambiente?: string;
  poliza_med_ambiente?: string;
  remolques?: Array<{
    placa: string;
    subtipo_rem: string;
  }>;
  
  // Campos SAT 3.1 agregados
  marca_vehiculo?: string;
  modelo_vehiculo?: string;
  numero_serie_vin?: string;
  capacidad_carga?: number;
  tipo_carroceria?: string;
  peso_bruto_vehicular?: number;
  
  // Dimensiones del vehículo
  dimensiones?: {
    largo: number;
    ancho: number;
    alto: number;
  };
  
  // Permisos adicionales
  vigencia_permiso?: string;
  numero_permisos_adicionales?: string[];
}

export interface FiguraCompleta {
  id?: string;
  tipo_figura: string;
  rfc_figura: string;
  nombre_figura: string;
  num_licencia?: string;
  
  // Campos SAT agregados
  curp?: string;
  residencia_fiscal_figura?: string;
  num_reg_id_trib_figura?: string;
  vigencia_licencia?: string;
  tipo_licencia?: string;
  operador_sct?: boolean;
  
  // Domicilio completo
  domicilio?: {
    pais: string;
    codigo_postal: string;
    estado: string;
    municipio: string;
    colonia: string;
    calle: string;
    numero_exterior: string;
    numero_interior?: string;
  };
  
  created_at?: string;
  updated_at?: string;
}

export interface UbicacionCompleta {
  id?: string;
  tipo_ubicacion: 'Origen' | 'Destino' | 'Paso Intermedio';
  id_ubicacion: string;
  rfc_remitente_destinatario?: string;
  nombre_remitente_destinatario?: string;
  fecha_hora_salida_llegada?: string;
  distancia_recorrida?: number;
  
  // Campos SAT agregados
  tipo_estacion?: 'origen' | 'destino' | 'intermedia';
  numero_estacion?: string;
  nomenclatura_estacion?: string;
  kilometro?: number;
  codigo_establecimiento?: string;
  clave_transporte?: string;
  
  // Coordenadas GPS
  coordenadas?: {
    latitud: number;
    longitud: number;
  };
  
  // Domicilio
  domicilio?: {
    codigo_postal: string;
    estado: string;
    municipio: string;
    colonia: string;
    calle: string;
    numero_exterior: string;
    numero_interior?: string;
    pais: string;
  };
}

// Tipos para catálogos SAT
export interface CatalogoEmbalaje {
  clave: string;
  descripcion: string;
  vigencia_desde?: string;
  vigencia_hasta?: string;
}

export interface CatalogoCarroceria {
  clave: string;
  descripcion: string;
  vigencia_desde?: string;
  vigencia_hasta?: string;
}

export interface CatalogoTipoLicencia {
  clave: string;
  descripcion: string;
  aplica_federal: boolean;
  vigencia_desde?: string;
  vigencia_hasta?: string;
}
