
import React from 'react';
import { AutocompletedInput, Suggestion } from './AutocompletedInput';
import { useSmartAutocomplete } from '@/hooks/ai/useSmartAutocomplete';
import { useAIValidation } from '@/hooks/ai/useAIValidation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle, CheckCircle } from 'lucide-react';

interface SmartAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (address: any) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  field?: string;
  showValidation?: boolean;
}

export function SmartAddressInput({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Ingrese dirección...",
  disabled = false,
  className,
  field = 'direccion',
  showValidation = true
}: SmartAddressInputProps) {
  const {
    suggestions,
    loading,
    getSuggestions,
    selectSuggestion
  } = useSmartAutocomplete({
    tipo: 'direccion',
    minLength: 3,
    debounceMs: 500
  });

  const {
    autoValidateField,
    getFieldValidation,
    getFieldWarnings,
    isFieldValid
  } = useAIValidation({
    enabled: showValidation,
    autoValidate: true
  });

  const handleChange = (newValue: string) => {
    onChange(newValue);
    getSuggestions(newValue);
    
    if (showValidation && newValue.length > 5) {
      autoValidateField(field, { direccion: newValue }, 'direccion');
    }
  };

  const handleSuggestionSelect = (suggestion: Suggestion) => {
    const addressData = selectSuggestion(suggestion);
    onChange(suggestion.text);
    onAddressSelect?.(addressData);
  };

  const validation = getFieldValidation(field);
  const warnings = getFieldWarnings(field);
  const isValid = isFieldValid(field);

  return (
    <div className="space-y-2">
      <div className="relative">
        <AutocompletedInput
          value={value}
          onChange={handleChange}
          onSuggestionSelect={handleSuggestionSelect}
          suggestions={suggestions}
          loading={loading}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
          variant="address"
          showConfidence={true}
          minConfidence={0.6}
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

      {validation?.suggestions && validation.suggestions.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Sugerencias de IA:
          </p>
          {validation.suggestions.slice(0, 2).map((suggestion, index) => (
            <Alert key={index} className="py-2">
              <AlertDescription className="text-sm">
                <strong>{suggestion.field}:</strong> {suggestion.suggestion}
                <Badge variant="outline" className="ml-2 text-xs">
                  {Math.round(suggestion.confidence * 100)}%
                </Badge>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}
    </div>
  );
}
