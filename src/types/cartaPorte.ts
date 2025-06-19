
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
  
  // Datos fiscales del emisor y receptor (ACTUALIZADOS v3.1)
  rfcEmisor?: string;
  nombreEmisor?: string;
  rfcReceptor?: string;
  nombreReceptor?: string;
  
  // NUEVOS CAMPOS OBLIGATORIOS v3.1
  uso_cfdi?: string; // Obligatorio para receptor
  regimen_fiscal_emisor?: string; // Obligatorio
  regimen_fiscal_receptor?: string; // Obligatorio
  domicilio_fiscal_emisor?: {
    pais: string;
    codigo_postal: string;
    estado: string;
    municipio: string;
    colonia: string;
    calle: string;
    numero_exterior: string;
    numero_interior?: string;
  };
  domicilio_fiscal_receptor?: {
    pais: string;
    codigo_postal: string;
    estado: string;
    municipio: string;
    colonia: string;
    calle: string;
    numero_exterior: string;
    numero_interior?: string;
  };
  
  // Configuración de transporte
  transporteInternacional?: string | boolean;
  transporte_internacional?: boolean;
  registroIstmo?: boolean;
  registro_istmo?: boolean;
  entradaSalidaMerc?: string;
  paisOrigenDestino?: string;
  viaEntradaSalida?: string;
  viaTransporte?: string;
  
  // Regímenes aduaneros v3.1 (ACTUALIZADO)
  regimenAduanero?: string; // v3.0 (deprecated)
  regimenesAduaneros?: Array<{
    clave_regimen: string;
    descripcion?: string;
    orden_secuencia: number;
  }>; // v3.1 (hasta 10 regímenes)
  
  // Totales calculados automáticamente
  totalDistRec?: number;
  pesoBrutoTotal?: number;
  numeroTotalMercancias?: number;
  
  // Datos principales
  ubicaciones?: UbicacionCompleta[];
  mercancias?: MercanciaCompleta[];
  autotransporte?: AutotransporteCompleto;
  figuras?: FiguraCompleta[];
  
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
  id_ubicacion: string; // FORMATO VALIDADO: OR000001, DE000001
  rfc_remitente_destinatario?: string;
  nombre_remitente_destinatario?: string;
  fecha_hora_salida_llegada?: string; // OBLIGATORIO v3.1
  distancia_recorrida?: number; // OBLIGATORIO para destino
  
  // Campos existentes
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
  
  // CAMPOS OBLIGATORIOS v3.1
  peso_bruto_vehicular: number; // OBLIGATORIO
  numero_serie_vin?: string; // REQUERIDO para identificación
  
  // Seguros ACTUALIZADOS
  asegura_resp_civil: string;
  poliza_resp_civil: string;
  vigencia_resp_civil?: string; // NUEVO - obligatorio
  asegura_med_ambiente?: string;
  poliza_med_ambiente?: string;
  vigencia_med_ambiente?: string; // NUEVO - condicional
  
  // Seguros opcionales mejorados
  asegura_carga?: string; // NUEVO - recomendado
  poliza_carga?: string; // NUEVO - recomendado
  
  // Campos técnicos adicionales
  tipo_carroceria?: string;
  carga_maxima?: number;
  tarjeta_circulacion?: string;
  vigencia_tarjeta_circulacion?: string;
  
  // Información adicional del vehículo
  marca_vehiculo?: string;
  modelo_vehiculo?: string;
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
}

export interface FiguraCompleta {
  id: string;
  tipo_figura: string;
  rfc_figura: string;
  nombre_figura: string;
  
  // CAMPOS OBLIGATORIOS ACTUALIZADOS v3.1
  num_licencia?: string;
  tipo_licencia?: string; // OBLIGATORIO para conductores
  vigencia_licencia?: string; // OBLIGATORIO para conductores
  operador_sct?: boolean; // OBLIGATORIO para operadores
  curp?: string; // OBLIGATORIO para personas físicas
  
