
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import { DocumentProcessingResult, ProcessingProgress, ProcessDocumentOptions } from './types';
import { AIProcessor } from './aiProcessor';

// Configure PDF.js worker for Vite
GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

export class PDFProcessor {
  static async processPDF(
    file: File,
    onProgress?: (progress: ProcessingProgress) => void,
    options?: ProcessDocumentOptions
  ): Promise<DocumentProcessingResult> {
    onProgress?.({ 
      stage: 'extraction', 
      progress: 20, 
      message: 'Extrayendo texto del PDF...' 
    });

    // Convert PDF to images and process with OCR
    const text = await this.extractTextFromPDF(file, onProgress);
    
    onProgress?.({ 
      stage: 'parsing', 
      progress: 60, 
      message: 'Analizando contenido con IA...' 
    });

    const result = await AIProcessor.parseWithAI(text, 'pdf');
    return result;
  }

  private static async extractTextFromPDF(
    file: File,
    onProgress?: (progress: ProcessingProgress) => void
  ): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let text = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item: any) => ('str' in item ? item.str : ''))
        .join(' ');
      text += pageText + '\n';

      const progress = 20 + Math.round((pageNum / pdf.numPages) * 40);
      onProgress?.({
        stage: 'extraction',
        progress,
        message: `Extrayendo página ${pageNum} de ${pdf.numPages}...`
      });
    }

    return text;
  }
}
