
export interface CartaPorteData {
  // Identificadores únicos
  id?: string;
  idCCP?: string; // UUID de 36 caracteres del complemento
  folio?: string;
  cartaPorteId?: string;
  
  // Configuración y versión
  cartaPorteVersion?: '3.0' | '3.1';
  tipoCreacion?: 'plantilla' | 'carga' | 'manual';
  tipoCfdi?: 'Ingreso' | 'Traslado';
  
  // Datos fiscales del emisor y receptor
  rfcEmisor?: string;
  nombreEmisor?: string;
  rfcReceptor?: string;
  nombreReceptor?: string;
  
  // Uso del CFDI - Agregado
  uso_cfdi?: string;
  
  // Configuración de transporte
  transporteInternacional?: string | boolean;
  transporte_internacional?: boolean; // Alias para compatibilidad
  registroIstmo?: boolean;
  registro_istmo?: boolean; // Alias para compatibilidad
  entradaSalidaMerc?: string;
  paisOrigenDestino?: string;
  viaEntradaSalida?: string;
  viaTransporte?: string;
  
  // Regímenes aduaneros (diferente entre versiones)
  regimenAduanero?: string; // v3.0 (string único)
  regimenesAduaneros?: string[]; // v3.1 (array)
  
  // Totales calculados automáticamente
  totalDistRec?: number;
  pesoBrutoTotal?: number;
  numeroTotalMercancias?: number;
  
  // Datos principales
  ubicaciones?: UbicacionCompleta[];
  mercancias?: MercanciaCompleta[];
  autotransporte?: AutotransporteCompleto;
  figuras?: FiguraCompleta[];
  
  // Campos específicos de versión 3.1
  version31Fields?: {
    transporteEspecializado?: boolean;
    tipoCarroceria?: string;
    registroISTMO?: boolean;
    remolquesCCP?: RemolqueCCP[];
    [key: string]: any;
  };
  
  // Estado y persistencia
  xmlGenerado?: string;
  datosCalculoRuta?: {
    distanciaTotal?: number;
    tiempoEstimado?: number;
    calculadoEn?: string;
  };
  currentStep?: number;
}

export interface UbicacionCompleta {
  id: string;
  tipo_ubicacion: 'Origen' | 'Destino' | 'Paso Intermedio';
  id_ubicacion: string;
  rfc_remitente_destinatario?: string;
  nombre_remitente_destinatario?: string;
  fecha_hora_salida_llegada?: string;
  distancia_recorrida?: number;
  
  // Campos nuevos agregados en la migración
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

export interface AutotransporteCompleto {
  // Campos básicos existentes
  placa_vm: string;
  anio_modelo_vm: number;
  config_vehicular: string;
  perm_sct: string;
  num_permiso_sct: string;
  
  // Seguros
  asegura_resp_civil: string;
  poliza_resp_civil: string;
  asegura_med_ambiente?: string;
  poliza_med_ambiente?: string;
  
  // Campos nuevos agregados en la migración
  peso_bruto_vehicular?: number; // Obligatorio en v3.1
  tipo_carroceria?: string;
  carga_maxima?: number;
  tarjeta_circulacion?: string;
  vigencia_tarjeta_circulacion?: string;
  
  // Información adicional del vehículo
  marca_vehiculo?: string;
  modelo_vehiculo?: string;
  numero_serie_vin?: string;
  capacidad_carga?: number;
  vigencia_permiso?: string;
  numero_permisos_adicionales?: string[];
  
  // Dimensiones del vehículo
  dimensiones?: {
    largo: number;
    ancho: number;
    alto: number;
  };
  
  // Remolques (nueva estructura)
  remolques?: RemolqueCCP[];
  
  // Campos de compatibilidad (para evitar breaking changes)
  placaVm?: string;
  configuracionVehicular?: string;
  seguro?: {
    aseguradora: string;
    poliza: string;
    vigencia: string;
  };
}

export interface RemolqueCCP {
  id?: string;
  placa: string;
  subtipo_rem: string;
  autotransporte_id?: string;
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

// CORREGIDO: Definir MercanciaCompleta con tipos consistentes
export interface MercanciaCompleta {
  id: string;
  bienes_transp: string;
  descripcion: string; // Obligatorio
  cantidad: number; // Obligatorio
  clave_unidad: string; // Obligatorio
  peso_kg: number; // Obligatorio
  valor_mercancia?: number; // Opcional
  moneda?: string;
  
  // Campos de comercio exterior
  fraccion_arancelaria?: string; // Obligatorio en v3.1
  uuid_comercio_exterior?: string;
  regimen_aduanero?: string; // Nuevo campo
  
  // Material peligroso
  material_peligroso?: boolean;
  cve_material_peligroso?: string;
  
  // Embalaje (campos nuevos)
  embalaje?: string;
  tipo_embalaje?: string;
  material_embalaje?: string;
  descripcion_embalaje?: string;
  numero_piezas?: number; // Nuevo campo
  
  // Peso y dimensiones
  peso_bruto_total?: number;
  unidad_peso_bruto?: string;
  dimensiones?: {
    largo: number;
    ancho: number;
    alto: number;
    unidad?: string;
  };
}

// Tipos para catálogos SAT
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

// Alias para compatibilidad
export type AutotransporteCompleta = AutotransporteCompleto;
export interface AutotransporteData extends AutotransporteCompleto {
  remolques: RemolqueCCP[];
}
