
import { supabase } from '@/integrations/supabase/client';
import { DocumentProcessingResult } from './types';

export class AIProcessor {
  static async parseWithAI(text: string, documentType: string): Promise<DocumentProcessingResult> {
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
}
