
import { CartaPorteVersion } from '@/types/cartaPorteVersions';

export class XMLNamespaceManager {
  private version: CartaPorteVersion;

  constructor(version: CartaPorteVersion) {
    this.version = version;
  }

  getCartaPorteNamespace(): string {
    return this.version === '3.1' 
      ? 'http://www.sat.gob.mx/CartaPorte31'
      : 'http://www.sat.gob.mx/CartaPorte30';
  }

  getNamespaceAlias(): string {
    return this.version === '3.1' ? 'cartaporte31' : 'cartaporte30';
  }

  getAllNamespaces(): string {
    const alias = this.getNamespaceAlias();
    const cartaPorteNS = this.getCartaPorteNamespace();
    
    return `
  xmlns:cfdi="http://www.sat.gob.mx/cfd/4"
  xmlns:${alias}="${cartaPorteNS}"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"`;
  }

  getSchemaLocation(): string {
    const cartaPorteNS = this.getCartaPorteNamespace();
    const schemaFile = this.version === '3.1' ? 'CartaPorte31.xsd' : 'CartaPorte30.xsd';
    const schemaPath = this.version === '3.1' ? 'CartaPorte31' : 'CartaPorte30';
    
    return `xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd ${cartaPorteNS} http://www.sat.gob.mx/sitio_internet/cfd/${schemaPath}/${schemaFile}"`;
  }
}
