

// Tipos específicos para validación SAT v3.1
export interface CartaPorte31Data {
  rfcEmisor?: string;
  rfcReceptor?: string;
  nombreEmisor?: string;
  nombreReceptor?: string;
  tipoCfdi?: string;
  transporteInternacional?: boolean;
  registroIstmo?: boolean;
  cartaPorteVersion?: '3.0' | '3.1';
  
  ubicaciones?: Array<{
    id: string;
    id_ubicacion: string; // Make this required to match UbicacionCompleta
    tipo_ubicacion: 'Origen' | 'Destino' | 'Paso Intermedio';
    coordenadas?: {
      latitud: number;
      longitud: number;
    };
    tipo_estacion?: string;
    numero_estacion?: string;
    kilometro?: number;
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
  }>;
  
  mercancias?: Array<{
    id: string; // Make this required to match MercanciaCompleta
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
  
  // Use the complete AutotransporteCompleto type instead of custom type
  autotransporte?: import('@/types/cartaPorte').AutotransporteCompleto;
  
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

// Tipos para resultados de validación de BD - using consistent naming
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

