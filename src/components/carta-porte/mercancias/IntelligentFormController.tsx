
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, AlertCircle } from 'lucide-react';
import { MercanciaCompleta } from '@/types/cartaPorte';
import { useSmartMercanciaForm } from '@/hooks/ai/useSmartMercanciaForm';
import { SmartConditionalFields } from './SmartConditionalFields';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface IntelligentFormControllerProps {
  mercancia: MercanciaCompleta;
  onChange: (mercancia: MercanciaCompleta) => void;
  children: React.ReactNode;
}

interface SmartState {
  isDynamic: boolean;
  showSemarnatFields: boolean;
  showMaterialPeligrosoFields: boolean;
  showRefrigeracionFields: boolean;
  showEspecializadoFields: boolean;
  aiSuggestions: string[];
}

export function IntelligentFormController({
  mercancia,
  onChange,
  children
}: IntelligentFormControllerProps) {
  const { isProcessing, suggestions, classifyMercancia } = useSmartMercanciaForm();
  const [aiAnalysisActive, setAiAnalysisActive] = useState(false);
  const [smartState, setSmartState] = useState<SmartState>({
    isDynamic: false,
    showSemarnatFields: false,
    showMaterialPeligrosoFields: false,
    showRefrigeracionFields: false,
    showEspecializadoFields: false,
    aiSuggestions: []
  });

  // Detectar cambios en la descripción para activar análisis IA
  useEffect(() => {
    if (mercancia.descripcion && mercancia.descripcion.length > 3) {
      setAiAnalysisActive(true);
      setSmartState(prev => ({
        ...prev,
        isDynamic: true,
        showMaterialPeligrosoFields: mercancia.material_peligroso || false,
        aiSuggestions: suggestions
      }));
    }
  }, [mercancia.descripcion, mercancia.material_peligroso, suggestions]);

  const handleFieldChange = (field: keyof MercanciaCompleta, value: any) => {
    onChange({
      ...mercancia,
      [field]: value
    });
  };

  const hasConditionalFields = smartState.showSemarnatFields || 
                              smartState.showMaterialPeligrosoFields || 
                              smartState.showRefrigeracionFields || 
                              smartState.showEspecializadoFields;

  return (
    <div className="space-y-6">
      {/* Formulario base */}
      {children}

      {/* Indicador de análisis IA */}
      {aiAnalysisActive && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Brain className="h-4 w-4 text-blue-600" />
              Sistema Inteligente Activo
              <Badge variant="outline" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                IA v2.0
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-sm text-blue-700">
              {smartState.isDynamic ? (
                "🔍 Analizando mercancía y adaptando formulario automáticamente..."
              ) : (
                "✅ Análisis completado. Formulario optimizado para tu mercancía."
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campos condicionales inteligentes */}
      {hasConditionalFields && (
        <div className="space-y-4">
          <Card className="border-green-200 bg-green-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <Sparkles className="h-5 w-5" />
                Campos Adicionales Detectados por IA
                <Badge variant="outline">Automático</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-sm text-green-700 mb-4">
                El sistema detectó que tu mercancía requiere información adicional específica.
              </div>
            </CardContent>
          </Card>

          <SmartConditionalFields
            mercancia={mercancia}
            onChange={handleFieldChange}
            showSemarnatFields={smartState.showSemarnatFields}
            showMaterialPeligrosoFields={smartState.showMaterialPeligrosoFields}
            showRefrigeracionFields={smartState.showRefrigeracionFields}
            showEspecializadoFields={smartState.showEspecializadoFields}
          />
        </div>
      )}

      {/* Sugerencias de IA */}
      {smartState.aiSuggestions.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium text-blue-800">Sugerencias del sistema:</div>
              {smartState.aiSuggestions.map((suggestion, index) => (
                <div key={index} className="text-sm text-blue-700">• {suggestion}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
