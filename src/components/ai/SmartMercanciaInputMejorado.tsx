
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAIValidation } from '@/hooks/ai/useAIValidation';

interface SmartMercanciaInputMejoradoProps {
  value: string;
  onChange: (value: string) => void;
  onMercanciaSelect?: (mercanciaData: any) => void;
  placeholder?: string;
  field?: string;
  showValidation?: boolean;
  showClaveProducto?: boolean;
}

export function SmartMercanciaInputMejorado({
  value,
  onChange,
  onMercanciaSelect,
  placeholder = "Describe la mercancía...",
  field = "descripcion_mercancia",
  showValidation = false,
  showClaveProducto = false
}: SmartMercanciaInputMejoradoProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isGeneratingSuggestions, setIsGeneratingSuggestions] = useState(false);
  const [lastProcessedValue, setLastProcessedValue] = useState('');
  const debounceRef = useRef<NodeJS.Timeout>();

  const {
    autoValidateField,
    getFieldValidation,
    isFieldValid
  } = useAIValidation({
    enabled: showValidation,
    autoValidate: false, // Desactivar auto-validación para evitar bucles
    debounceMs: 1000
  });

  // Función para generar sugerencias con debounce y prevención de duplicados
  const generateSuggestions = async (inputValue: string) => {
    // Evitar procesar el mismo valor múltiples veces
    if (!inputValue.trim() || inputValue === lastProcessedValue || inputValue.length < 10) {
      return;
    }

    // Detectar patrones básicos sin IA para casos simples
    const basicPatterns = {
      peso: inputValue.match(/(\d+)\s*(ton|toneladas|kg|kilogramos)/i),
      producto: inputValue.toLowerCase(),
    };

    console.log('🤖 Generando sugerencias IA para:', inputValue.substring(0, 50) + '...');
    setIsGeneratingSuggestions(true);
    setLastProcessedValue(inputValue);

    try {
      // Simular análisis inteligente básico (sin llamadas externas por ahora)
      const newSuggestions = [];

      // Análisis de peso
      if (basicPatterns.peso) {
        const [, cantidad, unidad] = basicPatterns.peso;
        const pesoKg = unidad.toLowerCase().includes('ton') ? parseInt(cantidad) * 1000 : parseInt(cantidad);
        
        newSuggestions.push({
          tipo: 'peso',
          valor: pesoKg,
          texto: `${cantidad} ${unidad}`,
          aplicado: false
        });
      }

      // Análisis de producto básico
      if (basicPatterns.producto.includes('sandia') || basicPatterns.producto.includes('sandía')) {
        newSuggestions.push({
          tipo: 'clave_producto',
          valor: '10121800',
          texto: 'Frutas y verduras frescas',
          aplicado: false
        });
      }

      setSuggestions(newSuggestions);
      console.log('✅ Sugerencias IA generadas:', newSuggestions.length);

    } catch (error) {
      console.error('❌ Error generando sugerencias:', error);
    } finally {
      setIsGeneratingSuggestions(false);
    }
  };

  // Debounce effect para las sugerencias
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value && value.length >= 10) {
      debounceRef.current = setTimeout(() => {
        generateSuggestions(value);
      }, 1500); // Aumentar debounce para evitar llamadas múltiples
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value]);

  const validation = showValidation ? getFieldValidation(field) : null;
  const isValid = showValidation ? isFieldValid(field) : true;

  const applySuggestion = (suggestion: any) => {
    if (onMercanciaSelect) {
      onMercanciaSelect({
        [suggestion.tipo]: suggestion.valor,
        sugerencia_aplicada: suggestion.texto
      });
    }

    // Marcar como aplicada
    setSuggestions(prev => 
      prev.map(s => 
        s === suggestion ? { ...s, aplicado: true } : s
      )
    );
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`pr-10 ${
            showValidation 
              ? isValid 
                ? 'border-green-300 focus:border-green-500' 
                : 'border-red-300 focus:border-red-500'
              : ''
          }`}
        />
        
        {/* Indicador de IA */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isGeneratingSuggestions ? (
            <Loader2 className="h-4 w-4 animate-spin text-purple-500" />
          ) : suggestions.length > 0 ? (
            <Sparkles className="h-4 w-4 text-purple-500" />
          ) : showValidation && isValid ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : showValidation && !isValid ? (
            <AlertTriangle className="h-4 w-4 text-red-500" />
          ) : null}
        </div>
      </div>

      {/* Validación */}
      {showValidation && validation && !isValid && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-200">
          {validation.error}
        </div>
      )}

      {/* Sugerencias de IA */}
      {suggestions.length > 0 && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">
                Sugerencias Inteligentes
              </span>
            </div>
            
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                      {suggestion.tipo.replace('_', ' ')}
                    </Badge>
                    <span className="text-sm text-purple-700">
                      {suggestion.texto}
                    </span>
                  </div>
                  
                  {!suggestion.aplicado && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => applySuggestion(suggestion)}
                      className="text-purple-600 border-purple-300 hover:bg-purple-100"
                    >
                      Aplicar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clave de Producto SAT */}
      {showClaveProducto && value && (
        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
          <strong>Sugerencia de clave SAT:</strong> Se detectó producto agrícola - Considerar clave 10121800 para frutas y verduras frescas
        </div>
      )}
    </div>
  );
}
