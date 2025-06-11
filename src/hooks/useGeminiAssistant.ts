
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ValidationResult {
  is_valid: boolean;
  issues: string[];
  suggestions: string[];
  confidence: number;
}

export const useGeminiAssistant = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const suggestDescription = async (claveProducto: string): Promise<string | null> => {
    if (!claveProducto) {
      toast({
        title: "Error",
        description: "Se requiere una clave de producto",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-assistant', {
        body: {
          action: 'suggest_description',
          data: { clave_producto: claveProducto }
        }
      });

      if (error) throw error;
      
      return data.result;
    } catch (error) {
      console.error('Error suggesting description:', error);
      toast({
        title: "Error",
        description: "No se pudo generar la sugerencia de descripción",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const validateMercancia = async (mercanciaData: {
    clave_producto: string;
    descripcion_actual: string;
    cantidad: number;
    unidad: string;
    peso?: number;
    valor?: number;
  }): Promise<ValidationResult | null> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-assistant', {
        body: {
          action: 'validate_mercancia',
          data: mercanciaData
        }
      });

      if (error) throw error;
      
      return data.result;
    } catch (error) {
      console.error('Error validating mercancia:', error);
      toast({
        title: "Error",
        description: "No se pudo validar la mercancía",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const improveDescription = async (
    descripcionActual: string, 
    claveProducto: string
  ): Promise<string | null> => {
    if (!descripcionActual || !claveProducto) {
      toast({
        title: "Error",
        description: "Se requiere descripción y clave de producto",
        variant: "destructive"
      });
      return null;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('gemini-assistant', {
        body: {
          action: 'improve_description',
          data: { 
            descripcion_actual: descripcionActual,
            clave_producto: claveProducto 
          }
        }
      });

      if (error) throw error;
      
      return data.result;
    } catch (error) {
      console.error('Error improving description:', error);
      toast({
        title: "Error",
        description: "No se pudo mejorar la descripción",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    suggestDescription,
    validateMercancia,
    improveDescription
  };
};
