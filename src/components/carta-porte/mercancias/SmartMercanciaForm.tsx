import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, AlertCircle } from 'lucide-react';
import { MercanciaCompleta } from '@/types/cartaPorte';
import { AIContextData } from '@/types/ai';
import { useSmartMercanciaForm } from '@/hooks/ai/useSmartMercanciaForm';

interface SmartMercanciaFormProps {
  mercancia: MercanciaCompleta;
  onChange: (mercancia: MercanciaCompleta) => void;
  children: React.ReactNode;
}

export function SmartMercanciaForm({
  mercancia,
  onChange,
  children
}: SmartMercanciaFormProps) {
  const { isProcessing, suggestions, classifyMercancia } = useSmartMercanciaForm();
  const [aiContext, setAiContext] = useState<AIContextData>({
    tipo: 'mercancia',
    datos: mercancia,
    sugerencias: [],
    confidence: 0
  });

  useEffect(() => {
    classifyMercancia(mercancia);
  }, [classifyMercancia, mercancia]);

  return (
    <div className="space-y-6">
      {children}

      {/* AI Context Display */}
      {aiContext.sugerencias && aiContext.sugerencias.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-blue-800">
              <Brain className="h-4 w-4" />
              Asistente IA
              <Badge variant="outline" className="text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                Confianza: {Math.round((aiContext.confidence || 0) * 100)}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {aiContext.sugerencias.map((sugerencia, index) => (
                <div key={index} className="text-sm text-blue-700">
                  • {sugerencia}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
