
import { DocumentProcessingResult, ProcessingProgress, ProcessDocumentOptions } from './types';
import { DocumentTypeDetector } from './documentTypeDetector';
import { PDFProcessor } from './pdfProcessor';
import { XMLProcessor } from './xmlProcessor';
import { ExcelProcessor } from './excelProcessor';
import { ImageProcessor } from './imageProcessor';

export { DocumentProcessingResult, ProcessingProgress, ProcessDocumentOptions };

export class DocumentProcessor {
  static async detectDocumentType(file: File) {
    return DocumentTypeDetector.detectDocumentType(file);
  }

  static async processDocument(
    file: File,
    onProgress?: (progress: ProcessingProgress) => void,
    options?: ProcessDocumentOptions
  ): Promise<DocumentProcessingResult> {
    try {
      const documentType = await this.detectDocumentType(file);
      
      onProgress?.({ 
        stage: 'detection', 
        progress: 10, 
        message: `Documento detectado como: ${documentType.toUpperCase()}` 
      });

      switch (documentType) {
        case 'pdf':
          return await PDFProcessor.processPDF(file, onProgress, options);
        case 'xml':
          return await XMLProcessor.processXML(file, onProgress, options);
        case 'excel':
          return await ExcelProcessor.processExcel(file, onProgress, options);
        case 'image':
          return await ImageProcessor.processImage(file, onProgress, options);
        default:
          throw new Error(`Tipo de documento no soportado: ${documentType}`);
      }
    } catch (error) {
      console.error('Error processing document:', error);
      return {
        success: false,
        confidence: 0,
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }
}
