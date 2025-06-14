
import { supabase } from '@/integrations/supabase/client';
import { DocumentProcessingResult } from './types';

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

      const { data, error } = await supabase.functions.invoke('gemini-assistant', {
        body: requestBody
      });

      if (error) throw error;

      const response = data as GeminiResponse;

      return {
        success: true,
        data: response.result.mercancias || [],
        confidence: response.result.confidence || 0.5,
        extractedText: text,
        mappingSuggestions: response.result.suggestions || []
      };
    } catch (error) {
      return {
        success: false,
        confidence: 0,
        errors: [`Error en procesamiento IA: ${error instanceof Error ? error.message : 'Error desconocido'}`],
        extractedText: text
      };
    }
  }
}
