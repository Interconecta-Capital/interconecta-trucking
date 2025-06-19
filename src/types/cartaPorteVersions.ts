
export type CartaPorteVersion = '3.0' | '3.1';

export const CARTA_PORTE_VERSIONS: CartaPorteVersion[] = ['3.0', '3.1'];

export const DEFAULT_CARTA_PORTE_VERSION: CartaPorteVersion = '3.1';

export const VERSION_INFO = {
  '3.0': {
    label: 'Carta Porte 3.0',
    description: 'Versión legacy del complemento Carta Porte. Compatible con sistemas existentes.',
    deprecated: true,
    features: [
      'Régimen Aduanero como campo único',
      'Fracción Arancelaria opcional',
      'Estructura simplificada'
    ]
  },
  '3.1': {
    label: 'Carta Porte 3.1',
    description: 'Versión actual del complemento Carta Porte con mejoras y nuevos campos obligatorios.',
    deprecated: false,
    features: [
      'Régimen Aduanero como array (múltiples valores)',
      'Fracción Arancelaria obligatoria',
      'Nuevos campos de RemolquesCCP',
      '39 campos adicionales mejorados',
      'Validaciones más estrictas'
    ]
  }
} as const;
