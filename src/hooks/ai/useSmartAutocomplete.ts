
import { useState, useEffect, useCallback, useRef } from 'react';
import { geminiAutocompleteService } from '@/services/ai/GeminiAutocompleteService';
import { aiContextManager } from '@/services/ai/AIContextManager';
import { debounce } from 'lodash';

export interface SmartAutocompleteOptions {
  tipo: 'direccion' | 'mercancia' | 'vehiculo' | 'conductor';
  minLength?: number;
  debounceMs?: number;
  includeContext?: boolean;
  cacheEnabled?: boolean;
  includeHistory?: boolean;
}

export interface AutocompleteSuggestion {
  id: string;
  text: string;
  confidence: number;
  source: 'ai' | 'history' | 'frecuente';
  metadata?: any;
}

export function useSmartAutocomplete({
  tipo,
  minLength = 3,
  debounceMs = 500,
  includeContext = true,
  cacheEnabled = true,
  includeHistory = true
}: SmartAutocompleteOptions) {
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortController = useRef<AbortController | null>(null);

  // Obtener sugerencias del historial
  const getHistorySuggestions = useCallback((input: string): AutocompleteSuggestion[] => {
    if (!includeHistory) return [];
    
    try {
      const historyKey = `smart_autocomplete_${tipo}_history`;
      const stored = localStorage.getItem(historyKey);
      
      if (!stored) return [];
      
      const history: string[] = JSON.parse(stored);
      
      return history
        .filter(item => item.toLowerCase().includes(input.toLowerCase()))
        .slice(0, 3)
        .map((item, index) => ({
          id: `history-${index}`,
          text: item,
          confidence: 0.9,
          source: 'history' as const,
          metadata: { fromHistory: true }
        }));
    } catch (error) {
      console.error('Error loading history:', error);
      return [];
    }
  }, [tipo, includeHistory]);

  // Obtener sugerencias frecuentes
  const getFrequentSuggestions = useCallback((input: string): AutocompleteSuggestion[] => {
    try {
      const frequentKey = `smart_autocomplete_${tipo}_frequent`;
      const stored = localStorage.getItem(frequentKey);
      
      if (!stored) return [];
      
      const frequent: Array<{text: string, count: number}> = JSON.parse(stored);
      
      return frequent
        .filter(item => item.text.toLowerCase().includes(input.toLowerCase()))
        .sort((a, b) => b.count - a.count)
        .slice(0, 2)
        .map((item, index) => ({
          id: `frequent-${index}`,
          text: item.text,
          confidence: 0.95,
          source: 'frecuente' as const,
          metadata: { useCount: item.count }
        }));
    } catch (error) {
      console.error('Error loading frequent suggestions:', error);
      return [];
    }
  }, [tipo]);

  const fetchSuggestions = useCallback(async (input: string, context?: any) => {
    if (input.length < minLength) {
      setSuggestions([]);
      return;
    }

    // Cancelar request anterior si existe
    if (abortController.current) {
      abortController.current.abort();
    }
    
    abortController.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      // Combinar sugerencias del historial, frecuentes y AI
      const historySuggestions = getHistorySuggestions(input);
      const frequentSuggestions = getFrequentSuggestions(input);

      // Obtener contexto completo si está habilitado
      const fullContext = includeContext 
        ? { ...aiContextManager.obtenerContextoParaAutocompletado(tipo, input), ...context }
        : context;

      let aiSuggestions: AutocompleteSuggestion[] = [];

      // Obtener sugerencias de IA según el tipo
      try {
        let aiResults: any[] = [];

        switch (tipo) {
          case 'direccion':
            aiResults = await geminiAutocompleteService.autocompletarDireccion(input, fullContext);
            break;
          case 'mercancia':
            aiResults = await geminiAutocompleteService.autocompletarMercancia(input, fullContext);
            break;
          case 'vehiculo':
            aiResults = await geminiAutocompleteService.autocompletarVehiculo(input, fullContext);
            break;
          case 'conductor':
            aiResults = await geminiAutocompleteService.autocompletarConductor(input, fullContext);
            break;
        }

        // Convertir resultados de IA al formato estándar
        aiSuggestions = aiResults.map((result, index) => ({
          id: `ai-${index}`,
          text: result.fullAddress || result.descripcion || result.modelo || result.nombre || result.text || String(result),
          confidence: result.confidence || 0.8,
          source: 'ai' as const,
          metadata: result
        }));
      } catch (aiError) {
        console.error(`[useSmartAutocomplete] AI Error for ${tipo}:`, aiError);
        // Continuar con sugerencias del historial aunque falle la IA
      }

      // Combinar y ordenar todas las sugerencias
      const allSuggestions = [
        ...frequentSuggestions,
        ...historySuggestions,
        ...aiSuggestions
      ];

      // Eliminar duplicados por texto
      const uniqueSuggestions = allSuggestions.reduce((acc, current) => {
        const exists = acc.find(item => item.text.toLowerCase() === current.text.toLowerCase());
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, [] as AutocompleteSuggestion[]);

      // Ordenar por confianza y fuente
      const sortedSuggestions = uniqueSuggestions.sort((a, b) => {
        // Prioridad: frecuentes > historial > IA
        const sourceOrder = { frecuente: 3, history: 2, ai: 1 };
        const sourceComparison = sourceOrder[b.source] - sourceOrder[a.source];
        
        if (sourceComparison !== 0) return sourceComparison;
        
        // Si son de la misma fuente, ordenar por confianza
        return b.confidence - a.confidence;
      });

      setSuggestions(sortedSuggestions.slice(0, 8)); // Máximo 8 sugerencias
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error(`[useSmartAutocomplete] Error for ${tipo}:`, err);
        setError(err.message || 'Error obteniendo sugerencias');
        
        // Mostrar al menos las sugerencias del historial en caso de error
        const historySuggestions = getHistorySuggestions(input);
        const frequentSuggestions = getFrequentSuggestions(input);
        setSuggestions([...frequentSuggestions, ...historySuggestions]);
      }
    } finally {
      setLoading(false);
    }
  }, [tipo, minLength, includeContext, getHistorySuggestions, getFrequentSuggestions]);

  // Debounced version of fetchSuggestions
  const debouncedFetch = useCallback(
    debounce(fetchSuggestions, debounceMs),
    [fetchSuggestions, debounceMs]
  );

  const getSuggestions = useCallback((input: string, context?: any) => {
    debouncedFetch(input, context);
  }, [debouncedFetch]);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
    if (abortController.current) {
      abortController.current.abort();
    }
  }, []);

  // Guardar selección en el historial y frecuencia
  const selectSuggestion = useCallback((suggestion: AutocompleteSuggestion) => {
    // Actualizar contexto con la selección
    aiContextManager.actualizarContextoConAccion(`${tipo}_selected`, {
      suggestion: suggestion.metadata,
      timestamp: Date.now()
    });

    // Guardar en historial
    try {
      const historyKey = `smart_autocomplete_${tipo}_history`;
      const stored = localStorage.getItem(historyKey);
      const history: string[] = stored ? JSON.parse(stored) : [];
      
      // Agregar al historial si no existe
      if (!history.includes(suggestion.text)) {
        history.unshift(suggestion.text);
        localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 20))); // Máximo 20 items
      }

      // Actualizar frecuencia
      const frequentKey = `smart_autocomplete_${tipo}_frequent`;
      const frequentStored = localStorage.getItem(frequentKey);
      const frequent: Array<{text: string, count: number}> = frequentStored ? JSON.parse(frequentStored) : [];
      
      const existingIndex = frequent.findIndex(item => item.text === suggestion.text);
      if (existingIndex >= 0) {
        frequent[existingIndex].count++;
      } else {
        frequent.push({ text: suggestion.text, count: 1 });
      }
      
      localStorage.setItem(frequentKey, JSON.stringify(frequent.slice(0, 50))); // Máximo 50 items
    } catch (error) {
      console.error('Error saving to history:', error);
    }

    clearSuggestions();
    return suggestion.metadata;
  }, [tipo, clearSuggestions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortController.current) {
        abortController.current.abort();
      }
      debouncedFetch.cancel();
    };
  }, [debouncedFetch]);

  return {
    suggestions,
    loading,
    error,
    getSuggestions,
    clearSuggestions,
    selectSuggestion
  };
}
