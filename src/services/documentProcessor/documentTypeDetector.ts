
import { DocumentType } from './types';

export class DocumentTypeDetector {
  static async detectDocumentType(file: File): Promise<DocumentType> {
    const extension = file.name.toLowerCase().split('.').pop();
    const mimeType = file.type;
    
    if (extension === 'pdf' || mimeType === 'application/pdf') {
      return 'pdf';
    }
    
    if (extension === 'xml' || mimeType === 'text/xml' || mimeType === 'application/xml') {
      return 'xml';
    }
    
    if (extension === 'xlsx' || extension === 'xls' || extension === 'csv') {
      return 'excel';
    }
    
    if (mimeType.startsWith('image/')) {
      return 'image';
    }
    
    return 'unknown';
  }
}
