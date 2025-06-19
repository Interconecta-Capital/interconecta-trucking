
// Tipos específicos para validación SAT v3.1
export interface CartaPorte31Data {
  rfcEmisor?: string;
  rfcReceptor?: string;
  cartaPorteVersion?: '3.0' | '3.1';
  
  ubicaciones?: Array<{
    id: string;
    tipo_ubicacion: 'Origen' | 'Destino' | 'Paso Intermedio';
    coordenadas?: {
      latitud: number;
      longitud: number;
    };
    tipo_estacion?: string;
    numero_estacion?: string;
    kilometro?: number;
    domicilio: {
      codigo_postal: string;
      estado: string;
      municipio: string;
      calle: string;
    };
  }>;
  
  mercancias?: Array<{
    bienes_transp: string;
    cantidad?: number;
    peso_kg?: number;
    fraccion_arancelaria?: string;
    tipo_embalaje?: string;
    dimensiones?: {
      largo: number;
      ancho: number;
      alto: number;
    };
    numero_piezas?: number;
    regimen_aduanero?: string;
  }>;
  
  autotransporte?: {
    placa_vm: string;
    peso_bruto_vehicular?: number;
    tipo_carroceria?: string;
    carga_maxima?: number;
    tarjeta_circulacion?: string;
    vigencia_tarjeta_circulacion?: string;
    remolques?: Array<{
      placa: string;
      subtipo_rem: string;
    }>;
  };
  
  figuras?: Array<{
    rfc_figura: string;
    nombre_figura: string;
    tipo_figura: string;
  }>;
  
  // Campos específicos de versión 3.1
  version31Fields?: {
    transporteEspecializado?: boolean;
    tipoCarroceria?: string;
    registroISTMO?: boolean;
    remolquesCCP?: Array<{
      placa: string;
      subtipo_rem: string;
    }>;
  };
  
  // Regímenes aduaneros según versión
  regimenAduanero?: string;
  regimenesAduaneros?: string[];
}

// Tipos para resultados de validación de BD
export interface ValidationResult {
  valido: boolean;
  errores: string[];
}
