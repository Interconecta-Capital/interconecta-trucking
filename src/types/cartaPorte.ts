
export interface CartaPorteData {
  tipoCfdi?: string;
  transporteInternacional?: string;
  version?: string;
  cartaPorteVersion?: string;
  rfcEmisor?: string;
  nombreEmisor?: string;
  rfcReceptor?: string;
  nombreReceptor?: string;
  ubicaciones?: UbicacionCompleta[];
  mercancias?: MercanciaCompleta[];
  autotransporte?: AutotransporteCompleto;
  figuras?: FiguraCompleta[];
  currentStep?: number;
  xmlGenerado?: string;
  datosCalculoRuta?: {
    distanciaTotal?: number;
    tiempoEstimado?: number;
    calculadoEn?: string;
  };
  // Nuevas propiedades para transporte internacional
  entradaSalidaMerc?: string;
  viaTransporte?: string;
  pais_origen_destino?: string;
  via_entrada_salida?: string;
  registroIstmo?: boolean;
}

export interface UbicacionCompleta {
  id: string;
  tipo_ubicacion: 'Origen' | 'Destino' | 'Intermedio';
  rfc: string;
  nombre: string;
  domicilio: {
    calle: string;
    numero_exterior: string;
    numero_interior?: string;
    codigo_postal: string;
    colonia: string;
    municipio: string;
    estado: string;
    pais: string;
  };
  fecha_hora_salida_llegada: string;
}

export interface MercanciaCompleta {
  id: string;
  bienes_transp: string;
  descripcion?: string;
  cantidad: number;
  clave_unidad: string;
  peso_kg: number;
  unidad_peso_bruto: string;
  valor_mercancia: number;
  moneda: string;
  material_peligroso?: boolean;
  numero_piezas?: number;
  peso_bruto_total?: number;
  peso_neto_total?: number;
  fraccion_arancelaria?: string;
  uuid_comercio_ext?: string;
  tipo_embalaje?: string;
  regimen_aduanero?: string;
  descripcion_detallada?: string;
  requiere_cites?: boolean;
  embalaje?: string;
  cve_material_peligroso?: string;
  especie_protegida?: boolean;
  dimensiones?: any;
  documentacion_aduanera?: any[];
}

export interface AutotransporteCompleto {
  placa_vm: string;
  anio_modelo_vm: number;
  config_vehicular: string;
  perm_sct: string;
  num_permiso_sct: string;
  asegura_resp_civil: string;
  poliza_resp_civil: string;
  remolques?: RemolqueCompleto[];
  // Nuevas propiedades para autotransporte extendido
  marca_vehiculo?: string;
  modelo_vehiculo?: string;
  numero_serie_vin?: string;
  tipo_carroceria?: string;
  capacidad_carga?: number;
  peso_bruto_vehicular?: number;
  asegura_med_ambiente?: string;
  poliza_med_ambiente?: string;
  vigencia_permiso?: string;
  numero_permisos_adicionales?: string[];
  dimensiones?: {
    largo: number;
    ancho: number;
    alto: number;
  };
}

export interface RemolqueCompleto {
  id: string;
  placa: string;
  subtipo_rem: string;
}

export interface FiguraCompleta {
  id: string;
  tipo_figura: string;
  rfc_figura: string;
  nombre_figura: string;
  num_licencia?: string;
  tipo_licencia?: string;
  curp?: string;
  vigencia_licencia?: string;
  operador_sct?: boolean;
  num_reg_id_trib_figura?: string;
  residencia_fiscal_figura?: string;
  domicilio?: any;
}
