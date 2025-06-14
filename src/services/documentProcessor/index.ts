
import type { DocumentProcessingResult, ProcessingProgress, ProcessDocumentOptions } from './types';
import { DocumentTypeDetector } from './documentTypeDetector';
import { PDFProcessor } from './pdfProcessor';
import { XMLProcessor } from './xmlProcessor';
import { ExcelProcessor } from './excelProcessor';
import { ImageProcessor } from './imageProcessor';
import { supabase } from '@/integrations/supabase/client';

export type { DocumentProcessingResult, ProcessingProgress, ProcessDocumentOptions };

interface DocumentLogData {
  user_id: string;
  file_path: string;
  document_type: string;
  extracted_text: string | null;
  confidence: number;
  mercancias_count: number;
  errors: string | null;
  carta_porte_id: string | null;
  documento_original_id: string | null;
  metadata: {
    file_size: number;
    file_type: string;
    processing_time: string;
  };
}

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

      let result: DocumentProcessingResult;

      switch (documentType) {
        case 'pdf':
          result = await PDFProcessor.processPDF(file, onProgress, options);
          break;
        case 'xml':
          result = await XMLProcessor.processXML(file, onProgress, options);
          break;
        case 'excel':
          result = await ExcelProcessor.processExcel(file, onProgress, options);
          break;
        case 'image':
          result = await ImageProcessor.processImage(file, onProgress, options);
          break;
        default:
          throw new Error(`Tipo de documento no soportado: ${documentType}`);
      }

      // Registrar el resultado del procesamiento
      await this.logProcessingResult(file, result, documentType, options);

      onProgress?.({
        stage: 'complete',
        progress: 100,
        message: 'Procesamiento completado exitosamente'
      });

      return result;
    } catch (error) {
      console.error('Error processing document:', error);
      return {
        success: false,
        confidence: 0,
        errors: [error instanceof Error ? error.message : 'Error desconocido']
      };
    }
  }

  private static async logProcessingResult(
    file: File,
    result: DocumentProcessingResult,
    documentType: string,
    options?: ProcessDocumentOptions
  ) {
    try {
      // Obtener el user_id del contexto de autenticación
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.warn('No se pudo obtener el usuario para registrar el documento procesado');
        return;
      }

      const logData: DocumentLogData = {
        user_id: user.id,
        file_path: file.name,
        document_type: documentType,
        extracted_text: result.extractedText || null,
        confidence: result.confidence || 0,
        mercancias_count: result.data?.length || 0,
        errors: result.errors?.join('; ') || null,
        carta_porte_id: options?.cartaPorteId || null,
        documento_original_id: options?.documentoOriginalId || null,
        metadata: {
          file_size: file.size,
          file_type: file.type,
          processing_time: new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from('documentos_procesados')
        .insert(logData);

      if (error) {
        console.error('Error logging processed document:', error);
      }
    } catch (error) {
      console.error('Error in logProcessingResult:', error);
    }
  }
}
