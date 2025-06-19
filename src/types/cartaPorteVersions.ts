
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

export interface VersionInfo {
  label: string;
  description: string;
}

export const VERSION_INFO: Record<CartaPorteVersion, VersionInfo> = {
  '3.0': {
    label: 'Versión 3.0',
    description: 'Versión legacy del complemento Carta Porte. Mantiene compatibilidad con sistemas existentes pero con funcionalidades limitadas.'
  },
  '3.1': {
    label: 'Versión 3.1',
    description: 'Versión actual del complemento Carta Porte. Incluye nuevas validaciones, campos adicionales y mejoras en el cumplimiento normativo.'
  }
};
