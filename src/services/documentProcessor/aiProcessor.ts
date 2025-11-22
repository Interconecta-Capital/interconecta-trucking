import { supabase } from '@/integrations/supabase/client';
import { DocumentProcessingResult } from './types';
import { validateDocumentProcessingResult } from '@/types/mercancia-ccp';

interface GeminiResponse {
  result: {
    mercancias?: unknown[];
    confidence?: number;
    suggestions?: string[];
  };
}

interface GeminiRequestBody {
  operation: string;
  data: {
    text: string;
    document_type: string;
  };
}

export class AIProcessor {
  static async parseWithAI(text: string, documentType: string): Promise<DocumentProcessingResult> {
    try {
      const requestBody: GeminiRequestBody = {
        operation: 'parse_document',
        data: {
          text: text,
          document_type: documentType
        }
      };

      console.log('[AIProcessor] Invocando Lovable AI para análisis de documento...');

      const { data, error } = await supabase.functions.invoke('gemini-assistant', {
        body: requestBody
      });

      if (error) {
        console.error('[AIProcessor] Error en Edge Function:', error);
        throw error;
      }

      const response = data as GeminiResponse;

      // ✅ ISO 27001: Validación con Zod antes de usar datos
      const validatedResult = validateDocumentProcessingResult({
        mercancias: response.result.mercancias || [],
        confidence: response.result.confidence || 0.5,
        suggestions: response.result.suggestions || []
      });

      console.log(`[AIProcessor] ✅ Extraídas ${validatedResult.mercancias.length} mercancías con confianza ${(validatedResult.confidence * 100).toFixed(0)}%`);

      return {
        success: true,
        data: validatedResult.mercancias,
        confidence: validatedResult.confidence,
        extractedText: text,
        mappingSuggestions: validatedResult.suggestions
      };
    } catch (error) {
      console.error('[AIProcessor] Error en procesamiento:', error);
      return {
        success: false,
        confidence: 0,
        errors: [`Error en procesamiento IA: ${error instanceof Error ? error.message : 'Error desconocido'}`],
        extractedText: text
      };
    }
  }
}
