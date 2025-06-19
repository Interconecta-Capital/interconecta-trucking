
export type CartaPorteVersion = '3.0' | '3.1';

export interface VersionFeatures {
  supportsMultipleRegimenes: boolean;
  supportsTransporteEspecializado: boolean;
  supportsRegistroISTMO: boolean;
  requiredFields: string[];
}

export const VERSION_FEATURES: Record<CartaPorteVersion, VersionFeatures> = {
  '3.0': {
    supportsMultipleRegimenes: false,
    supportsTransporteEspecializado: false,
    supportsRegistroISTMO: false,
    requiredFields: ['rfcEmisor', 'rfcReceptor', 'ubicaciones', 'mercancias']
  },
  '3.1': {
    supportsMultipleRegimenes: true,
    supportsTransporteEspecializado: true,
    supportsRegistroISTMO: true,
    requiredFields: ['rfcEmisor', 'rfcReceptor', 'ubicaciones', 'mercancias', 'autotransporte']
  }
};
