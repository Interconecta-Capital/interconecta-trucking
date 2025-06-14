
import { DocumentProcessingResult, ProcessingProgress, ProcessDocumentOptions } from './types';
import { ExcelParser, defaultColumnMapping } from '@/utils/excelParser';

export class ExcelProcessor {
  static async processExcel(
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

      return {
        success: true,
        data: mercancias,
        confidence: 0.8
      };
    } catch (error) {
      return {
        success: false,
        confidence: 0,
        errors: [`Error procesando Excel: ${error instanceof Error ? error.message : error}`]
      };
    }
  }
}
