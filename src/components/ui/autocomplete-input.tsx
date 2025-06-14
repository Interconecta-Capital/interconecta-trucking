
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles, Check } from 'lucide-react';

interface Suggestion {
  id: string;
  text: string;
  confidence: number;
  metadata?: any;
}

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect?: (suggestion: Suggestion) => void;
  suggestions: Suggestion[];
  loading?: boolean;
  placeholder?: string;
  className?: string;
  showConfidence?: boolean;
  minConfidence?: number;
  disabled?: boolean;
}

export function AutocompleteInput({
  value,
  onChange,
  onSuggestionSelect,
  suggestions = [],
  loading = false,
  placeholder,
  className,
  showConfidence = true,
  minConfidence = 0.3,
  disabled = false
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filtrar sugerencias por confianza mínima
  const filteredSuggestions = suggestions.filter(s => s.confidence >= minConfidence);

  // Manejar teclas
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredSuggestions.length === 0) return;

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
        if (selectedIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Manejar click en sugerencia
  const handleSuggestionClick = (suggestion: Suggestion) => {
    onChange(suggestion.text);
    onSuggestionSelect?.(suggestion);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Abrir/cerrar lista según el focus y las sugerencias
  useEffect(() => {
    setIsOpen(filteredSuggestions.length > 0 && value.length > 0);
  }, [filteredSuggestions.length, value.length]);

  // Scroll a la sugerencia seleccionada
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const selectedElement = listRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(filteredSuggestions.length > 0 && value.length > 0)}
          placeholder={placeholder}
          className={className}
          disabled={disabled}
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {!loading && filteredSuggestions.length > 0 && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Sparkles className="h-4 w-4 text-blue-500" />
          </div>
        )}
      </div>

      {/* Lista de sugerencias */}
      {isOpen && filteredSuggestions.length > 0 && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-hidden shadow-lg">
          <CardContent className="p-0">
            <div ref={listRef} className="max-h-60 overflow-y-auto">
              {filteredSuggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  className={`px-4 py-2 cursor-pointer transition-colors ${
                    index === selectedIndex 
                      ? 'bg-blue-50 border-l-2 border-l-blue-500' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate flex-1">
                      {suggestion.text}
                    </span>
                    
                    <div className="flex items-center gap-2 ml-2">
                      {showConfidence && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getConfidenceColor(suggestion.confidence)}`}
                        >
                          {Math.round(suggestion.confidence * 100)}%
                        </Badge>
                      )}
                      
                      {index === selectedIndex && (
                        <Check className="h-3 w-3 text-blue-500" />
                      )}
                    </div>
                  </div>
                  
                  {suggestion.metadata?.descripcion && (
                    <p className="text-xs text-muted-foreground mt-1 truncate">
                      {suggestion.metadata.descripcion}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
