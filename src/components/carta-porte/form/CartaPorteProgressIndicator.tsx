
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, FileText, MapPin, Package, Truck, Users, Code } from 'lucide-react';
import type { ValidationSummary } from '@/hooks/carta-porte/useCartaPorteValidation';

interface CartaPorteProgressIndicatorProps {
  validationSummary: ValidationSummary;
  currentStep: number;
  onStepClick: (step: number) => void;
  xmlGenerado?: string | null;
}

const steps = [
  { 
    id: 0, 
    name: 'Configuración', 
    icon: FileText,
    key: 'configuracion' as keyof ValidationSummary['sectionStatus']
  },
  { 
    id: 1, 
    name: 'Ubicaciones', 
    icon: MapPin,
    key: 'ubicaciones' as keyof ValidationSummary['sectionStatus']
  },
  { 
    id: 2, 
    name: 'Mercancías', 
    icon: Package,
    key: 'mercancias' as keyof ValidationSummary['sectionStatus']
  },
  { 
    id: 3, 
    name: 'Autotransporte', 
    icon: Truck,
    key: 'autotransporte' as keyof ValidationSummary['sectionStatus']
  },
  { 
    id: 4, 
    name: 'Figuras', 
    icon: Users,
    key: 'figuras' as keyof ValidationSummary['sectionStatus']
  },
  { 
    id: 5, 
    name: 'XML', 
    icon: Code,
    key: 'xml' as keyof ValidationSummary['sectionStatus']
  }
];

export function CartaPorteProgressIndicator({ 
  validationSummary, 
  currentStep, 
  onStepClick,
  xmlGenerado 
}: CartaPorteProgressIndicatorProps) {
  
  const getStepStatus = (step: typeof steps[0]) => {
    // Para la sección XML, verificar si hay XML generado
    if (step.key === 'xml') {
      if (xmlGenerado) {
        return 'completed';
      } else {
        return 'pending';
      }
    }
    
    const sectionStatus = validationSummary.sectionStatus[step.key];
    
    if (step.id < currentStep) {
      return sectionStatus === 'complete' ? 'completed' : 'completed-warning';
    }
    
    if (step.id === currentStep) {
      return 'current';
    }
    
    return sectionStatus === 'empty' ? 'pending' : 'ready';
  };

  const getStepIcon = (step: typeof steps[0], status: string) => {
    const IconComponent = step.icon;
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'completed-warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'current':
        return <IconComponent className="h-5 w-5 text-blue-600" />;
      default:
        return <IconComponent className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completo</Badge>;
      case 'completed-warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Revisar</Badge>;
      case 'current':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Actual</Badge>;
      case 'ready':
        return <Badge variant="outline">Listo</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-500">Pendiente</Badge>;
    }
  };

  const canNavigateTo = (stepId: number) => {
    // Permitir navegación hacia atrás siempre
    if (stepId <= currentStep) return true;
    
    // Para avanzar, verificar que los pasos anteriores no estén vacíos
    for (let i = 0; i < stepId; i++) {
      const step = steps[i];
      if (step.key !== 'xml' && validationSummary.sectionStatus[step.key] === 'empty') {
        return false;
      }
    }
    
    return true;
  };

  const getNextStepMessage = () => {
    // Si todas las secciones principales están completas
    const mainSectionsComplete = steps.slice(0, 5).every(step => 
      validationSummary.sectionStatus[step.key] !== 'empty'
    );
    
    if (mainSectionsComplete && !xmlGenerado) {
      return 'Listo para generar XML';
    }
    
    if (xmlGenerado) {
      return 'Carta Porte lista para timbrar';
    }
    
    const currentStepData = steps[currentStep];
    const nextStepData = steps[currentStep + 1];
    
    if (!nextStepData) return null;
    
    const currentSectionStatus = validationSummary.sectionStatus[currentStepData.key];
    
    if (currentSectionStatus === 'empty') {
      switch (currentStepData.key) {
        case 'configuracion':
          return 'Complete los datos del emisor y receptor';
        case 'ubicaciones':
          return 'Agregue las ubicaciones de origen y destino';
        case 'mercancias':
          return 'Agregue al menos una mercancía';
        case 'autotransporte':
          return 'Complete los datos del vehículo';
        case 'figuras':
          return 'Agregue al menos una figura de transporte';
        default:
          return `Complete la sección ${currentStepData.name}`;
      }
    }
    
    return `Siguiente paso: ${nextStepData.name}`;
  };

  // Calcular progreso incluyendo XML
  const calculateProgress = () => {
    const completedSections = steps.filter(step => {
      if (step.key === 'xml') {
        return xmlGenerado ? 1 : 0;
      }
      return validationSummary.sectionStatus[step.key] === 'complete' ? 1 : 0;
    }).length;
    
    return Math.round((completedSections / steps.length) * 100);
  };

  return (
    <div className="w-full space-y-4">
      {/* Progress Bar */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step);
          const isClickable = canNavigateTo(step.id);
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center space-y-2">
                <button
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                    ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-50'}
                    ${status === 'completed' ? 'border-green-600 bg-green-50' : ''}
                    ${status === 'completed-warning' ? 'border-yellow-600 bg-yellow-50' : ''}
                    ${status === 'current' ? 'border-blue-600 bg-blue-50' : ''}
                    ${status === 'pending' || status === 'ready' ? 'border-gray-300 bg-gray-50' : ''}
                  `}
                >
                  {getStepIcon(step, status)}
                </button>
                
                <div className="text-center">
                  <div className={`text-sm font-medium ${
                    status === 'current' ? 'text-blue-900' : 
                    status === 'completed' ? 'text-green-900' :
                    status === 'completed-warning' ? 'text-yellow-900' :
                    'text-gray-600'
                  }`}>
                    {step.name}
                  </div>
                  {getStepBadge(status)}
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${
                  step.id < currentStep ? 'bg-green-300' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Next Step Message */}
      {getNextStepMessage() && (
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <Clock className="h-4 w-4" />
          <span>{getNextStepMessage()}</span>
        </div>
      )}

      {/* Progress Summary */}
      <div className="text-center text-sm text-gray-500">
        Progreso del formulario: {calculateProgress()}% completado
      </div>
    </div>
  );
}
