
export interface DocumentProcessingResult {
  success: boolean;
  data?: any[];
  confidence: number;
  errors?: string[];
  extractedText?: string;
  mappingSuggestions?: string[];
}

export interface ProcessingProgress {
  stage: 'upload' | 'detection' | 'extraction' | 'parsing' | 'validation' | 'complete';
  progress: number;
  message: string;
}

export interface ProcessDocumentOptions {
  cartaPorteId?: string
  documentoOriginalId?: string
}

export type DocumentType = 'pdf' | 'xml' | 'excel' | 'image' | 'unknown';
