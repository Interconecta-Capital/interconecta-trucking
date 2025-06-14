
import React from 'react';
import { AutocompletedInput, Suggestion } from './AutocompletedInput';
import { useSmartAutocomplete } from '@/hooks/ai/useSmartAutocomplete';
import { useAIValidation } from '@/hooks/ai/useAIValidation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';

interface SmartMercanciaInputProps {
  value: string;
  onChange: (value: string) => void;
  onMercanciaSelect?: (mercancia: any) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  field?: string;
  showValidation?: boolean;
  showClaveProducto?: boolean;
}

export function SmartMercanciaInput({
  value,
  onChange,
  onMercanciaSelect,
  placeholder = "Describe la mercancía...",
  disabled = false,
  className,
  field = 'mercancia',
  showValidation = true,
  showClaveProducto = true
}: SmartMercanciaInputProps) {
  const {
    suggestions,
    loading,
    getSuggestions,
    selectSuggestion
  } = useSmartAutocomplete({
    tipo: 'mercancia',
    minLength: 3,
    debounceMs: 600
  });

  const {
    autoValidateField,
    getFieldValidation,
    getFieldWarnings,
    getFieldSuggestions,
    isFieldValid
  } = useAIValidation({
    enabled: showValidation,
    autoValidate: true,
    debounceMs: 1200
  });

  const handleChange = (newValue: string) => {
    onChange(newValue);
    getSuggestions(newValue);
    
    if (showValidation && newValue.length > 5) {
      autoValidateField(field, { descripcion: newValue }, 'mercancia');
    }
  };

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    const mercanciaData = selectSuggestion(suggestion);
    onChange(suggestion.text);
    onMercanciaSelect?.(mercanciaData);
  };

  const validation = getFieldValidation(field);
  const warnings = getFieldWarnings(field);
  const suggestions_ai = getFieldSuggestions(field);
  const isValid = isFieldValid(field);

  // Enriquecer sugerencias con información adicional
  const enrichedSuggestions = suggestions.map(s => ({
    ...s,
    metadata: {
      ...s.metadata,
      displayInfo: s.metadata?.claveProdServ ? 
        `${s.metadata.claveProdServ} - ${s.metadata.claveUnidad}` : 
        undefined
    }
  }));

  return (
    <div className="space-y-3">
      <div className="relative">
        <AutocompletedInput
          value={value}
          onChange={handleChange}
          onSuggestionSelect={handleSuggestionSelect}
          suggestions={enrichedSuggestions}
          loading={loading}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
          variant="mercancia"
          showConfidence={true}
          minConfidence={0.65}
        />
        
        {showValidation && validation && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            {isValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            )}
          </div>
        )}
      </div>

      {/* Información rápida de la mercancía seleccionada */}
      {enrichedSuggestions.length > 0 && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          {enrichedSuggestions.length} sugerencias de IA disponibles
        </div>
      )}

      {/* Validaciones y advertencias */}
      {showValidation && warnings.length > 0 && (
        <Alert variant={warnings.some(w => w.severity === 'critical') ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {warnings.map((warning, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Badge 
                    variant={warning.severity === 'critical' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {warning.severity}
                  </Badge>
                  <span className="text-sm">{warning.message}</span>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Sugerencias de mejora de IA */}
      {suggestions_ai && suggestions_ai.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Package className="h-3 w-3" />
            Sugerencias de mejora:
          </p>
          {suggestions_ai.slice(0, 2).map((suggestion, index) => (
            <Alert key={index} className="py-2 bg-blue-50 border-blue-200">
              <AlertDescription className="text-sm">
                <div className="flex items-center justify-between">
                  <span>
                    <strong>IA sugiere:</strong> {suggestion.suggestion}
                  </span>
                  <Badge variant="outline" className="text-xs bg-blue-100">
                    {Math.round(suggestion.confidence * 100)}%
                  </Badge>
                </div>
                {suggestion.reason && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {suggestion.reason}
                  </p>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Información de clave de producto si está disponible */}
      {showClaveProducto && validation?.autoFixes && validation.autoFixes.length > 0 && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm font-medium text-green-800 mb-2">
            Correcciones automáticas sugeridas:
          </p>
          {validation.autoFixes.map((fix, index) => (
            <div key={index} className="text-sm text-green-700">
              <strong>{fix.field}:</strong> {fix.description}
              <Badge variant="outline" className="ml-2 text-xs">
                {Math.round(fix.confidence * 100)}%
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
