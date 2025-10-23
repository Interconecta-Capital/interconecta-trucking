import React, { useState, useEffect } from 'react';
import { useGeminiAssistant } from '@/hooks/useGeminiAssistant';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, CheckCircle2, AlertTriangle, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface SATKeyDetectorProps {
  descripcionMercancia: string;
  onSuggestionApply?: (suggestion: SATSuggestion) => void;
  showApplyButton?: boolean;
}

interface SATSuggestion {
  claveBienesTransp: string;
  categoria: string;
  descripcionMejorada?: string;
  fraccionArancelaria?: string;
  confidence: number;
  materialesPeligrosos?: boolean;
  especieProtegida?: boolean;
}

// Diccionario expandido de productos SAT (más productos comunes)
const SAT_PRODUCTS_DICTIONARY: Record<string, SATSuggestion> = {
  // Construcción y materiales
  'varilla': {
    claveBienesTransp: '72142000',
    categoria: 'Barras de hierro o acero sin alear',
    confidence: 0.95
  },
  'acero': {
    claveBienesTransp: '72071200',
    categoria: 'Productos laminados planos de hierro o acero',
    confidence: 0.9
  },
  'block': {
    claveBienesTransp: '69100000',
    categoria: 'Bloques de construcción de cerámica',
    confidence: 0.9
  },
  'concreto': {
    claveBienesTransp: '68159100',
    categoria: 'Manufacturas de cemento, hormigón o piedra artificial',
    confidence: 0.9
  },
  'cemento': {
    claveBienesTransp: '25231000',
    categoria: 'Cemento portland',
    confidence: 0.95
  },
  'ladrillo': {
    claveBienesTransp: '69041000',
    categoria: 'Ladrillos de construcción',
    confidence: 0.9
  },
  
  // Alimentos y bebidas
  'maíz': {
    claveBienesTransp: '10059000',
    categoria: 'Maíz',
    fraccionArancelaria: '10059099',
    confidence: 0.95
  },
  'frijol': {
    claveBienesTransp: '07133300',
    categoria: 'Frijoles comunes secos desvainados',
    confidence: 0.9
  },
  'leche': {
    claveBienesTransp: '04011000',
    categoria: 'Leche y nata (crema), sin concentrar',
    confidence: 0.9
  },
  'carne': {
    claveBienesTransp: '02011000',
    categoria: 'Carne de animales de la especie bovina',
    confidence: 0.85
  },
  
  // Textiles y ropa
  'algodón': {
    claveBienesTransp: '52010000',
    categoria: 'Algodón sin cardar ni peinar',
    confidence: 0.9
  },
  'tela': {
    claveBienesTransp: '52081200',
    categoria: 'Tejidos de algodón',
    confidence: 0.8
  },
  
  // Químicos y petroquímicos
  'gasolina': {
    claveBienesTransp: '27101200',
    categoria: 'Gasolinas',
    materialesPeligrosos: true,
    confidence: 0.95
  },
  'diesel': {
    claveBienesTransp: '27101921',
    categoria: 'Gasóleo (diesel)',
    materialesPeligrosos: true,
    confidence: 0.95
  },
  
  // Electrónicos
  'computadora': {
    claveBienesTransp: '84713000',
    categoria: 'Máquinas automáticas para tratamiento o procesamiento de datos',
    confidence: 0.85
  },
  'celular': {
    claveBienesTransp: '85171200',
    categoria: 'Teléfonos para redes celulares',
    confidence: 0.9
  },
  
  // Automóviles y partes
  'automóvil': {
    claveBienesTransp: '87032300',
    categoria: 'Automóviles de turismo',
    confidence: 0.9
  },
  'llanta': {
    claveBienesTransp: '40111000',
    categoria: 'Neumáticos nuevos de caucho',
    confidence: 0.9
  },
  
  // Productos agrícolas adicionales
  'aguacate': {
    claveBienesTransp: '08044000',
    categoria: 'Aguacates frescos o secos',
    fraccionArancelaria: '08044000',
    confidence: 0.95
  },
  'limón': {
    claveBienesTransp: '08055000',
    categoria: 'Limones y limas, frescos o secos',
    confidence: 0.95
  },
  'trigo': {
    claveBienesTransp: '10011000',
    categoria: 'Trigo',
    confidence: 0.95
  },
  'arroz': {
    claveBienesTransp: '10061000',
    categoria: 'Arroz',
    confidence: 0.95
  },
  
  // Productos químicos adicionales
  'plástico': {
    claveBienesTransp: '39012000',
    categoria: 'Polietileno con densidad superior o igual a 0.94',
    confidence: 0.85
  },
  'pintura': {
    claveBienesTransp: '32091000',
    categoria: 'Pinturas y barnices a base de polímeros acrílicos',
    confidence: 0.85
  },
  
  // Materiales de construcción adicionales
  'grava': {
    claveBienesTransp: '25171000',
    categoria: 'Cantos, grava, piedras trituradas',
    confidence: 0.9
  },
  'arena': {
    claveBienesTransp: '25051000',
    categoria: 'Arenas silíceas y arenas cuarzosas',
    confidence: 0.9
  }
};

