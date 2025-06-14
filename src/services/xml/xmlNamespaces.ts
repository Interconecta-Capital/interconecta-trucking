
import { CartaPorteVersion } from '@/types/cartaPorteVersions';

export const XML_NAMESPACES = {
  cfdi: 'http://www.sat.gob.mx/cfd/4',
  cartaporte30: 'http://www.sat.gob.mx/CartaPorte30',
  cartaporte31: 'http://www.sat.gob.mx/CartaPorte31',
  xsi: 'http://www.w3.org/2001/XMLSchema-instance'
} as const;

export const getCartaPorteNamespace = (version: CartaPorteVersion): string => {
  return version === '3.1' ? XML_NAMESPACES.cartaporte31 : XML_NAMESPACES.cartaporte30;
};

export const getSchemaLocation = (version: CartaPorteVersion): string => {
  const cartaPorteNamespace = getCartaPorteNamespace(version);
  const schemaFile = version === '3.1' ? 'CartaPorte31.xsd' : 'CartaPorte30.xsd';
  const schemaPath = version === '3.1' ? 'CartaPorte31' : 'CartaPorte30';
  
  return `${XML_NAMESPACES.cfdi} http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd ${cartaPorteNamespace} http://www.sat.gob.mx/sitio_internet/cfd/${schemaPath}/${schemaFile}`;
};

// Legacy export para compatibilidad
export const SCHEMA_LOCATIONS = getSchemaLocation('3.1');
