
export interface CartaPorteData {
  tipoRelacion?: string;
  version?: string;
  transporteInternacional?: string | boolean;
  entradaSalidaMerc?: string;
  viaTransporte?: string;
  totalDistRec?: number;
  tipoCreacion?: 'plantilla' | 'carga' | 'manual';
  cartaPorteVersion?: '3.0' | '3.1';
  tipoCfdi?: 'Ingreso' | 'Traslado';
  rfcEmisor?: string;
  nombreEmisor?: string;
  rfcReceptor?: string;
  nombreReceptor?: string;
  registroIstmo?: boolean;
  mercancias?: MercanciaCompleta[];
  ubicaciones?: UbicacionCompleta[];
  autotransporte?: AutotransporteCompleto;
  figuras?: FiguraCompleta[];
  pais_origen_destino?: string;
  via_entrada_salida?: string;
  cartaPorteId?: string;
  
  // Campos para persistencia de estado
  xmlGenerado?: string;
  datosCalculoRuta?: {
    distanciaTotal?: number;
    tiempoEstimado?: number;
    calculadoEn?: string;
  };
  currentStep?: number;
  
  // Add missing properties for version management
  regimenAduanero?: string;
  regimenesAduaneros?: string[];
  version31Fields?: {
    transporteEspecializado?: boolean;
    tipoCarroceria?: string;
    registroISTMO?: boolean;
    [key: string]: any;
  };
}

export interface UbicacionCompleta {
  id: string;
  tipo_ubicacion: string;
  id_ubicacion: string;
  rfc_remitente_destinatario?: string;
  nombre_remitente_destinatario?: string;
  fecha_hora_salida_llegada?: string;
  distancia_recorrida?: number;
  tipo_estacion?: string;
  numero_estacion?: string;
  kilometro?: number;
  coordenadas?: {
    latitud: number;
    longitud: number;
  };
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

export interface AutotransporteCompleta extends AutotransporteCompleto {
  // Extend with any additional properties if needed
}

export interface AutotransporteData extends AutotransporteCompleto {
  // Alias for compatibility
  remolques: any[];
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
  // Add placaVm for compatibility
  placaVm?: string;
  configuracionVehicular?: string;
  seguro?: {
    aseguradora: string;
    poliza: string;
    vigencia: string;
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
  uuid_comercio_exterior?: string;
  material_peligroso?: boolean;
  cve_material_peligroso?: string;
  embalaje?: string;
  tipo_embalaje?: string;
  material_embalaje?: string;
  descripcion_embalaje?: string;
  peso_bruto_total?: number;
  unidad_peso_bruto?: string;
  dimensiones?: {
    largo: number;
    ancho: number;
    alto: number;
    unidad?: string;
  };
}

// Additional catalog interfaces
export interface CatalogoEmbalaje {
  clave: string;
  descripcion: string;
}

export interface CatalogoCarroceria {
  clave: string;
  descripcion: string;
}

export interface CatalogoTipoLicencia {
  clave: string;
  descripcion: string;
  aplica_federal?: boolean;
}
