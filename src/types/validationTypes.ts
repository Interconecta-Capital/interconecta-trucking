
import { MercanciaCompleta } from '@/types/cartaPorte';

export interface CartaPorte31Data {
  mercancias: MercanciaCompleta[];
  ubicaciones: Array<{
    id: string;
    tipo_ubicacion: string;
    domicilio: {
      codigo_postal: string;
      estado: string;
      municipio: string;
    };
    distancia_recorrida?: number;
  }>;
  autotransporte: {
    placa_vm: string;
    peso_bruto_vehicular?: number;
    config_vehicular: string;
  };
  figuras: Array<{
    id: string;
    tipo_figura: string;
    rfc_figura: string;
  }>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

export interface SectionValidation {
  sectionName: string;
  isValid: boolean;
  completionPercentage: number;
  errors: string[];
  warnings: string[];
}
