
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles } from 'lucide-react';

export interface Suggestion {
  id: string;
  text: string;
  confidence: number;
  metadata?: any;
}

interface AutocompletedInputProps {
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect: (suggestion: Suggestion) => void;
  suggestions: Suggestion[];
  loading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  variant?: 'default' | 'mercancia' | 'direccion';
  showConfidence?: boolean;
  minConfidence?: number;
}

export function AutocompletedInput({
  value,
  onChange,
  onSuggestionSelect,
  suggestions,
  loading = false,
  placeholder,
  disabled = false,
  className,
  variant = 'default',
  showConfidence = false,
  minConfidence = 0.7
}: AutocompletedInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Filtrar sugerencias por confianza mínima
  const filteredSuggestions = suggestions.filter(s => s.confidence >= minConfidence);

  useEffect(() => {
    setShowSuggestions(filteredSuggestions.length > 0 && value.length > 2);
    setSelectedIndex(-1);
  }, [filteredSuggestions.length, value.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    onSuggestionSelect(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
          handleSuggestionClick(filteredSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const getSuggestionStyle = (suggestion: Suggestion) => {
    switch (variant) {
      case 'mercancia':
        return 'border-l-4 border-l-blue-400';
      case 'direccion':
        return 'border-l-4 border-l-green-400';
      default:
        return 'border-l-4 border-l-gray-400';
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(filteredSuggestions.length > 0 && value.length > 2)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          disabled={disabled}
          className={className}
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          </div>
        )}
        
        {!loading && filteredSuggestions.length > 0 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Sparkles className="h-4 w-4 text-purple-500" />
          </div>
        )}
      </div>

      {/* Dropdown de sugerencias */}
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`
                p-3 cursor-pointer transition-colors ${getSuggestionStyle(suggestion)}
                ${index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'}
                ${index === filteredSuggestions.length - 1 ? '' : 'border-b border-gray-100'}
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {suggestion.text}
                  </div>
                  
                  {suggestion.metadata?.displayInfo && (
                    <div className="text-xs text-gray-500 mt-1">
                      {suggestion.metadata.displayInfo}
                    </div>
                  )}
                </div>
                
                {showConfidence && (
                  <Badge 
                    variant="outline" 
                    className={`ml-2 text-xs ${
                      suggestion.confidence >= 0.9 
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : suggestion.confidence >= 0.8
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    {Math.round(suggestion.confidence * 100)}%
                  </Badge>
                )}
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="p-3 text-center text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
              Generando sugerencias con IA...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
