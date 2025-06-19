
export interface CartaPorteData {
  // Configuración General
  rfcEmisor?: string;
  nombreEmisor?: string;
  regimenFiscalEmisor?: string;
  rfcReceptor?: string;
  nombreReceptor?: string;
  usoCfdi?: string;
  tipoCfdi?: string;
  cartaPorteVersion?: string;
  transporteInternacional?: string | boolean;
  registroIstmo?: boolean;
  entradaSalidaMerc?: string;
  viaTransporte?: string;
  pais_origen_destino?: string;
  via_entrada_salida?: string;

  // Ubicaciones
  ubicaciones?: UbicacionCompleta[];

  // Mercancías
  mercancias?: MercanciaCompleta[];

  // Autotransporte
  autotransporte?: AutotransporteCompleto;

  // Figuras
  figuras?: FiguraCompleta[];
}

export interface UbicacionCompleta {
  id: string;
  tipo_ubicacion: string;
  rfc: string;
  nombre: string;
  fecha_llegada_salida: string;
  distancia_recorrida: number;
  coordenadas?: {
    latitud: number;
    longitud: number;
  };
  domicilio?: {
    pais?: string;
    codigo_postal?: string;
    estado?: string;
    municipio?: string;
    colonia?: string;
    calle?: string;
    numero_exterior?: string;
  };
}

export interface MercanciaCompleta {
  id: string;
  bienes_transp: string;
  descripcion: string;
  cantidad: number;
  clave_unidad: string;
  peso_kg: number;
  moneda: string;
  valor_mercancia: number;
  material_peligroso: boolean;
  especie_protegida: boolean;
  fraccion_arancelaria?: string;
  regimen_aduanero?: string;
  cve_material_peligroso?: string;
  descripcion_detallada?: string;
  tipo_embalaje?: string;
  dimensiones?: {
    largo: number;
    ancho: number;
    alto: number;
  };
}

export interface Remolque {
  placa: string;
  subtipo_rem: string;
}

export interface AutotransporteCompleto {
  placa_vm: string;
  anio_modelo_vm: number;
  config_vehicular: string;
  perm_sct: string;
  num_permiso_sct: string;
  asegura_resp_civil: string;
  poliza_resp_civil: string;
  asegura_med_ambiente: string;
  poliza_med_ambiente: string;
  peso_bruto_vehicular: number;
  tipo_carroceria: string;
  
  // Additional properties used by components
  marca_vehiculo?: string;
  modelo_vehiculo?: string;
  numero_serie_vin?: string;
  vigencia_permiso?: string;
  numero_permisos_adicionales?: string[];
  capacidad_carga?: number;
  dimensiones?: {
    largo: number;
    ancho: number;
    alto: number;
  };
  remolques?: Remolque[];
}

export interface FiguraCompleta {
  id: string;
  tipo_figura: string;
  rfc_figura: string;
  nombre_figura: string;
  num_licencia?: string;
  tipo_licencia?: string;
  vigencia_licencia?: string;
  operador_sct?: boolean;
  curp?: string;
  residencia_fiscal_figura?: string;
  num_reg_id_trib_figura?: string;
  domicilio?: {
    pais?: string;
    codigo_postal?: string;
    estado?: string;
    municipio?: string;
    colonia?: string;
    calle?: string;
    numero_exterior?: string;
  };
}
