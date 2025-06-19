
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock, FileText, MapPin, Package, Truck, Users, Code, ShieldCheck } from 'lucide-react';
import type { ValidationSummary } from '@/hooks/carta-porte/useCartaPorteValidation';

interface CartaPorteProgressIndicatorProps {
  validationSummary: ValidationSummary;
  currentStep: number;
  onStepClick: (step: number) => void;
  xmlGenerado?: string | null;
  xmlTimbrado?: string | null;
  datosTimbre?: any;
  configuracion?: any;
  ubicaciones?: any[];
  mercancias?: any[];
  autotransporte?: any;
  figuras?: any[];
}

const steps = [
  { 
    id: 0, 
    name: 'Configuración', 
    icon: FileText,
    key: 'configuracion' as const
  },
  { 
    id: 1, 
    name: 'Ubicaciones', 
    icon: MapPin,
    key: 'ubicaciones' as const
  },
  { 
    id: 2, 
    name: 'Autotransporte', 
    icon: Truck,
    key: 'autotransporte' as const
  },
  { 
    id: 3, 
    name: 'Mercancías', 
    icon: Package,
    key: 'mercancias' as const
  },
  { 
    id: 4, 
    name: 'Figuras', 
    icon: Users,
    key: 'figuras' as const
  },
  { 
    id: 5, 
    name: 'XML', 
    icon: Code,
    key: 'xml' as const
  },
  { 
    id: 6, 
    name: 'PDF Fiscal', 
    icon: ShieldCheck,
    key: 'pdf_fiscal' as const
  }
];

export function CartaPorteProgressIndicator({ 
  validationSummary, 
  currentStep, 
  onStepClick,
  xmlGenerado,
  xmlTimbrado,
  datosTimbre,
  configuracion,
  ubicaciones = [],
  mercancias = [],
  autotransporte,
  figuras = []
}: CartaPorteProgressIndicatorProps) {
  
  const validateSectionData = (stepKey: string) => {
    switch (stepKey) {
      case 'configuracion':
        return !!(
          configuracion?.rfcEmisor &&
          configuracion?.nombreEmisor &&
          configuracion?.rfcReceptor &&
          configuracion?.nombreReceptor &&
          configuracion?.uso_cfdi
        );
      
      case 'ubicaciones':
        const hasOrigen = ubicaciones.some(u => u.tipo_ubicacion === 'Origen');
        const hasDestino = ubicaciones.some(u => u.tipo_ubicacion === 'Destino');
        const ubicacionesCompletas = ubicaciones.every(u => 
          u.domicilio?.codigo_postal && 
          u.domicilio?.municipio && 
          u.domicilio?.calle
        );
        return hasOrigen && hasDestino && ubicacionesCompletas && ubicaciones.length >= 2;
      
      case 'autotransporte':
        return !!(
          autotransporte?.placa_vm &&
          autotransporte?.config_vehicular &&
          autotransporte?.perm_sct &&
          autotransporte?.asegura_resp_civil &&
          autotransporte?.poliza_resp_civil &&
          autotransporte?.peso_bruto_vehicular > 0
        );
      
      case 'mercancias':
        const mercanciasCompletas = mercancias.every(m => 
          m.descripcion && 
          m.bienes_transp && 
          m.clave_unidad && 
          m.cantidad > 0 && 
          m.peso_kg > 0
        );
        return mercancias.length > 0 && mercanciasCompletas;
      
      case 'figuras':
        const figurasCompletas = figuras.every(f => 
          f.tipo_figura && 
          f.nombre_figura && 
          f.rfc_figura
        );
        return figuras.length > 0 && figurasCompletas;
      
      case 'xml':
        return !!xmlGenerado;
      
      case 'pdf_fiscal':
        return !!(xmlTimbrado && datosTimbre?.uuid);
      
      default:
        return false;
    }
  };
  
  const getStepStatus = (step: typeof steps[0]) => {
    const isComplete = validateSectionData(step.key);
    
    if (step.id < currentStep) {
      return isComplete ? 'completed' : 'completed-warning';
    }
    
    if (step.id === currentStep) {
      return 'current';
    }
    
    return isComplete ? 'ready' : 'pending';
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
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Incompleto</Badge>;
      case 'current':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Actual</Badge>;
      case 'ready':
        return <Badge variant="outline">Listo</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-500">Pendiente</Badge>;
    }
  };

  const canNavigateTo = (stepId: number) => {
    if (stepId <= currentStep) return true;
    
    // Verificar que los pasos anteriores estén completos
    for (let i = 0; i < stepId; i++) {
      const step = steps[i];
      if (!validateSectionData(step.key)) {
        return false;
      }
    }
    
    return true;
  };

  const calculateProgress = () => {
    const completedSections = steps.filter(step => validateSectionData(step.key)).length;
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
            <div key={step.id} className="flex items-center">
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
            </div>
          );
        })}
      </div>

      {/* Progress Summary */}
      <div className="text-center text-sm text-gray-500">
        Progreso del formulario: {calculateProgress()}% completado
      </div>
    </div>
  );
}