  residencia_fiscal_figura?: string;
  num_reg_id_trib_figura?: string;
  
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

// INTERFAZ ACTUALIZADA PARA v3.1 CON FAUNA SILVESTRE
export interface MercanciaCompleta {
  id: string;
  bienes_transp: string;
  descripcion: string; // Básica
  descripcion_detallada?: string; // NUEVA - obligatoria para especies protegidas
  cantidad: number;
  clave_unidad: string;
  peso_kg: number; // Peso unitario
  
  // CAMPOS PESO ACTUALIZADOS v3.1
  peso_bruto_total?: number; // NUEVO - peso total de esta mercancía
  peso_neto_total?: number; // NUEVO - peso neto
  unidad_peso_bruto?: string; // DEFAULT 'KGM'
  
  valor_mercancia?: number;
  moneda?: string;
  
  // Campos de comercio exterior ACTUALIZADOS
  fraccion_arancelaria?: string; // Opcional en v3.1
  uuid_comercio_exterior?: string;
  regimen_aduanero?: string;
  documentacion_aduanera?: DocumentacionAduanera[]; // NUEVA estructura
  
  // Material peligroso
  material_peligroso?: boolean;
  cve_material_peligroso?: string;
  
  // Embalaje
  embalaje?: string;
  tipo_embalaje?: string;
  material_embalaje?: string;
  descripcion_embalaje?: string;
  numero_piezas?: number;
  
  // NUEVOS CAMPOS FAUNA SILVESTRE
  especie_protegida?: boolean; // NUEVO
  requiere_cites?: boolean; // NUEVO
  permisos_semarnat?: PermisoSEMARNAT[]; // NUEVO
  
  // Peso y dimensiones
  peso_bruto_total_mercancia?: number;
  unidad_peso_bruto_mercancia?: string;
  dimensiones?: {
    largo: number;
    ancho: number;
    alto: number;
    unidad?: string;
  };
}

// NUEVAS INTERFACES v3.1
export interface DocumentacionAduanera {
  id?: string;
  tipo_documento: string; // 'pedimento', 'cove', etc.
  folio_documento: string;
  rfc_importador?: string;
  fecha_expedicion?: string;
  aduana_despacho?: string;
}

export interface PermisoSEMARNAT {
  id?: string;
  tipo_permiso: 'traslado' | 'aprovechamiento' | 'legal_procedencia';
  numero_permiso: string;
  fecha_expedicion: string;
  fecha_vencimiento: string;
  autoridad_expedidora: string;
  observaciones?: string;
  vigente: boolean;
}

export interface RemolqueCCP {
  id?: string;
  placa: string;
  subtipo_rem: string;
  autotransporte_id?: string;
}

// Nuevos tipos para validación SAT v3.1
export interface ValidacionSATv31 {
  valido: boolean;
  errores: string[];
  warnings: string[];
  score: number;
  campos_faltantes?: string[];
  recomendaciones?: string[];
}

// Tipos para catálogos SAT actualizados
export interface CatalogoUsosCFDI {
  clave: string;
  descripcion: string;
  aplica_persona_fisica: boolean;
  aplica_persona_moral: boolean;
  fecha_inicio_vigencia: string;
  fecha_fin_vigencia?: string;
}

export interface CatalogoRegimenFiscal {
  clave: string;
  descripcion: string;
  aplica_persona_fisica: boolean;
  aplica_persona_moral: boolean;
  fecha_inicio_vigencia: string;
  fecha_fin_vigencia?: string;
}

// Alias para compatibilidad
export type AutotransporteCompleta = AutotransporteCompleto;
export interface AutotransporteData extends AutotransporteCompleto {
  remolques: RemolqueCCP[];
}

// Tipos específicos para fauna silvestre
export interface FaunaSilvestre extends MercanciaCompleta {
  especie_protegida: true;
  descripcion_detallada: string; // Obligatoria
  permisos_semarnat: PermisoSEMARNAT[]; // Obligatorios
  identificadores_individuales?: {
    microchip?: string;
    anillo?: string;
    tatuaje?: string;
    otros?: string;
  };
  caracteristicas_fisicas?: {
    sexo?: 'Macho' | 'Hembra' | 'Indeterminado';
    edad_aproximada?: string;
    peso_individual?: number;
    condiciones_salud?: string;
  };
}
