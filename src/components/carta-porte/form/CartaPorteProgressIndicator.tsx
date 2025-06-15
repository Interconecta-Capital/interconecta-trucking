
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Clock, Info } from 'lucide-react';

interface ValidationSummary {
  isComplete: boolean;
  completionPercentage: number;
  sectionStatus: {
    configuracion: 'complete' | 'partial' | 'empty';
    ubicaciones: 'complete' | 'partial' | 'empty';
    mercancias: 'complete' | 'partial' | 'empty';
    autotransporte: 'complete' | 'partial' | 'empty';
    figuras: 'complete' | 'partial' | 'empty';
  };
  nextRequiredAction: string;
  criticalErrors: string[];
  warnings: string[];
}

interface CartaPorteProgressIndicatorProps {
  validationSummary: ValidationSummary;
  currentStep: number;
  onStepClick?: (step: number) => void;
}

const stepNames = [
  'Configuración',
  'Ubicaciones',
  'Mercancías',
  'Autotransporte',
  'Figuras',
  'XML'
];

export function CartaPorteProgressIndicator({ 
  validationSummary, 
  currentStep, 
  onStepClick 
}: CartaPorteProgressIndicatorProps) {
  const getStepIcon = (stepIndex: number, sectionKey?: keyof ValidationSummary['sectionStatus']) => {
    if (stepIndex === 5) { // XML step
      return validationSummary.isComplete ? (
        <CheckCircle className="h-4 w-4 text-green-600" />
      ) : (
        <Clock className="h-4 w-4 text-gray-400" />
      );
    }

    if (!sectionKey) return <Clock className="h-4 w-4 text-gray-400" />;

    const status = validationSummary.sectionStatus[sectionKey];
    
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepBadgeVariant = (stepIndex: number, sectionKey?: keyof ValidationSummary['sectionStatus']) => {
    if (stepIndex === currentStep) return 'default';
    
    if (stepIndex === 5) { // XML step
      return validationSummary.isComplete ? 'success' : 'secondary';
    }

    if (!sectionKey) return 'secondary';

    const status = validationSummary.sectionStatus[sectionKey];
    
    switch (status) {
      case 'complete':
        return 'success';
      case 'partial':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const sectionKeys: (keyof ValidationSummary['sectionStatus'])[] = [
    'configuracion',
    'ubicaciones', 
    'mercancias',
    'autotransporte',
    'figuras'
  ];

  return (
    <div className="space-y-4">
      {/* Barra de progreso principal */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700">
            Progreso del formulario
          </h3>
          <span className="text-sm text-gray-500">
            {validationSummary.completionPercentage}% completado
          </span>
        </div>
        <Progress 
          value={validationSummary.completionPercentage} 
          className="h-2"
        />
      </div>

      {/* Indicadores de pasos */}
      <div className="grid grid-cols-6 gap-2">
        {stepNames.map((name, index) => {
          const sectionKey = index < 5 ? sectionKeys[index] : undefined;
          const isClickable = onStepClick && (
            index <= currentStep || 
            (sectionKey && validationSummary.sectionStatus[sectionKey] !== 'empty')
          );
          
          return (
            <div 
              key={index}
              className={`
                flex flex-col items-center space-y-1 p-2 rounded-lg border transition-colors
                ${isClickable ? 'cursor-pointer hover:bg-gray-50' : 'cursor-not-allowed'}
                ${index === currentStep ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}
              `}
              onClick={() => isClickable && onStepClick?.(index)}
            >
              <div className="flex items-center space-x-1">
                {getStepIcon(index, sectionKey)}
                <Badge 
                  variant={getStepBadgeVariant(index, sectionKey) as any}
                  className="text-xs"
                >
                  {index + 1}
                </Badge>
              </div>
              <span className="text-xs text-center text-gray-600 leading-tight">
                {name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Próxima acción requerida */}
      {!validationSummary.isComplete && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Siguiente paso:</strong> {validationSummary.nextRequiredAction}
          </AlertDescription>
        </Alert>
      )}

      {/* Errores críticos */}
      {validationSummary.criticalErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Errores que requieren atención:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {validationSummary.criticalErrors.slice(0, 3).map((error, index) => (
                <li key={index} className="text-sm">{error}</li>
              ))}
              {validationSummary.criticalErrors.length > 3 && (
                <li className="text-sm text-gray-600">
                  +{validationSummary.criticalErrors.length - 3} más...
                </li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Advertencias */}
      {validationSummary.warnings.length > 0 && validationSummary.criticalErrors.length === 0 && (
        <Alert variant="default">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Recomendaciones:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              {validationSummary.warnings.slice(0, 2).map((warning, index) => (
                <li key={index} className="text-sm">{warning}</li>
              ))}
              {validationSummary.warnings.length > 2 && (
                <li className="text-sm text-gray-600">
                  +{validationSummary.warnings.length - 2} más...
                </li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
