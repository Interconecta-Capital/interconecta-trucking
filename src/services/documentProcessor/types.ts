
export interface DocumentProcessingResult {
  success: boolean;
  data?: unknown[];
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
  cartaPorteId?: string;
  documentoOriginalId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  extractMercancias?: boolean;
}

export type DocumentType = 'pdf' | 'xml' | 'excel' | 'image' | 'unknown';

export interface DocumentoProcessado {
  id: string;
  user_id: string;
  file_path: string;
  document_type: string;
  extracted_text?: string;
  confidence: number;
  mercancias_count: number;
  errors?: string;
  carta_porte_id?: string;
  documento_original_id?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}
