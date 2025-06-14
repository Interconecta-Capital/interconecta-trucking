
import { useMemo } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Brain, Save } from 'lucide-react';

interface CartaPorteHeaderProps {
  cartaPorteId?: string;
  cartaPorteVersion: string;
  hasAIEnhancements: boolean;
  showAIAlerts: boolean;
  onToggleAIAlerts: () => void;
  canSaveAsTemplate: boolean;
  onSaveTemplate: () => void;
  validationMode: string;
  overallScore: number;
  totalProgress: number;
  currentCartaPorteId?: string;
}

export function CartaPorteHeader({
  cartaPorteId,
  cartaPorteVersion,
  hasAIEnhancements,
  showAIAlerts,
  onToggleAIAlerts,
  canSaveAsTemplate,
  onSaveTemplate,
  validationMode,
  overallScore,
  totalProgress,
  currentCartaPorteId,
}: CartaPorteHeaderProps) {
  const getFormTitle = useMemo(() => {
    const version = cartaPorteVersion || '3.1';
    const baseTitle = cartaPorteId ? 'Editar Carta Porte' : 'Nueva Carta Porte';
    const aiIndicator = hasAIEnhancements ? '🧠' : '';
    return `${baseTitle} ${version} ${aiIndicator}`;
  }, [cartaPorteId, cartaPorteVersion, hasAIEnhancements]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">
            {getFormTitle}
            {currentCartaPorteId && (
              <span className="text-sm font-normal text-green-600 ml-2">
                ✓ Guardando automáticamente
              </span>
            )}
          </CardTitle>
          <div className="flex items-center space-x-4">
            {hasAIEnhancements && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onToggleAIAlerts}
                className="flex items-center space-x-2"
              >
                <Brain className="h-4 w-4" />
                <span>{showAIAlerts ? 'Ocultar' : 'Mostrar'} IA</span>
              </Button>
            )}
            {canSaveAsTemplate && (
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={onSaveTemplate}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Guardar como Plantilla</span>
              </Button>
            )}
            <div className="text-sm text-muted-foreground">
              Progreso: {validationMode === 'ai-enhanced' ? overallScore : Math.round(totalProgress)}%
            </div>
          </div>
        </div>
        <Progress 
          value={validationMode === 'ai-enhanced' ? overallScore : totalProgress} 
          className="w-full" 
        />
        {validationMode === 'ai-enhanced' && (
          <p className="text-xs text-purple-600 mt-1">
            ✨ Validación mejorada con IA activa
          </p>
        )}
      </CardHeader>
    </Card>
  );
}
