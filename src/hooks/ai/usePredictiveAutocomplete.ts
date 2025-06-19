
import { useState, useCallback, useEffect } from 'react';
import { PredictiveAutocompleteService, PredictiveSuggestion, AutocompleteContext } from '@/services/ai/PredictiveAutocompleteService';
import { CartaPorteData } from '@/types/cartaPorte';
import { useToast } from '@/hooks/use-toast';

interface UsePredictiveAutocompleteOptions {
  field: string;
  type: 'direccion' | 'mercancia' | 'vehiculo' | 'conductor' | 'general';
  currentData: Partial<CartaPorteData>;
  debounceMs?: number;
  enableLearning?: boolean;
  enableContextualBoost?: boolean;
}

export const usePredictiveAutocomplete = ({
  field,
  type,
  currentData,
  debounceMs = 300,
  enableLearning = true,
  enableContextualBoost = true
}: UsePredictiveAutocompleteOptions) => {
  const [suggestions, setSuggestions] = useState<PredictiveSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string>('');
  const [suggestionStats, setSuggestionStats] = useState({
    totalSuggestions: 0,
    aiSuggestions: 0,
    patternSuggestions: 0,
    frequentSuggestions: 0
  });
  
  const { toast } = useToast();

  // Construir contexto para autocompletado
  const buildContext = useCallback((): AutocompleteContext => {
    const now = new Date();
    
    return {
      currentData,
      userHistory: getUserHistory(),
      timeOfDay: now.toTimeString().slice(0, 5),
      dayOfWeek: now.toLocaleDateString('es-ES', { weekday: 'long' }),
      location: getCurrentLocation()
    };
  }, [currentData]);

  // Obtener historial del usuario
  const getUserHistory = (): any[] => {
    try {
      const history = localStorage.getItem('carta_porte_history');
      return history ? JSON.parse(history) : [];
    } catch {
      return [];
    }
  };

  // Obtener ubicación actual (simplificado)
  const getCurrentLocation = (): string => {
    try {
      const location = localStorage.getItem('user_location');
      return location || 'Ciudad de México';
    } catch {
      return 'Ciudad de México';
    }
  };

  // Obtener sugerencias principales
  const getSuggestions = useCallback(async (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      setSuggestionStats({
        totalSuggestions: 0,
        aiSuggestions: 0,
        patternSuggestions: 0,
        frequentSuggestions: 0
      });
      return;
    }

    if (input === lastQuery) return;

    setLoading(true);
    setError(null);
    setLastQuery(input);

    try {
      const context = buildContext();
      
      console.log('🔮 [usePredictiveAutocomplete] Obteniendo sugerencias para:', {
        field,
        input,
        type,
        contextSize: context.userHistory.length
      });

      const suggestions = await PredictiveAutocompleteService.getSmartSuggestions(
        field,
        input,
        context,
        type
      );

      setSuggestions(suggestions);

      // Calcular estadísticas
      const stats = {
        totalSuggestions: suggestions.length,
        aiSuggestions: suggestions.filter(s => s.source === 'ai').length,
        patternSuggestions: suggestions.filter(s => s.source === 'pattern').length,
        frequentSuggestions: suggestions.filter(s => s.source === 'frecuente').length
      };
      setSuggestionStats(stats);

      console.log('✅ Sugerencias obtenidas:', stats);

    } catch (err: any) {
      console.error('❌ Error obteniendo sugerencias:', err);
      setError(err.message || 'Error obteniendo sugerencias');
      
      if (enableLearning) {
        toast({
          title: "Error en Autocompletado",
          description: "No se pudieron obtener sugerencias inteligentes",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [field, type, buildContext, lastQuery, enableLearning, toast]);

  // Debounced version
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const debouncedGetSuggestions = useCallback((input: string) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      getSuggestions(input);
    }, debounceMs);

    setDebounceTimeout(timeout);
  }, [getSuggestions, debounceMs, debounceTimeout]);

  // Seleccionar sugerencia
  const selectSuggestion = useCallback((suggestion: PredictiveSuggestion) => {
    console.log('✅ Sugerencia seleccionada:', suggestion);
    
    // Registrar uso para aprendizaje
    if (enableLearning) {
      PredictiveAutocompleteService.recordSuggestionUsage(field, suggestion);
      
      // Actualizar historial local
      try {
        const usage = {
          field,
          suggestion: suggestion.text,
          timestamp: new Date().toISOString(),
          source: suggestion.source,
          confidence: suggestion.confidence
        };
        
        const usageHistory = localStorage.getItem('autocomplete_usage_history');
        const history = usageHistory ? JSON.parse(usageHistory) : [];
        history.unshift(usage);
        
        localStorage.setItem('autocomplete_usage_history', JSON.stringify(history.slice(0, 1000)));
      } catch (error) {
        console.error('Error guardando historial de uso:', error);
      }
    }

    // Toast informativo sobre la fuente
    if (enableContextualBoost && suggestion.confidence > 0.8) {
      const sourceLabels = {
        ai: 'IA',
        pattern: 'Patrón',
        frecuente: 'Frecuente',
        similar: 'Similar'
      };
      
      toast({
        title: `✨ Sugerencia ${sourceLabels[suggestion.source]}`,
        description: `Confianza: ${Math.round(suggestion.confidence * 100)}%`,
      });
    }

    setSuggestions([]);
    return suggestion.value;
  }, [field, enableLearning, enableContextualBoost, toast]);

  // Limpiar sugerencias
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setSuggestionStats({
      totalSuggestions: 0,
      aiSuggestions: 0,
      patternSuggestions: 0,
      frequentSuggestions: 0
    });
    setError(null);
    setLastQuery('');
  }, []);

  // Obtener sugerencias contextuales (sin input)
  const getContextualSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const context = buildContext();
      
      // Obtener sugerencias basadas solo en contexto
      const suggestions = await PredictiveAutocompleteService.getSmartSuggestions(
        field,
        '', // Sin input para obtener sugerencias contextuales
        context,
        type
      );

      setSuggestions(suggestions.slice(0, 5)); // Límite para sugerencias contextuales
      
    } catch (err: any) {
      console.error('Error obteniendo sugerencias contextuales:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [field, type, buildContext]);

  // Obtener métricas de rendimiento
  const getPerformanceMetrics = useCallback(() => {
    try {
      const usageHistory = localStorage.getItem('autocomplete_usage_history');
      const history = usageHistory ? JSON.parse(usageHistory) : [];
      
      const fieldHistory = history.filter((usage: any) => usage.field === field);
      const recentHistory = fieldHistory.filter((usage: any) => 
        new Date(usage.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      );

      return {
        totalUsage: fieldHistory.length,
        recentUsage: recentHistory.length,
        averageConfidence: fieldHistory.length > 0 
          ? fieldHistory.reduce((sum: number, usage: any) => sum + usage.confidence, 0) / fieldHistory.length 
          : 0,
        sourceDistribution: {
          ai: fieldHistory.filter((u: any) => u.source === 'ai').length,
          pattern: fieldHistory.filter((u: any) => u.source === 'pattern').length,
          frecuente: fieldHistory.filter((u: any) => u.source === 'frecuente').length,
          similar: fieldHistory.filter((u: any) => u.source === 'similar').length
        }
      };
    } catch {
      return {
        totalUsage: 0,
        recentUsage: 0,
        averageConfidence: 0,
        sourceDistribution: { ai: 0, pattern: 0, frecuente: 0, similar: 0 }
      };
    }
  }, [field]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  return {
    // Estado principal
    suggestions,
    loading,
    error,
    suggestionStats,
    
    // Funciones principales
    getSuggestions: debouncedGetSuggestions,
    selectSuggestion,
    clearSuggestions,
    
    // Funciones avanzadas
    getContextualSuggestions,
    getPerformanceMetrics,
    
    // Utilidades
    lastQuery,
    hasHistory: getUserHistory().length > 0,
    contextSize: buildContext().userHistory.length
  };
};
