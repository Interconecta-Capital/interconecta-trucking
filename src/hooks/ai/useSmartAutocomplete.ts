
import { useState, useEffect, useCallback, useRef } from 'react';
import { geminiAutocompleteService } from '@/services/ai/GeminiAutocompleteService';
import { aiContextManager } from '@/services/ai/AIContextManager';
import { debounce } from 'lodash';

export interface SmartAutocompleteOptions {
  tipo: 'direccion' | 'mercancia' | 'vehiculo';
  minLength?: number;
  debounceMs?: number;
  includeContext?: boolean;
  cacheEnabled?: boolean;
}

export function useSmartAutocomplete({
  tipo,
  minLength = 3,
  debounceMs = 500,
  includeContext = true,
  cacheEnabled = true
}: SmartAutocompleteOptions) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortController = useRef<AbortController | null>(null);

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
      const fullContext = includeContext 
        ? { ...aiContextManager.obtenerContextoParaAutocompletado(tipo, input), ...context }
        : context;

      let results: any[] = [];

      switch (tipo) {
        case 'direccion':
          results = await geminiAutocompleteService.autocompletarDireccion(input, fullContext);
          break;
        case 'mercancia':
          results = await geminiAutocompleteService.autocompletarMercancia(input, fullContext);
          break;
        case 'vehiculo':
          results = await geminiAutocompleteService.autocompletarVehiculo(input, fullContext);
          break;
      }

      // Convertir a formato esperado por AutocompletedInput
      const formattedSuggestions = results.map((result, index) => ({
        id: `${tipo}-${index}`,
        text: result.fullAddress || result.descripcion || result.modelo || result.text || String(result),
        confidence: result.confidence || 0.8,
        metadata: result
      }));

      setSuggestions(formattedSuggestions);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error(`[useSmartAutocomplete] Error for ${tipo}:`, err);
        setError(err.message || 'Error obteniendo sugerencias');
        setSuggestions([]);
      }
    } finally {
      setLoading(false);
    }
  }, [tipo, minLength, includeContext]);

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

  const selectSuggestion = useCallback((suggestion: any) => {
    // Actualizar contexto con la selección
    aiContextManager.actualizarContextoConAccion(`${tipo}_selected`, {
      suggestion: suggestion.metadata,
      timestamp: Date.now()
    });

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
