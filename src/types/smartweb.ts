/**
 * Tipos oficiales según API SmartWeb
 * Fuente: https://developers.sw.com.mx/knowledge-base/issue-stamping-json/
 * 
 * Estos tipos representan la estructura EXACTA esperada por el PAC SmartWeb
 * para CFDI 4.0 + Carta Porte 3.1
 */

export interface SmartWebCFDI {
  Version: "4.0";
  Serie?: string;
  Folio?: string;
  Fecha: string; // YYYY-MM-DDTHH:MM:SS (sin zona horaria)
  FormaPago?: string; // Catálogo c_FormaPago
  CondicionesDePago?: string;
  SubTotal: string; // Numérico con 2 decimales
  Descuento?: string; // Numérico con 2 decimales
  Moneda: string; // Catálogo c_Moneda (XXX para sin moneda)
  TipoCambio?: string;
  Total: string; // Numérico con 2 decimales
  TipoDeComprobante: "I" | "E" | "T" | "N" | "P"; // I=Ingreso, T=Traslado
  Exportacion: string; // "01" = No aplica
  MetodoPago?: "PUE" | "PPD"; // PUE=Pago en una exhibición, PPD=Pago en parcialidades
  LugarExpedicion: string; // Código postal (5 dígitos)

  Emisor: SmartWebEmisor;
  Receptor: SmartWebReceptor;
  Conceptos: SmartWebConcepto[];
  Complemento?: {
    CartaPorte31?: SmartWebCartaPorte31;
  };
}

export interface SmartWebEmisor {
  Rfc: string; // 12 o 13 caracteres
  Nombre: string; // Razón social
  RegimenFiscal: string; // Catálogo c_RegimenFiscal (ej: "601")
}

export interface SmartWebReceptor {
  Rfc: string; // 12 o 13 caracteres
  Nombre: string; // Razón social
  DomicilioFiscalReceptor: string; // Código postal (5 dígitos)
  RegimenFiscalReceptor: string; // Catálogo c_RegimenFiscal
  UsoCFDI: string; // Catálogo c_UsoCFDI (ej: "CP01" para CartaPorte)
}

export interface SmartWebConcepto {
  ClaveProdServ: string; // 8 dígitos - Catálogo c_ClaveProdServ
  NoIdentificacion?: string;
  Cantidad: string; // Numérico con hasta 6 decimales
  ClaveUnidad: string; // Catálogo c_ClaveUnidad (ej: "KGM")
  Unidad?: string; // Descripción de la unidad
  Descripcion: string; // Descripción del bien o servicio
  ValorUnitario: string; // Numérico con hasta 6 decimales
  Importe: string; // Numérico con 2 decimales
  Descuento?: string;
  ObjetoImp: "01" | "02" | "03" | "04"; // 01=No objeto, 02=Sí objeto
  Impuestos?: SmartWebImpuestosConcepto;
}

export interface SmartWebImpuestosConcepto {
  Traslados?: Array<{
    Base: string;
    Impuesto: string; // "002" = IVA
    TipoFactor: "Tasa" | "Cuota" | "Exento";
    TasaOCuota: string; // "0.160000" para IVA 16%
    Importe: string;
  }>;
  Retenciones?: Array<{
    Base: string;
    Impuesto: string;
    TipoFactor: "Tasa" | "Cuota";
    TasaOCuota: string;
    Importe: string;
  }>;
}

export interface SmartWebCartaPorte31 {
  Version: "3.1";
  TranspInternac: "Sí" | "No";
  RegistroISTMO?: string; // Solo si aplica
  EntradaSalidaMerc?: "Entrada" | "Salida"; // Solo si TranspInternac = "Sí"
  PaisOrigenDestino?: string; // País extranjero (ej: "USA")
  ViaEntradaSalida?: string; // Catálogo c_ViaEntradaSalida
  
  Ubicaciones: SmartWebUbicaciones;
  Mercancias: SmartWebMercancias;
  FiguraTransporte: SmartWebFiguraTransporte;
}

export interface SmartWebUbicaciones {
  Ubicacion: Array<{
    TipoUbicacion: "Origen" | "Destino";
    IDUbicacion: string; // Identificador único (ej: "UB01")
    RFCRemitenteDestinatario?: string;
    NombreRemitenteDestinatario?: string;
    FechaHoraSalidaLlegada: string; // YYYY-MM-DD HH:MM:SS (con espacio, sin T)
    DistanciaRecorrida?: string; // Solo en Destino - km con 2 decimales
    Domicilio: {
      Calle?: string;
      NumeroExterior?: string;
      NumeroInterior?: string;
      Colonia?: string;
      Localidad?: string;
      Referencia?: string;
      Municipio?: string;
      Estado: string; // Catálogo c_Estado
      Pais: string; // Catálogo c_Pais (ej: "MEX")
      CodigoPostal: string; // 5 dígitos
    };
  }>;
}

