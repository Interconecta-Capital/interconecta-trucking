
import { CartaPorteFormData } from '../useCartaPorteMappers';
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';

export interface UseCartaPorteFormOptions {
  cartaPorteId?: string;
  enableAI?: boolean;
}

export interface StepValidations {
  [key: string]: boolean;
  configuracion: boolean;
  ubicaciones: boolean;
  mercancias: boolean;
  autotransporte: boolean;
  figuras: boolean;
}

export interface CartaPorteFormCache {
  lastValidationDataRef: React.MutableRefObject<string>;
  lastCartaPorteDataRef: React.MutableRefObject<CartaPorteData | null>;
  convertersRef: React.MutableRefObject<any>;
}
