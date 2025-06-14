
import { Mercancia } from '@/hooks/useMercancias';
import { DocumentProcessingResult, ProcessingProgress, ProcessDocumentOptions } from './types';

export class XMLProcessor {
  static async processXML(
    file: File,
    onProgress?: (progress: ProcessingProgress) => void,
    options?: ProcessDocumentOptions
  ): Promise<DocumentProcessingResult> {
    onProgress?.({ 
      stage: 'extraction', 
      progress: 30, 
      message: 'Leyendo estructura XML...' 
    });

    const xmlContent = await file.text();
    
    onProgress?.({
      stage: 'parsing',
      progress: 60,
      message: 'Parseando datos de CFDI/Carta Porte...'
    });

    const result = await this.parseXMLContent(xmlContent);
    return result;
  }

  private static async parseXMLContent(xmlContent: string): Promise<DocumentProcessingResult> {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
      
      // Extract mercancías from CFDI/CartaPorte XML
      const mercancias = this.extractMercanciasFromXML(xmlDoc);
      
      return {
        success: true,
        data: mercancias,
        confidence: 0.9,
        extractedText: xmlContent
      };
    } catch (error) {
      return {
        success: false,
        confidence: 0,
        errors: [`Error parseando XML: ${error}`],
        extractedText: xmlContent
      };
    }
  }

  private static extractMercanciasFromXML(xmlDoc: Document): Mercancia[] {
    const mercancias: Mercancia[] = [];
    
    // Look for CartaPorte mercancías
    const mercanciaNodes = xmlDoc.querySelectorAll('cartaporte20\\:Mercancia, Mercancia');
    
    mercanciaNodes.forEach(node => {
      const mercancia: Partial<Mercancia> = {
        bienes_transp: node.getAttribute('BienesTransp') || '',
        descripcion: node.getAttribute('Descripcion') || '',
        cantidad: parseFloat(node.getAttribute('Cantidad') || '0'),
        clave_unidad: node.getAttribute('ClaveUnidad') || '',
        peso_kg: parseFloat(node.getAttribute('PesoEnKg') || '0'),
        valor_mercancia: parseFloat(node.getAttribute('ValorMercancia') || '0'),
        moneda: node.getAttribute('Moneda') || 'MXN'
      };
      
      if (mercancia.bienes_transp) {
        mercancias.push(mercancia as Mercancia);
      }
    });
    
    return mercancias;
  }
}
