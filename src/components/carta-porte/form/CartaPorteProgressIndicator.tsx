
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, AlertCircle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ValidationSummary {
  sectionStatus: {
    configuracion: 'empty' | 'incomplete' | 'complete';
    ubicaciones: 'empty' | 'incomplete' | 'complete';
    mercancias: 'empty' | 'incomplete' | 'complete';
    autotransporte: 'empty' | 'incomplete' | 'complete';
    figuras: 'empty' | 'incomplete' | 'complete';
    xml: 'empty' | 'incomplete' | 'complete';
  };
  totalErrors: number;
  totalWarnings: number;
  isFormComplete: boolean;
  completionPercentage: number;
}

interface CartaPorteProgressIndicatorProps {
  validationSummary: ValidationSummary;
  currentStep: number;
  onStepClick: (step: number) => void;
  xmlGenerado?: string | null;
}

const stepNames = [
  { key: 'configuracion', label: 'Configuración', icon: Circle },
  { key: 'ubicaciones', label: 'Ubicaciones', icon: Circle },
  { key: 'mercancias', label: 'Mercancías', icon: Circle },
  { key: 'autotransporte', label: 'Autotransporte', icon: Circle },
  { key: 'figuras', label: 'Figuras', icon: Circle },
  { key: 'xml', label: 'XML', icon: FileText }
];

export function CartaPorteProgressIndicator({
  validationSummary,
  currentStep,
  onStepClick,
  xmlGenerado
}: CartaPorteProgressIndicatorProps) {
  const getStepStatus = (stepIndex: number) => {
    const stepKey = stepNames[stepIndex].key as keyof typeof validationSummary.sectionStatus;
    
    // Caso especial para XML
    if (stepKey === 'xml') {
      return xmlGenerado ? 'complete' : 'empty';
    }
    
    return validationSummary.sectionStatus[stepKey];
  };

  const getStepIcon = (stepIndex: number, status: string) => {
    if (status === 'complete') {
      return CheckCircle;
    } else if (status === 'incomplete') {
      return AlertCircle;
    }
    return Circle;
  };

  const getStepColor = (stepIndex: number, status: string) => {
    if (stepIndex === currentStep) {
      return 'text-blue-600 bg-blue-50 border-blue-200';
    } else if (status === 'complete') {
      return 'text-green-600 bg-green-50 border-green-200';
    } else if (status === 'incomplete') {
      return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
    return 'text-gray-400 bg-gray-50 border-gray-200';
  };

  return (
    <div className="bg-white rounded-lg border p-4 mb-6 shadow-sm">
      {/* Header del progreso */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Progreso de la Carta Porte
        </h3>
        <span className="text-sm font-medium text-gray-600">
          {validationSummary.completionPercentage}% Completo
        </span>
      </div>

      {/* Barra de progreso */}
      <div className="mb-6">
        <Progress 
          value={validationSummary.completionPercentage} 
          className="h-2"
        />
      </div>

      {/* Steps responsivos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stepNames.map((step, index) => {
          const status = getStepStatus(index);
          const StepIcon = getStepIcon(index, status);
          const stepColorClass = getStepColor(index, status);
          const isClickable = index < 5; // XML no es clickeable

          return (
            <button
              key={step.key}
              onClick={() => isClickable && onStepClick(index)}
              disabled={!isClickable}
              className={cn(
                "flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200",
                stepColorClass,
                isClickable 
                  ? "hover:shadow-md cursor-pointer" 
                  : "cursor-not-allowed opacity-75",
                "min-h-[80px]"
              )}
            >
              <StepIcon className="w-6 h-6 mb-2 flex-shrink-0" />
              <span className="text-xs font-medium text-center leading-tight">
                {step.label}
              </span>
              {index === currentStep && (
                <div className="w-2 h-2 bg-current rounded-full mt-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* Estadísticas del formulario */}
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm text-gray-600">
            {Object.values(validationSummary.sectionStatus).filter(s => s === 'complete').length} Completadas
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-600" />
          <span className="text-sm text-gray-600">
            {Object.values(validationSummary.sectionStatus).filter(s => s === 'incomplete').length} Incompletas
          </span>
        </div>

        {validationSummary.totalErrors > 0 && (
          <div className="flex items-center gap-2">
            <Circle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-600">
              {validationSummary.totalErrors} Errores
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
