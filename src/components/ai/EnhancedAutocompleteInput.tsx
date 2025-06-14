
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Check, X, Sparkles, Brain, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { geminiCore, AISuggestion, AIContextData } from '@/services/ai/GeminiCoreService';
import { toast } from 'sonner';

interface EnhancedAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSuggestionSelect?: (suggestion: AISuggestion) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  type: 'address' | 'mercancia' | 'vehicle' | 'driver';
  label?: string;
  context?: AIContextData;
  showValidation?: boolean;
  showHelp?: boolean;
  formName?: string;
  fieldName?: string;
}

export function EnhancedAutocompleteInput({
  value,
  onChange,
  onSuggestionSelect,
  placeholder,
  disabled = false,
  className,
  type,
  label,
  context,
  showValidation = true,
  showHelp = true,
  formName = '',
  fieldName = ''
}: EnhancedAutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [validation, setValidation] = useState<any>(null);
  const [help, setHelp] = useState<any>(null);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Get suggestions with debouncing
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const newSuggestions = await geminiCore.getSmartSuggestions(value, type, context);
        setSuggestions(newSuggestions);
        setShowSuggestions(newSuggestions.length > 0);
      } catch (error) {
        console.error('Error getting suggestions:', error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, type, context]);

  // Validate data when value changes significantly
  useEffect(() => {
    if (showValidation && value.length > 3) {
      const validateData = async () => {
        try {
          // Map 'driver' type to 'vehicle' for validation since the service doesn't accept 'driver'
          const validationType = type === 'driver' ? 'vehicle' : type;
          const result = await geminiCore.validateData({ [fieldName]: value }, validationType, context);
          setValidation(result);
        } catch (error) {
          console.error('Error validating data:', error);
        }
      };
      
      const validationTimeout = setTimeout(validateData, 1000);
      return () => clearTimeout(validationTimeout);
    }
  }, [value, type, context, showValidation, fieldName]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSelectedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: AISuggestion) => {
    onChange(suggestion.text);
    onSuggestionSelect?.(suggestion);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    toast.success('Sugerencia de IA aplicada');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

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
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleGetHelp = async () => {
    if (!showHelp) return;
    
    try {
      const helpData = await geminiCore.getContextualHelp(formName, fieldName, value, context);
      setHelp(helpData);
      setShowHelpPanel(true);
    } catch (error) {
      toast.error('Error obteniendo ayuda');
    }
  };

  const getValidationIcon = () => {
    if (!validation) return null;
    
    if (validation.isValid) {
      return <Check className="h-4 w-4 text-green-500" />;
    }
    
    const criticalIssues = validation.issues?.filter(i => i.severity === 'critical') || [];
    if (criticalIssues.length > 0) {
      return <X className="h-4 w-4 text-red-500" />;
    }
    
    return <Sparkles className="h-4 w-4 text-amber-500" />;
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'address': return '📍';
      case 'mercancia': return '📦';
      case 'vehicle': return '🚛';
      case 'driver': return '👤';
      default: return '🤖';
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
          {showHelp && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleGetHelp}
              className="h-6 p-1"
            >
              <Lightbulb className="h-3 w-3" />
            </Button>
          )}
        </div>
      )}

      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'pr-20',
            validation && !validation.isValid && 'border-amber-400'
          )}
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
          {!loading && suggestions.length > 0 && (
            <Brain className="h-4 w-4 text-blue-500" />
          )}
          {showValidation && getValidationIcon()}
        </div>
      </div>

      {/* AI Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute z-50 w-full shadow-lg">
          <CardContent className="p-0">
            <div className="max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.id}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={cn(
                    'px-3 py-2 cursor-pointer border-b last:border-b-0 hover:bg-blue-50',
                    'flex items-center justify-between',
                    index === selectedIndex && 'bg-blue-100'
                  )}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <span>{getTypeIcon()}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {suggestion.text}
                      </div>
                      {suggestion.reasoning && (
                        <div className="text-xs text-gray-500 truncate">
                          {suggestion.reasoning}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      'text-xs ml-2',
                      suggestion.confidence > 0.8 ? 'bg-green-100 text-green-800' :
                      suggestion.confidence > 0.6 ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    )}
                  >
                    {Math.round(suggestion.confidence * 100)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Validation Messages */}
      {validation && validation.issues && validation.issues.length > 0 && (
        <div className="space-y-1">
          {validation.issues.slice(0, 2).map((issue, index) => (
            <div key={index} className={cn(
              'text-xs p-2 rounded',
              issue.severity === 'critical' ? 'bg-red-50 text-red-700' :
              issue.severity === 'high' ? 'bg-amber-50 text-amber-700' :
              'bg-blue-50 text-blue-700'
            )}>
              <strong>{issue.severity.toUpperCase()}:</strong> {issue.message}
              {issue.suggestion && (
                <div className="mt-1 font-medium">
                  Sugerencia: {issue.suggestion}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Auto-fixes */}
      {validation?.autoFixes && validation.autoFixes.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded p-2">
          <div className="text-xs font-medium text-green-800 mb-1">
            Correcciones automáticas disponibles:
          </div>
          {validation.autoFixes.map((fix, index) => (
            <Button
              key={index}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange(fix.suggestedValue)}
              className="text-xs mr-1 mb-1 h-6"
            >
              {fix.suggestedValue} ({Math.round(fix.confidence * 100)}%)
            </Button>
          ))}
        </div>
      )}

      {/* Help Panel */}
      {showHelpPanel && help && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-blue-800">Ayuda de IA</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowHelpPanel(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-blue-700 mb-2">{help.help}</p>
            {help.examples && help.examples.length > 0 && (
              <div className="mb-2">
                <div className="text-xs font-medium text-blue-800 mb-1">Ejemplos:</div>
                {help.examples.slice(0, 2).map((example, index) => (
                  <div key={index} className="text-xs text-blue-600 bg-white rounded px-2 py-1 mb-1">
                    {example}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
