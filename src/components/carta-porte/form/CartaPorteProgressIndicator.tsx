
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, AlertCircle, FileText, Settings, MapPin, Package, Truck, Users } from 'lucide-react';
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

// CORREGIDO: Nombres e iconos mejorados
const stepNames = [
  { key: 'configuracion', label: 'Configuración', icon: Settings },
  { key: 'ubicaciones', label: 'Ubicaciones', icon: MapPin },
  { key: 'mercancias', label: 'Mercancías', icon: Package },
  { key: 'autotransporte', label: 'Autotransporte', icon: Truck },
  { key: 'figuras', label: 'Figuras', icon: Users },
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
    return stepNames[stepIndex].icon;
  };

  // CORREGIDO: Colores mejorados y más vibrantes
  const getStepColor = (stepIndex: number, status: string) => {
    if (stepIndex === currentStep) {
      return 'text-blue-700 bg-blue-100 border-blue-300 hover:bg-blue-150 shadow-md';
    } else if (status === 'complete') {
      return 'text-green-700 bg-green-100 border-green-300 hover:bg-green-150';
    } else if (status === 'incomplete') {
      return 'text-amber-700 bg-amber-100 border-amber-300 hover:bg-amber-150';
    }
    return 'text-gray-600 bg-white border-gray-300 hover:bg-gray-50';
  };

  // CORREGIDO: Calcular progreso con mejor lógica
  const calculateProgress = () => {
    const statuses = Object.values(validationSummary.sectionStatus);
    const completedSections = statuses.filter(s => s === 'complete').length;
    const incompleteSections = statuses.filter(s => s === 'incomplete').length;
    
    // Dar peso parcial a secciones incompletas
    const totalProgress = (completedSections * 100) + (incompleteSections * 50);
    return Math.round(totalProgress / statuses.length);
  };

  const progressPercentage = calculateProgress();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
      {/* CORREGIDO: Header mejorado */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Progreso de la Carta Porte
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Completa todas las secciones para generar el XML
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-blue-600">
            {progressPercentage}%
          </span>
          <p className="text-xs text-gray-500">Completado</p>
        </div>
      </div>

      {/* CORREGIDO: Barra de progreso con colores mejorados */}
      <div className="mb-6">
        <Progress 
          value={progressPercentage} 
          className="h-3 bg-gray-100"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Inicio</span>
          <span>XML Listo</span>
        </div>
      </div>

      {/* CORREGIDO: Steps con diseño mejorado */}
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
                "flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200",
                stepColorClass,
                isClickable 
                  ? "cursor-pointer shadow-sm hover:shadow-md transform hover:-translate-y-0.5" 
                  : "cursor-not-allowed opacity-75",
                "min-h-[90px] relative"
              )}
            >
              {/* CORREGIDO: Icono con mejor estilo */}
              <StepIcon className="w-6 h-6 mb-2 flex-shrink-0" />
              
              {/* CORREGIDO: Texto mejorado */}
              <span className="text-xs font-medium text-center leading-tight px-1">
                {step.label}
              </span>
              
              {/* CORREGIDO: Indicador de paso actual mejorado */}
              {index === currentStep && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                </div>
              )}
              
              {/* CORREGIDO: Badge de estado */}
              {status === 'complete' && index !== currentStep && (
                <div className="absolute -top-1 -right-1">
                  <CheckCircle className="w-4 h-4 text-green-600 bg-white rounded-full" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* CORREGIDO: Estadísticas mejoradas */}
      <div className="flex flex-wrap gap-6 mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-gray-700">
            {Object.values(validationSummary.sectionStatus).filter(s => s === 'complete').length} Completadas
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-gray-700">
            {Object.values(validationSummary.sectionStatus).filter(s => s === 'incomplete').length} En Progreso
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Circle className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            {Object.values(validationSummary.sectionStatus).filter(s => s === 'empty').length} Pendientes
          </span>
        </div>

        {xmlGenerado && (
          <div className="flex items-center gap-2 ml-auto">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              XML Generado ✓
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
