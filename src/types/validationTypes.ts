
import { MercanciaCompleta, UbicacionCompleta, AutotransporteCompleto, FiguraCompleta } from '@/types/cartaPorte';

export interface CartaPorte31Data {
  // Datos básicos
  rfcEmisor?: string;
  rfcReceptor?: string;
  nombreEmisor?: string;
  nombreReceptor?: string;
  tipoCfdi?: string;
  transporteInternacional?: boolean;
  registroIstmo?: boolean;
  
  // Datos principales - usar los tipos correctos
  mercancias: MercanciaCompleta[];
  ubicaciones: UbicacionCompleta[];
  autotransporte?: AutotransporteCompleto;
  figuras: FiguraCompleta[];
  
  // Campos específicos de validación
  regimenAduanero?: string;
  regimenesAduaneros?: string[];
  
  // Campos v3.1
  version31Fields?: {
    transporteEspecializado?: boolean;
    tipoCarroceria?: string;
    registroISTMO?: boolean;
    remolquesCCP?: Array<{
      placa: string;
      subtipo_rem: string;
    }>;
  };
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
