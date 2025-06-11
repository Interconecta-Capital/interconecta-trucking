
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGeminiAssistant, ValidationResult } from '@/hooks/useGeminiAssistant';
import { 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb,
  RefreshCw,
  Wand2
} from 'lucide-react';

interface AIAssistantProps {
  claveProducto: string;
  descripcionActual: string;
  cantidad?: number;
  claveUnidad?: string;
  peso?: number;
  valor?: number;
  onDescriptionUpdate: (newDescription: string) => void;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  claveProducto,
  descripcionActual,
  cantidad,
  claveUnidad,
  peso,
  valor,
  onDescriptionUpdate
}) => {
  const { isLoading, suggestDescription, validateMercancia, improveDescription } = useGeminiAssistant();
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  const handleSuggestDescription = async () => {
    const suggestion = await suggestDescription(claveProducto);
    if (suggestion) {
      onDescriptionUpdate(suggestion);
    }
  };

  const handleImproveDescription = async () => {
    if (!descripcionActual) return;
    
    const improvement = await improveDescription(descripcionActual, claveProducto);
    if (improvement) {
      onDescriptionUpdate(improvement);
    }
  };

  const handleValidate = async () => {
    if (!descripcionActual || !cantidad || !claveUnidad) return;

    const result = await validateMercancia({
      clave_producto: claveProducto,
      descripcion_actual: descripcionActual,
      cantidad: cantidad,
      unidad: claveUnidad,
      peso,
      valor
    });

    if (result) {
      setValidation(result);
      setShowValidation(true);
    }
  };

  const getValidationIcon = () => {
    if (!validation) return <AlertTriangle className="h-4 w-4" />;
    return validation.is_valid ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getValidationColor = () => {
    if (!validation) return 'secondary';
    return validation.is_valid ? 'default' : 'destructive';
  };

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span>Asistente IA - Gemini</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Botones de acción */}
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSuggestDescription}
            disabled={isLoading || !claveProducto}
            className="flex items-center space-x-1"
          >
            <Wand2 className="h-3 w-3" />
            <span>Generar Descripción</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleImproveDescription}
            disabled={isLoading || !descripcionActual || !claveProducto}
            className="flex items-center space-x-1"
          >
            <Lightbulb className="h-3 w-3" />
            <span>Mejorar</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleValidate}
            disabled={isLoading || !descripcionActual || !cantidad}
            className="flex items-center space-x-1"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Validar</span>
          </Button>
        </div>

        {/* Resultados de validación */}
        {showValidation && validation && (
          <div className="mt-3 space-y-2">
            <div className="flex items-center space-x-2">
              {getValidationIcon()}
              <span className="text-sm font-medium">
                Validación IA - Confianza: {Math.round(validation.confidence * 100)}%
              </span>
              <Badge variant={getValidationColor()}>
                {validation.is_valid ? 'Válida' : 'Revisar'}
              </Badge>
            </div>

            {validation.issues.length > 0 && (
              <div className="text-xs space-y-1">
                <p className="font-medium text-red-600">Problemas detectados:</p>
                <ul className="list-disc list-inside space-y-1 text-red-700">
                  {validation.issues.map((issue, index) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}

            {validation.suggestions.length > 0 && (
              <div className="text-xs space-y-1">
                <p className="font-medium text-blue-600">Sugerencias:</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  {validation.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Indicador de carga */}
        {isLoading && (
          <div className="flex items-center space-x-2 text-sm text-blue-600">
            <RefreshCw className="h-3 w-3 animate-spin" />
            <span>Procesando con IA...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
