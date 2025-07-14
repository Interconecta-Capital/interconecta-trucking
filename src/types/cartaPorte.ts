
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

  // Version management fields
  regimenAduanero?: string;
  regimenesAduaneros?: string[];
  version31Fields?: {
    transporteEspecializado?: boolean;
    tipoCarroceria?: string;
    registroISTMO?: boolean;
    [key: string]: any;
  };

  // Ubicaciones
  ubicaciones?: UbicacionCompleta[];

  // Mercancías
  mercancias?: MercanciaCompleta[];

  // Autotransporte
  autotransporte?: AutotransporteCompleto;

  // Figuras
  figuras?: FiguraCompleta[];

  // Additional properties for form management
  xmlGenerado?: string;
  datosCalculoRuta?: {
    distanciaTotal?: number;
    tiempoEstimado?: number;
    calculadoEn?: string;
  };
  currentStep?: number;
  tipoCreacion?: 'plantilla' | 'carga' | 'manual';
  cartaPorteId?: string;
  version?: string;
}

export interface UbicacionCompleta {
  id: string;
  tipo_ubicacion: string;
  rfc: string;
  nombre: string;
  fecha_llegada_salida: string;
  fecha_hora_salida_llegada?: string; // Add this missing property
  distancia_recorrida: number;
  rfc_remitente_destinatario?: string;
  nombre_remitente_destinatario?: string;
  id_ubicacion?: string;
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
  // Metadatos de IA
  aiGenerated?: boolean;
  aiConfidence?: 'alta' | 'media' | 'baja';
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
  marca?: string; // Alias para marca_vehiculo
  modelo?: string; // Alias para modelo_vehiculo
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

// Add Conductor type for other components
export interface Conductor {
  id: string;
  nombre: string;
  rfc?: string;
  curp?: string;
  num_licencia?: string;
  tipo_licencia?: string;
  vigencia_licencia?: string;
  operador_sct?: boolean;
  telefono?: string;
  email?: string;
  direccion?: any;
  residencia_fiscal?: string;
  num_reg_id_trib?: string;
  user_id: string;
  activo?: boolean; // Add this missing property
  estado: string;
  created_at?: string;
  updated_at?: string;
}

// Export PlantillaData for the plantilla components
export interface PlantillaData {
  id: string;
  nombre: string;
  descripcion?: string;
  template_data: CartaPorteData;
  es_publica: boolean;
  uso_count: number;
  created_at: string;
  updated_at: string;
}
