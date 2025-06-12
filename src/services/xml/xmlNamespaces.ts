
export const XML_NAMESPACES = {
  cfdi: 'http://www.sat.gob.mx/cfd/4',
  cartaporte31: 'http://www.sat.gob.mx/CartaPorte31',
  xsi: 'http://www.w3.org/2001/XMLSchema-instance'
} as const;

export const SCHEMA_LOCATIONS = `${XML_NAMESPACES.cfdi} http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd ${XML_NAMESPACES.cartaporte31} http://www.sat.gob.mx/sitio_internet/cfd/CartaPorte31/CartaPorte31.xsd`;
