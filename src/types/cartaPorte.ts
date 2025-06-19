
export interface Domicilio {
  calle: string;
  numero_exterior?: string;
  numero_interior?: string;
  colonia: string;
  localidad?: string;
  municipio: string;
  estado: string;
  pais: string;
  codigo_postal: string;
  referencia?: string;
}

export interface Ubicacion {
  tipo_estacion: string;
  nombre_estacion?: string;
  rfc_remitente_destinatario?: string;
  id_ubicacion?: string;
  distancia_recorrida?: number;
  domicilio: Domicilio;
}

export interface Mercancia {
  bienes_transp: string;
  clave_unidad: string;
  cantidad: number;
  peso_kg: number;
  descripcion: string;
  valor_mercancia?: number;
  moneda?: string;
}

export interface Autotransporte {
  perm_sct: string;
  num_permiso_sct?: string;
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
}

export interface Remolque {
  id?: string;
  subtipo_remolque: string;
  subtipo_rem?: string;
  placa: string;
}

export interface FiguraTransporte {
  tipo_figura: string;
  rfc_transportista: string;
  rfc_figura?: string;
  nombre_figura?: string;
  num_licencia?: string;
  nombre_transportista?: string;
  num_reg_id_trib?: string;
  residencia_fiscal?: string;
  nombre_operador?: string;
  rfc_operador?: string;
  num_licencia_operador?: string;
  num_reg_id_trib_operador?: string;
  residencia_fiscal_operador?: string;
  nombre_propietario?: string;
  rfc_propietario?: string;
  num_reg_id_trib_propietario?: string;
  residencia_fiscal_propietario?: string;
  nombre_arrendatario?: string;
  rfc_arrendatario?: string;
  num_reg_id_trib_arrendatario?: string;
  residencia_fiscal_arrendatario?: string;
}

export interface CartaPorteData {
  version: string;
  transporte_internacional?: string;
  transporteInternacional?: string;
  entrada_salida_mercancia?: string;
  via_entrada_salida?: string;
  total_distancia_recorrida?: number;
  registro_istmo?: string;
  registroIstmo?: string;
  rfcEmisor?: string;
  nombreEmisor?: string;
  rfcReceptor?: string;
  nombreReceptor?: string;
  uso_cfdi?: string;
  folio?: string;
  cartaPorteVersion?: string;
  ubicaciones?: UbicacionCompleta[];
  mercancias?: MercanciaCompleta[];
  autotransporte?: AutotransporteCompleto;
  figuras?: FiguraCompleta[];
}

export interface UbicacionCompleta extends Ubicacion {
  id?: string;
  carta_porte_id?: string;
  tipo_ubicacion?: string;
  nombre_remitente_destinatario?: string;
  fecha_hora_salida_llegada?: string;
  coordenadas?: {
    latitud: number;
    longitud: number;
  };
}

export interface AutotransporteCompleto extends Autotransporte {
  id?: string;
  carta_porte_id?: string;
  peso_bruto_vehicular: number;
  capacidad_carga: number;
  remolques: Remolque[];
}

export interface FiguraCompleta extends FiguraTransporte {
  id?: string;
  carta_porte_id?: string;
}

export interface MercanciaCompleta {
  id?: string;
  descripcion: string;
  bienes_transp: string;
  clave_unidad: string;
  cantidad: number;
  peso_kg: number;
  valor_mercancia?: number;
  material_peligroso?: boolean;
  moneda?: string;
  cve_material_peligroso?: string;
  embalaje?: string;
  fraccion_arancelaria?: string;
  uuid_comercio_ext?: string;
  carta_porte_id?: string;
  // Campos SEMARNAT dinámicos
  numero_autorizacion?: string;
  folio_acreditacion?: string;
  // Campos adicionales para IA
  requiere_semarnat?: boolean;
  categoria_transporte?: 'general' | 'peligroso' | 'refrigerado' | 'especializado';
  regulaciones_especiales?: string[];
  // Campos de refrigeración
  temperatura_transporte?: string;
  tipo_refrigeracion?: string;
  // Campos especializados
  dimensiones_especiales?: string;
  peso_especial?: string;
}
