
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Check, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Suggestion {
  id: string;
  text: string;
  confidence: number;
  metadata?: any;
}

interface AutocompletedInputProps {
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect?: (suggestion: Suggestion) => void;
  suggestions: Suggestion[];
  loading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  showConfidence?: boolean;
  minConfidence?: number;
  className?: string;
  variant?: 'default' | 'address' | 'mercancia' | 'vehiculo';
}

export function AutocompletedInput({
  value,
  onChange,
  onSuggestionSelect,
  suggestions = [],
  loading = false,
  placeholder,
  disabled = false,
  showConfidence = true,
  minConfidence = 0.6,
  className,
  variant = 'default'
}: AutocompletedInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = suggestions.filter(s => s.confidence >= minConfidence);

  useEffect(() => {
    setSelectedIndex(-1);
    setShowSuggestions(filteredSuggestions.length > 0 && value.length > 0);
  }, [filteredSuggestions.length, value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    onChange(suggestion.text);
    onSuggestionSelect?.(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return;

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
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'address':
        return 'border-blue-200 focus:border-blue-400';
      case 'mercancia':
        return 'border-green-200 focus:border-green-400';
      case 'vehiculo':
        return 'border-purple-200 focus:border-purple-400';
      default:
        return '';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(filteredSuggestions.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(getVariantStyles(), className)}
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        
        {!loading && filteredSuggestions.length > 0 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Sparkles className="h-4 w-4 text-blue-500" />
          </div>
        )}
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto shadow-lg">
          <CardContent className="p-0">
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                ref={index === selectedIndex ? suggestionsRef : undefined}
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  'px-3 py-2 cursor-pointer border-b last:border-b-0 hover:bg-muted/50',
                  'flex items-center justify-between',
                  index === selectedIndex && 'bg-muted'
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {suggestion.text}
                  </div>
                  {suggestion.metadata?.description && (
                    <div className="text-xs text-muted-foreground truncate">
                      {suggestion.metadata.description}
                    </div>
                  )}
                </div>
                
                {showConfidence && (
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      'ml-2 text-xs',
                      getConfidenceColor(suggestion.confidence)
                    )}
                  >
                    {Math.round(suggestion.confidence * 100)}%
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
