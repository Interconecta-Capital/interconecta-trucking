
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
      console.log('Calling Gemini assistant with:', { prompt, context });
      
      const { data, error } = await supabase.functions.invoke('gemini-assistant', {
        body: {
          prompt,
          context,
          action: 'generate_carta_porte_data'
        },
      });

      if (error) {
        console.error('Gemini assistant error:', error);
        throw error;
      }

      console.log('Gemini assistant response:', data);

      if (data?.suggestions) {
        setSuggestions(data.suggestions);
      } else if (data?.data) {
        // Convert single response to suggestion format
        setSuggestions([{
          title: data.title || 'Sugerencia IA',
          description: data.description || 'Datos generados por IA',
          data: data.data,
          confidence: data.confidence || 0.8
        }]);
      } else {
        throw new Error('No se pudieron generar sugerencias');
      }
    } catch (error) {
      console.error('Error generating suggestion:', error);
      toast.error('Error al generar sugerencia');
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
          prompt: `Genera una descripción detallada para el producto con clave: ${claveProducto}`,
          context: 'mercancias',
          action: 'suggest_description'
        },
      });

      if (error) throw error;
      return data?.description || null;
    } catch (error) {
      console.error('Error suggesting description:', error);
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
          prompt: `Valida esta mercancía: ${JSON.stringify(mercanciaData)}`,
          context: 'mercancias',
          action: 'validate_mercancia'
        },
      });

      if (error) throw error;
      return data as ValidationResult;
    } catch (error) {
      console.error('Error validating mercancia:', error);
      toast.error('Error al validar mercancía');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const improveDescription = async (currentDescription: string, claveProducto: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-assistant', {
        body: {
          prompt: `Mejora esta descripción: "${currentDescription}" para el producto ${claveProducto}`,
          context: 'mercancias',
          action: 'improve_description'
        },
      });

      if (error) throw error;
      return data?.description || null;
    } catch (error) {
      console.error('Error improving description:', error);
      toast.error('Error al mejorar descripción');
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
    clearSuggestions,
    isLoading,
    suggestions,
  };
};
