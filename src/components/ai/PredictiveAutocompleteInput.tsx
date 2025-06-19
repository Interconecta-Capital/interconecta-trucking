
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  Sparkles, 
  Check, 
  History, 
  Star, 
  Brain, 
  Info,
  TrendingUp,
  Target,
  Zap
} from 'lucide-react';
import { usePredictiveAutocomplete } from '@/hooks/ai/usePredictiveAutocomplete';
import { PredictiveSuggestion } from '@/services/ai/PredictiveAutocompleteService';
import { CartaPorteData } from '@/types/cartaPorte';

interface PredictiveAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect?: (suggestion: any) => void;
  field: string;
  type: 'direccion' | 'mercancia' | 'vehiculo' | 'conductor' | 'general';
  currentData: Partial<CartaPorteData>;
  label?: string;
  placeholder?: string;
  className?: string;
  showStats?: boolean;
  showContextualSuggestions?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export function PredictiveAutocompleteInput({
  value,
  onChange,
  onSuggestionSelect,
  field,
  type,
  currentData,
  label,
  placeholder,
  className,
  showStats = false,
  showContextualSuggestions = false,
  disabled = false,
  required = false
}: PredictiveAutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showingContextual, setShowingContextual] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const {
    suggestions,
    loading,
    error,
    suggestionStats,
    getSuggestions,
    selectSuggestion,
    clearSuggestions,
    getContextualSuggestions,
    getPerformanceMetrics,
    hasHistory
  } = usePredictiveAutocomplete({
    field,
    type,
    currentData,
    enableLearning: true,
    enableContextualBoost: true
  });

  // Obtener sugerencias cuando cambia el valor
  useEffect(() => {
    if (value.length >= 2) {
      getSuggestions(value);
      setShowingContextual(false);
    } else {
      clearSuggestions();
    }
  }, [value, getSuggestions, clearSuggestions]);

  // Mostrar sugerencias contextuales cuando está vacío
  useEffect(() => {
    if (value.length === 0 && showContextualSuggestions && hasHistory) {
      getContextualSuggestions();
      setShowingContextual(true);
    }
  }, [value, showContextualSuggestions, hasHistory, getContextualSuggestions]);

  // Manejar teclas
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Manejar click en sugerencia
  const handleSuggestionClick = (suggestion: PredictiveSuggestion) => {
    const selectedValue = selectSuggestion(suggestion);
    onChange(suggestion.text);
    onSuggestionSelect?.(selectedValue);
    setIsOpen(false);
    setSelectedIndex(-1);
    setShowingContextual(false);
    inputRef.current?.focus();
  };

  // Manejar cambio de input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  // Abrir/cerrar lista según el focus y las sugerencias
  useEffect(() => {
    setIsOpen(suggestions.length > 0);
  }, [suggestions.length]);

  // Scroll a la sugerencia seleccionada
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const getSourceIcon = (source: PredictiveSuggestion['source']) => {
    switch (source) {
      case 'frecuente':
        return <Star className="h-3 w-3 text-yellow-500" />;
      case 'pattern':
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'ai':
        return <Brain className="h-3 w-3 text-purple-500" />;
      case 'similar':
        return <Target className="h-3 w-3 text-blue-500" />;
      default:
        return <Sparkles className="h-3 w-3 text-gray-500" />;
    }
  };

  const getSourceLabel = (source: PredictiveSuggestion['source']) => {
    switch (source) {
      case 'frecuente':
        return 'Frecuente';
      case 'pattern':
        return 'Patrón';
      case 'ai':
        return 'IA';
      case 'similar':
        return 'Similar';
      default:
        return 'Sugerencia';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800 border-green-300';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const performanceMetrics = getPerformanceMetrics();

  return (
    <div className="relative space-y-2">
      {label && (
        <Label htmlFor={field} className="flex items-center gap-2">
          {label}
          {required && <span className="text-red-500">*</span>}
          {hasHistory && (
            <Badge variant="outline" className="text-xs">
              <Zap className="h-2 w-2 mr-1" />
              Predictivo
            </Badge>
          )}
        </Label>
      )}
      
      <div className="relative">
        <Input
          ref={inputRef}
          id={field}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(suggestions.length > 0)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder={placeholder}
          className={className}
          disabled={disabled}
          required={required}
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          </div>
        )}
        
        {!loading && suggestions.length > 0 && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Sparkles className="h-4 w-4 text-purple-500" />
          </div>
        )}
      </div>

      {/* Estadísticas de sugerencias */}
      {showStats && suggestionStats.totalSuggestions > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs">
            {suggestionStats.totalSuggestions} sugerencias
          </Badge>
          {suggestionStats.aiSuggestions > 0 && (
            <Badge variant="outline" className="text-xs border-purple-300 text-purple-700">
              <Brain className="h-2 w-2 mr-1" />
              {suggestionStats.aiSuggestions} IA
            </Badge>
          )}
          {suggestionStats.frequentSuggestions > 0 && (
            <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
              <Star className="h-2 w-2 mr-1" />
              {suggestionStats.frequentSuggestions} frecuentes
            </Badge>
          )}
        </div>
      )}

      {/* Error de autocompletado */}
      {error && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertDescription className="text-orange-800 text-xs">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de sugerencias */}
      {isOpen && suggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-hidden shadow-lg border-2 border-purple-100">
          <CardContent className="p-0">
            {showingContextual && (
              <CardHeader className="py-2 px-3 bg-purple-50 border-b">
                <CardTitle className="text-xs font-medium text-purple-700 flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Sugerencias contextuales
                </CardTitle>
              </CardHeader>
            )}
            
            <div ref={listRef} className="max-h-80 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={suggestion.id}
                  type="button"
                  variant="ghost"
                  className={`w-full text-left justify-start h-auto p-3 rounded-none border-b last:border-b-0 ${
                    index === selectedIndex 
                      ? 'bg-purple-50 border-l-2 border-l-purple-500' 
                      : 'hover:bg-gray-50'
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSuggestionClick(suggestion);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-start space-x-3 w-full">
                    <div className="mt-1">
                      {getSourceIcon(suggestion.source)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm leading-tight mb-1">
                        {suggestion.text}
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {getSourceLabel(suggestion.source)}
                        </Badge>
                        
                        <Badge className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}>
                          {Math.round(suggestion.confidence * 100)}%
                        </Badge>
                        
                        {suggestion.metadata?.useCount && (
                          <Badge variant="secondary" className="text-xs">
                            {suggestion.metadata.useCount} usos
                          </Badge>
                        )}
                        
                        {suggestion.metadata?.contextSimilarity && (
                          <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                            {Math.round(suggestion.metadata.contextSimilarity * 100)}% similar
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {index === selectedIndex && (
                      <Check className="h-4 w-4 text-purple-500 mt-1" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas de rendimiento */}
      {showStats && performanceMetrics.totalUsage > 0 && (
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Total: {performanceMetrics.totalUsage}</span>
            <span>Esta semana: {performanceMetrics.recentUsage}</span>
            <span>Confianza promedio: {Math.round(performanceMetrics.averageConfidence * 100)}%</span>
          </div>
        </div>
      )}

      {/* Indicador de aprendizaje */}
      {suggestions.some(s => s.source === 'pattern' || s.source === 'frecuente') && (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <TrendingUp className="h-3 w-3" />
          <span>El sistema aprendió de tus patrones de uso</span>
        </div>
      )}
    </div>
  );
}