export function SATKeyDetector({ descripcionMercancia, onSuggestionApply, showApplyButton = true }: SATKeyDetectorProps) {
  const [suggestion, setSuggestion] = useState<SATSuggestion | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { improveDescription, suggestDescription } = useGeminiAssistant();

  useEffect(() => {
    if (descripcionMercancia && descripcionMercancia.length > 3) {
      analyzeMerchandise(descripcionMercancia);
    } else {
      setSuggestion(null);
    }
  }, [descripcionMercancia]);

  const analyzeMerchandise = async (descripcion: string) => {
    setIsAnalyzing(true);
    
    try {
      // Paso 1: Búsqueda en diccionario local (rápido) - SIN IA
      console.log('🔍 Buscando en catálogo SAT local...');
      const localSuggestion = findInDictionary(descripcion);
      
      if (localSuggestion && localSuggestion.confidence > 0.8) {
        console.log('✅ Clave SAT encontrada en catálogo local');
        setSuggestion(localSuggestion);
        setIsAnalyzing(false);
        return;
      }

      // Paso 2: Solo si no hay alta confianza, usar IA (más preciso pero más lento)
      console.log('🤖 Consultando IA para mejorar descripción...');
      const improvedDescription = await improveDescription(descripcion);
      
      if (improvedDescription) {
        console.log('✅ IA mejoró la descripción');
        // Buscar nuevamente con la descripción mejorada
        const enhancedSuggestion = findInDictionary(improvedDescription) || localSuggestion;
        
        if (enhancedSuggestion) {
          setSuggestion({
            ...enhancedSuggestion,
            descripcionMejorada: improvedDescription
          });
        }
      } else if (localSuggestion) {
        console.log('ℹ️ Usando resultado del catálogo local');
        setSuggestion(localSuggestion);
      }
      
    } catch (error) {
      console.error('Error analyzing merchandise:', error);
      // Fallback al diccionario local
      const localSuggestion = findInDictionary(descripcion);
      if (localSuggestion) {
        console.log('⚠️ Error en IA, usando catálogo local como fallback');
        setSuggestion(localSuggestion);
      }
    }
    
    setIsAnalyzing(false);
  };

  const findInDictionary = (text: string): SATSuggestion | null => {
    const cleanText = text.toLowerCase().trim();
    
    // Buscar coincidencias exactas primero
    for (const [key, value] of Object.entries(SAT_PRODUCTS_DICTIONARY)) {
      if (cleanText.includes(key)) {
        return value;
      }
    }
    
    // Buscar coincidencias parciales con palabras clave
    const keywords = cleanText.split(' ');
    for (const keyword of keywords) {
      if (keyword.length > 3) { // Solo palabras significativas
        for (const [key, value] of Object.entries(SAT_PRODUCTS_DICTIONARY)) {
          if (key.includes(keyword) || keyword.includes(key)) {
            return { ...value, confidence: value.confidence * 0.8 }; // Reducir confianza
          }
        }
      }
    }
    
    return null;
  };

  const handleApplySuggestion = () => {
    if (suggestion && onSuggestionApply) {
      onSuggestionApply(suggestion);
      toast.success('Sugerencia de clave SAT aplicada');
    }
  };

  const handleCopyKey = () => {
    if (suggestion) {
      navigator.clipboard.writeText(suggestion.claveBienesTransp);
      toast.success('Clave SAT copiada al portapapeles');
    }
  };

  if (!suggestion && !isAnalyzing) return null;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">
            {isAnalyzing ? '🔍 Buscando Clave SAT' : '✓ Clave SAT Encontrada'}
          </span>
        </div>

        {isAnalyzing ? (
          <div className="flex items-center gap-2 text-blue-700">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Buscando en catálogo SAT y consultando IA...</span>
          </div>
        ) : suggestion && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-800 font-mono">
                {suggestion.claveBienesTransp}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyKey}
                className="h-6 w-6 p-0"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
            
            <p className="text-sm text-blue-700">
              <strong>Categoría:</strong> {suggestion.categoria}
            </p>

            {suggestion.descripcionMejorada && (
              <div className="p-2 bg-blue-100 rounded text-sm">
                <strong>Descripción mejorada:</strong>
                <p className="text-blue-800 mt-1">{suggestion.descripcionMejorada}</p>
              </div>
            )}

            {suggestion.fraccionArancelaria && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-100 text-green-800">
                  Fracción: {suggestion.fraccionArancelaria}
                </Badge>
              </div>
            )}

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {suggestion.confidence > 0.9 ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                )}
                <span className="text-xs text-blue-600">
                  Confianza: {Math.round(suggestion.confidence * 100)}%
                </span>
              </div>
            </div>

            {/* Alertas especiales */}
            {suggestion.materialesPeligrosos && (
              <div className="p-2 bg-red-100 border border-red-200 rounded text-sm text-red-800">
                ⚠️ Material peligroso detectado - Requiere documentación especial
              </div>
            )}

            {suggestion.especieProtegida && (
              <div className="p-2 bg-amber-100 border border-amber-200 rounded text-sm text-amber-800">
                🦎 Especie protegida detectada - Requiere permisos SEMARNAT
              </div>
            )}

            {showApplyButton && onSuggestionApply && (
              <Button
                onClick={handleApplySuggestion}
                size="sm"
                className="w-full"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Aplicar Sugerencia
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}