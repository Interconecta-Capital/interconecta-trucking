
export type CartaPorteVersion = '3.0' | '3.1';

export interface VersionInfo {
  version: CartaPorteVersion;
  label: string;
  description: string;
  isDefault: boolean;
  namespace: string;
  schemaLocation: string;
}

export interface VersionConfig {
  currentVersion: CartaPorteVersion;
  supportedVersions: VersionInfo[];
  migrationEnabled: boolean;
}

export interface FieldVisibility {
  version30: boolean;
  version31: boolean;
}

export interface VersionedField {
  name: string;
  visibility: FieldVisibility;
  required30: boolean;
  required31: boolean;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  migration?: {
    from30to31?: (value: any) => any;
    from31to30?: (value: any) => any;
  };
}

export const VERSION_INFO: Record<CartaPorteVersion, VersionInfo> = {
  '3.0': {
    version: '3.0',
    label: 'v3.0 (Legacy)',
    description: 'Versión anterior del complemento',
    isDefault: false,
    namespace: 'http://www.sat.gob.mx/CartaPorte30',
    schemaLocation: 'http://www.sat.gob.mx/sitio_internet/cfd/CartaPorte30/CartaPorte30.xsd'
  },
  '3.1': {
    version: '3.1',
    label: 'v3.1 (Actual)',
    description: 'Versión actual recomendada',
    isDefault: true,
    namespace: 'http://www.sat.gob.mx/CartaPorte31',
    schemaLocation: 'http://www.sat.gob.mx/sitio_internet/cfd/CartaPorte31/CartaPorte31.xsd'
  }
};
