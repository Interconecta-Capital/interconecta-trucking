
export interface CartaPorteData {
  tipoRelacion: string;
  version: string;
  transporteInternacional: string;
  entradaSalidaMerc: string;
  viaTransporte: string;
  totalDistRec: number;
  tipoCreacion?: 'plantilla' | 'carga' | 'manual';
  cartaPorteVersion?: string;
  tipoCfdi?: string;
  rfcEmisor?: string;
  nombreEmisor?: string;
  rfcReceptor?: string;
  nombreReceptor?: string;
  registroIstmo?: boolean;
  mercancias?: MercanciaCompleta[];
  ubicaciones?: any[];
  autotransporte?: AutotransporteCompleto;
  figuras?: FiguraCompleta[];
}

export interface AutotransporteCompleto {
  placa_vm: string;
  anio_modelo_vm: number;
  config_vehicular: string;
  perm_sct: string;
  num_permiso_sct: string;
  asegura_resp_civil: string;
  poliza_resp_civil: string;
  asegura_med_ambiente?: string;
  poliza_med_ambiente?: string;
  remolques?: any[];
  marca_vehiculo?: string;
  modelo_vehiculo?: string;
  numero_serie_vin?: string;
  tipo_carroceria?: string;
  capacidad_carga?: number;
  peso_bruto_vehicular?: number;
  vigencia_permiso?: string;
  numero_permisos_adicionales?: string[];
  dimensiones?: {
    largo: number;
    ancho: number;
    alto: number;
  };
}

export interface FiguraCompleta {
  id: string;
  tipo_figura: string;
  rfc_figura: string;
  nombre_figura: string;
  num_licencia?: string;
  residencia_fiscal_figura?: string;
  num_reg_id_trib_figura?: string;
  curp?: string;
  tipo_licencia?: string;
  vigencia_licencia?: string;
  operador_sct?: boolean;
  domicilio: {
    pais: string;
    codigo_postal: string;
    estado: string;
    municipio: string;
    colonia: string;
    calle: string;
    numero_exterior: string;
    numero_interior?: string;
    referencia?: string;
  };
}

export interface MercanciaCompleta {
  id: string;
  bienes_transp: string;
  descripcion?: string;
  cantidad?: number;
  clave_unidad?: string;
  peso_kg?: number;
  valor_mercancia?: number;
  moneda?: string;
  fraccion_arancelaria?: string;
  uuid_comercio_ext?: string;
  material_peligroso?: boolean;
  cve_material_peligroso?: string;
  embalaje?: string;
  tipo_embalaje?: string;
  material_embalaje?: string;
  dimensiones?: {
    largo: number;
    ancho: number;
    alto: number;
  };
}
