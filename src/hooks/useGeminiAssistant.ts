
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GeminiSuggestion {
  title: string;
  description: string;
  data?: Record<string, any>;
  confidence?: number;
}

export interface ValidationResult {
  is_valid: boolean;
  confidence: number;
  issues: string[];
  suggestions: string[];
}

export const useGeminiAssistant = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<GeminiSuggestion[]>([]);

  const generateSuggestion = async (prompt: string, context: string) => {
    setIsLoading(true);
    try {
      console.log('[GEMINI_HOOK] Generando sugerencia:', { prompt, context });
      
      const { data, error } = await supabase.functions.invoke('gemini-assistant', {
        body: {
          operation: 'generate_carta_porte_data',
          prompt,
          context
        },
      });

      if (error) {
        console.error('[GEMINI_HOOK] Error:', error);
        throw error;
      }

      console.log('[GEMINI_HOOK] Respuesta recibida:', data);

      if (data?.suggestions) {
        setSuggestions(data.suggestions);
      } else if (data?.response) {
        setSuggestions([{
          title: 'Sugerencia IA',
          description: data.response,
          confidence: 0.8
        }]);
      } else {
        throw new Error('No se pudieron generar sugerencias');
      }
    } catch (error) {
      console.error('[GEMINI_HOOK] Error generating suggestion:', error);
      toast.error('Error al generar sugerencia con IA');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const suggestDescription = async (claveProducto: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-assistant', {
        body: {
          operation: 'suggest_description',
          prompt: claveProducto
        },
      });

      if (error) throw error;
      return data?.description || null;
    } catch (error) {
      console.error('[GEMINI_HOOK] Error suggesting description:', error);
      toast.error('Error al generar descripción');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const validateMercancia = async (mercanciaData: any): Promise<ValidationResult | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-assistant', {
        body: {
          operation: 'validate_mercancia',
          data: mercanciaData
        },
      });

      if (error) throw error;
      return data as ValidationResult;
    } catch (error) {
      console.error('[GEMINI_HOOK] Error validating mercancia:', error);
      toast.error('Error al validar mercancía');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const improveDescription = async (currentDescription: string, claveProducto?: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      const prompt = claveProducto 
        ? `Mejora esta descripción: "${currentDescription}" para el producto ${claveProducto}`
        : currentDescription;

      const { data, error } = await supabase.functions.invoke('gemini-assistant', {
        body: {
          operation: 'improve_description',
          prompt
        },
      });

      if (error) throw error;
      return data?.description || null;
    } catch (error) {
      console.error('[GEMINI_HOOK] Error improving description:', error);
      toast.error('Error al mejorar descripción');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const parseDocument = async (documentText: string, documentType: string): Promise<any> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-assistant', {
        body: {
          operation: 'parse_document',
          data: { text: documentText, document_type: documentType }
        },
      });

      if (error) throw error;
      return data?.result || null;
    } catch (error) {
      console.error('[GEMINI_HOOK] Error parsing document:', error);
      toast.error('Error al procesar documento');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearSuggestions = () => {
    setSuggestions([]);
  };

  return {
    generateSuggestion,
    suggestDescription,
    validateMercancia,
    improveDescription,
    parseDocument,
    clearSuggestions,
    isLoading,
    suggestions,
  };
};