export interface SmartWebMercancias {
  PesoBrutoTotal: string; // kg con 3 decimales
  UnidadPeso: string; // "KGM" = Kilogramo
  PesoNetoTotal?: string; // kg con 3 decimales
  NumTotalMercancias: number;
  
  Mercancia: Array<{
    BienesTransp: string; // Catálogo c_ClaveProdServCP (8 dígitos)
    ClaveSTCC?: string; // Catálogo c_ClaveSTCC
    Descripcion: string;
    Cantidad: string; // Con 3 decimales
    ClaveUnidad: string; // Catálogo c_ClaveUnidad
    Unidad?: string;
    Dimensiones?: string; // Ej: "1.5x2x1" (Largo x Ancho x Alto en metros)
    MaterialPeligroso?: "Sí"; // Solo si aplica
    CveMaterialPeligroso?: string; // Catálogo c_MaterialPeligroso
    Embalaje?: string; // Catálogo c_TipoEmbalaje
    DescripEmbalaje?: string;
    PesoEnKg: string; // Con 3 decimales
    ValorMercancia?: string; // Con 2 decimales
    Moneda?: string; // Catálogo c_Moneda
    FraccionArancelaria?: string; // 8 dígitos
    UUIDComercioExt?: string; // UUID de pedimento
    
    CantidadTransporta: Array<{
      Cantidad: string; // Con 3 decimales
      IDOrigen: string; // Referencia a Ubicacion.IDUbicacion
      IDDestino: string; // Referencia a Ubicacion.IDUbicacion
    }>;
  }>;
  
  Autotransporte: SmartWebAutotransporte;
}

export interface SmartWebAutotransporte {
  PermSCT: string; // Catálogo c_TipoPermiso (ej: "TPAF01")
  NumPermisoSCT: string; // Número de permiso SCT
  
  IdentificacionVehicular: {
    ConfigVehicular: string; // Catálogo c_ConfigAutotransporte (ej: "C2")
    PlacaVM: string; // Placa del vehículo motor
    AnioModeloVM: number; // Año del modelo
  };
  
  Seguros: {
    AseguraRespCivil: string; // Aseguradora responsabilidad civil
    PolizaRespCivil: string; // Número de póliza
    AseguraMedAmbiente?: string; // Aseguradora medio ambiente
    PolizaMedAmbiente?: string; // Número de póliza medio ambiente
    AseguraCarga?: string; // Aseguradora de carga
    PolizaCarga?: string; // Número de póliza de carga
    PrimaSeguro?: string; // Prima del seguro
  };
  
  Remolques?: Array<{
    SubTipoRem: string; // Catálogo c_SubTipoRem
    Placa: string; // Placa del remolque
  }>;
}

export interface SmartWebFiguraTransporte {
  TiposFigura: Array<{
    TipoFigura: string; // Catálogo c_FiguraTransporte (ej: "01" = Operador)
    RFCFigura: string; // RFC de la figura
    NumLicencia?: string; // Obligatorio si TipoFigura = "01" (Operador)
    NombreFigura: string; // Nombre completo
    NumRegIdTribFigura?: string; // Registro tributario extranjero
    ResidenciaFiscalFigura?: string; // País de residencia fiscal
    
    Domicilio?: {
      Calle?: string;
      NumeroExterior?: string;
      NumeroInterior?: string;
      Colonia?: string;
      Localidad?: string;
      Referencia?: string;
      Municipio?: string;
      Estado?: string;
      Pais: string;
      CodigoPostal: string;
    };
  }>;
}

/**
 * Respuesta del PAC SmartWeb al timbrar
 */
export interface SmartWebTimbradoResponse {
  status: "success" | "error";
  data?: {
    cadenaOriginalSAT: string;
    noCertificadoSAT: string;
    noCertificadoCFDI: string;
    uuid: string;
    selloSAT: string;
    selloCFDI: string;
    fechaTimbrado: string;
    qrCode: string;
    cfdi: string; // XML timbrado completo
  };
  message?: string;
  messageDetail?: string;
}

/**
 * Errores del PAC SmartWeb
 */
export interface SmartWebError {
  status: "error";
  message: string;
  messageDetail?: string;
  errorCode?: string;
}
