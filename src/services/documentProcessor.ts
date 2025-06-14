
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';

// Configure PDF.js worker for Vite
GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.js',
  import.meta.url
).toString();

import Tesseract from 'tesseract.js';
import { supabase } from '@/integrations/supabase/client';
import { Mercancia } from '@/hooks/useMercancias';
import { ExcelParser, defaultColumnMapping } from '@/utils/excelParser';

export interface DocumentProcessingResult {
  success: boolean;
  data?: Mercancia[];
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

export class DocumentProcessor {
  
  static async detectDocumentType(file: File): Promise<'pdf' | 'xml' | 'excel' | 'image' | 'unknown'> {
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
          return await this.processPDF(file, onProgress, options);
        case 'xml':
          return await this.processXML(file, onProgress, options);
        case 'excel':
          return await this.processExcel(file, onProgress, options);
        case 'image':
          return await this.processImage(file, onProgress, options);
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

  private static async processPDF(
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

    const result = await this.parseWithAI(text, 'pdf');
    await this.logProcessedDocument(file, result, options);
    return result;
  }

  private static async processXML(
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
    await this.logProcessedDocument(file, result, options);
    return result;
  }

  private static async processExcel(
    file: File,
    onProgress?: (progress: ProcessingProgress) => void,
    options?: ProcessDocumentOptions
  ): Promise<DocumentProcessingResult> {
    onProgress?.({
      stage: 'extraction',
      progress: 30,
      message: 'Leyendo archivo Excel/CSV...'
    });

    try {
      const { headers, data } = await ExcelParser.parseFile(file);

      onProgress?.({
        stage: 'parsing',
        progress: 60,
        message: 'Convirtiendo filas en mercancías...'
      });

      const mercancias = ExcelParser.mapDataToMercancias(
        headers,
        data,
        defaultColumnMapping
      );

      const result = {
        success: true,
        data: mercancias,
        confidence: 0.8
      } as DocumentProcessingResult;
      await this.logProcessedDocument(file, result, options);
      return result;
    } catch (error) {
      const result = {
        success: false,
        confidence: 0,
        errors: [`Error procesando Excel: ${error instanceof Error ? error.message : error}`]
      } as DocumentProcessingResult;
      await this.logProcessedDocument(file, result, options);
      return result;
    }
  }

  private static async processImage(
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

    const result = await this.parseWithAI(text, 'image');
    await this.logProcessedDocument(file, result, options);
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

  private static async parseWithAI(text: string, documentType: string): Promise<DocumentProcessingResult> {
    try {
      const { data, error } = await supabase.functions.invoke('gemini-assistant', {
        body: {
          operation: 'parse_document',
          data: {
            text: text,
            document_type: documentType
          }
        }
      });

      if (error) throw error;

      return {
        success: true,
        data: data.result.mercancias || [],
        confidence: data.result.confidence || 0.5,
        extractedText: text,
        mappingSuggestions: data.result.suggestions || []
      };
    } catch (error) {
      return {
        success: false,
        confidence: 0,
        errors: [`Error en procesamiento IA: ${error}`],
        extractedText: text
      };
    }
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

  private static async logProcessedDocument(
    file: File,
    result: DocumentProcessingResult,
    options?: ProcessDocumentOptions
  ): Promise<void> {
    try {
      await supabase.from('documentos_procesados').insert({
        file_path: (file as any).path || (file as any).webkitRelativePath || file.name,
        extracted_text: result.extractedText || null,
        confidence: result.confidence,
        mercancias_count: result.data ? result.data.length : 0,
        errors: result.errors ? result.errors.join('\n') : null,
        carta_porte_id: options?.cartaPorteId || null,
        documento_original_id: options?.documentoOriginalId || null
      });
    } catch (e) {
      console.error('Error logging processed document', e);
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
