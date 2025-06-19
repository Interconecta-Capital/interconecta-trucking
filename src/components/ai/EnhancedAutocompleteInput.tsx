
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, Check, History, Star, Brain, Info } from 'lucide-react';
import { useSmartAutocomplete, AutocompleteSuggestion } from '@/hooks/ai/useSmartAutocomplete';
import { AIContextData } from '@/services/ai/AIContextManager';

interface EnhancedAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect?: (suggestion: any) => void;
  type: 'direccion' | 'mercancia' | 'vehiculo' | 'conductor';
  label?: string;
  placeholder?: string;
  className?: string;
  context?: AIContextData;
  formName?: string;
  fieldName?: string;
  showValidation?: boolean;
  showHelp?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export function EnhancedAutocompleteInput({
  value,
  onChange,
  onSuggestionSelect,
  type,
  label,
  placeholder,
  className,
  context,
  formName,
  fieldName,
  showValidation = false,
  showHelp = false,
  disabled = false,
  required = false
}: EnhancedAutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const {
    suggestions,
    loading,
    error,
    getSuggestions,
    clearSuggestions,
    selectSuggestion
  } = useSmartAutocomplete({
    tipo: type,
    includeHistory: true,
    includeContext: true
  });

  // Obtener sugerencias cuando cambia el valor
  useEffect(() => {
    if (value.length >= 2) {
      getSuggestions(value, context);
    } else {
      clearSuggestions();
    }
  }, [value, getSuggestions, clearSuggestions, context]);

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
  const handleSuggestionClick = (suggestion: AutocompleteSuggestion) => {
    const metadata = selectSuggestion(suggestion);
    onChange(suggestion.text);
    onSuggestionSelect?.(metadata);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Manejar cambio de input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (newValue.length === 0) {
      clearSuggestions();
      setValidationMessage('');
    }
  };

  // Abrir/cerrar lista según el focus y las sugerencias
  useEffect(() => {
    setIsOpen(suggestions.length > 0 && value.length >= 2);
  }, [suggestions.length, value.length]);

  // Scroll a la sugerencia seleccionada
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Validación básica
  useEffect(() => {
    if (showValidation && value && required) {
      if (value.length < 3) {
        setValidationMessage('Mínimo 3 caracteres');
      } else {
        setValidationMessage('');
      }
    }
  }, [value, showValidation, required]);

  const getSourceIcon = (source: AutocompleteSuggestion['source']) => {
    switch (source) {
      case 'frecuente':
        return <Star className="h-3 w-3 text-yellow-500" />;
      case 'history':
        return <History className="h-3 w-3 text-blue-500" />;
      case 'ai':
        return <Brain className="h-3 w-3 text-purple-500" />;
      default:
        return <Sparkles className="h-3 w-3 text-gray-500" />;
    }
  };

  const getSourceLabel = (source: AutocompleteSuggestion['source']) => {
    switch (source) {
      case 'frecuente':
        return 'Frecuente';
      case 'history':
        return 'Historial';
      case 'ai':
        return 'IA';
      default:
        return 'Sugerencia';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="relative space-y-2">
      {label && (
        <Label htmlFor={fieldName} className="flex items-center gap-2">
          {label}
          {required && <span className="text-red-500">*</span>}
          {showHelp && (
            <Info className="h-3 w-3 text-muted-foreground" />
          )}
        </Label>
      )}
      
      <div className="relative">
        <Input
          ref={inputRef}
          id={fieldName}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(suggestions.length > 0 && value.length >= 2)}
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
            <Sparkles className="h-4 w-4 text-blue-500" />
          </div>
        )}
      </div>

      {/* Mensaje de validación */}
      {validationMessage && (
        <p className="text-xs text-red-600">{validationMessage}</p>
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
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-hidden shadow-lg border-2 border-blue-100">
          <CardContent className="p-0">
            <div ref={listRef} className="max-h-80 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={suggestion.id}
                  type="button"
                  variant="ghost"
                  className={`w-full text-left justify-start h-auto p-3 rounded-none border-b last:border-b-0 ${
                    index === selectedIndex 
                      ? 'bg-blue-50 border-l-2 border-l-blue-500' 
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
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                      </div>
                    </div>
                    
                    {index === selectedIndex && (
                      <Check className="h-4 w-4 text-blue-500 mt-1" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ayuda contextual */}
      {showHelp && value.length === 0 && (
        <p className="text-xs text-muted-foreground">
          {type === 'direccion' && 'Escribe una dirección y obtén sugerencias inteligentes'}
          {type === 'mercancia' && 'Describe tu mercancía para clasificación automática'}
          {type === 'vehiculo' && 'Ingresa marca, modelo o placa del vehículo'}
          {type === 'conductor' && 'Nombre o RFC del conductor'}
        </p>
      )}

      {/* Indicador de aprendizaje */}
      {suggestions.some(s => s.source === 'frecuente') && value.length >= 2 && (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <Star className="h-3 w-3" />
          <span>El sistema aprendió de tus preferencias</span>
        </div>
      )}
    </div>
  );
}
