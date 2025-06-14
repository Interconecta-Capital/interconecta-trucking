
import Tesseract from 'tesseract.js';
import { DocumentProcessingResult, ProcessingProgress, ProcessDocumentOptions } from './types';
import { AIProcessor } from './aiProcessor';

export class ImageProcessor {
  static async processImage(
    file: File,
    onProgress?: (progress: ProcessingProgress) => void,
    options?: ProcessDocumentOptions
  ): Promise<DocumentProcessingResult> {
    onProgress?.({ 
      stage: 'extraction', 
      progress: 20, 
      message: 'Ejecutando OCR en imagen...' 
    });

    const { data: { text } } = await Tesseract.recognize(file, 'spa', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const progress = Math.round(20 + (m.progress * 40));
          onProgress?.({ 
            stage: 'extraction', 
            progress, 
            message: `OCR en progreso: ${Math.round(m.progress * 100)}%` 
          });
        }
      }
    });

    onProgress?.({
      stage: 'parsing',
      progress: 70,
      message: 'Analizando texto extraído...'
    });

    const result = await AIProcessor.parseWithAI(text, 'image');
    return result;
  }
}
