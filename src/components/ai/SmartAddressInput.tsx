
import React from 'react';
import { EnhancedAutocompleteInput } from './EnhancedAutocompleteInput';

interface Suggestion {
  id: string;
  text: string;
  metadata?: any;
}

interface SmartAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect?: (suggestion: any) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function SmartAddressInput({
  value,
  onChange,
  onSuggestionSelect,
  label,
  placeholder,
  className
}: SmartAddressInputProps) {
  const handleSuggestionSelect = (suggestion: Suggestion) => {
    const formattedSuggestion = {
      id: suggestion.id,
      text: suggestion.text,
      confidence: 0.8,
      source: 'ai' as const,
      metadata: suggestion.metadata
    };
    
    if (onSuggestionSelect) {
      onSuggestionSelect(formattedSuggestion.metadata);
    }
  };

  return (
    <EnhancedAutocompleteInput
      value={value}
      onChange={onChange}
      onSuggestionSelect={handleSuggestionSelect}
      type="direccion"
      label={label}
      placeholder={placeholder}
      className={className}
    />
  );
}
