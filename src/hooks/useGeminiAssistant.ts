
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GeminiSuggestion {
  title: string;
  description: string;
  data?: Record<string, any>;
  confidence?: number;
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

  const clearSuggestions = () => {
    setSuggestions([]);
  };

  return {
    generateSuggestion,
    clearSuggestions,
    isLoading,
    suggestions,
  };
};
