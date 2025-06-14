
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  MapPin, 
  Package, 
  Truck, 
  Users, 
  FileText,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickStepNavigationProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  stepValidation?: Record<number, 'valid' | 'invalid' | 'pending'>;
  className?: string;
}

const stepConfig = [
  { 
    icon: Settings, 
    label: 'Configuración', 
    description: 'Datos básicos y tipo de CFDI',
    shortLabel: 'Config'
  },
  { 
    icon: MapPin, 
    label: 'Ubicaciones', 
    description: 'Origen y destino del traslado',
    shortLabel: 'Ubicaciones'
  },
  { 
    icon: Package, 
    label: 'Mercancías', 
    description: 'Productos a transportar',
    shortLabel: 'Mercancías'
  },
  { 
    icon: Truck, 
    label: 'Autotransporte', 
    description: 'Vehículo y remolques',
    shortLabel: 'Vehículo'
  },
  { 
    icon: Users, 
    label: 'Figuras', 
    description: 'Operador y participantes',
    shortLabel: 'Figuras'
  },
  { 
    icon: FileText, 
    label: 'XML y Timbrado', 
    description: 'Generar y timbrar documento',
    shortLabel: 'XML'
  }
];

const getValidationIcon = (status?: 'valid' | 'invalid' | 'pending') => {
  switch (status) {
    case 'valid':
      return <CheckCircle className="h-3 w-3 text-green-600" />;
    case 'invalid':
      return <AlertCircle className="h-3 w-3 text-red-600" />;
    case 'pending':
      return <Clock className="h-3 w-3 text-yellow-600" />;
    default:
      return null;
  }
};

export function QuickStepNavigation({ 
  currentStep, 
  onStepChange, 
  stepValidation = {},
  className 
}: QuickStepNavigationProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Navegación Rápida
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {stepConfig.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === index;
              const isPast = currentStep > index;
              const validationStatus = stepValidation[index];
              
              return (
                <Button
                  key={index}
                  variant={isActive ? "default" : isPast ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => onStepChange(index)}
                  className={cn(
                    "h-auto p-3 flex flex-col items-start gap-1 text-left",
                    isActive && "bg-blue-600 hover:bg-blue-700",
                    isPast && !isActive && "bg-green-50 border-green-200 hover:bg-green-100"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="text-xs font-medium">
                        {step.shortLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {validationStatus && getValidationIcon(validationStatus)}
                      <Badge 
                        variant={isActive ? "secondary" : "outline"} 
                        className={cn(
                          "text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center",
                          isActive && "bg-white text-blue-600",
                          isPast && "bg-green-600 text-white border-green-600"
                        )}
                      >
                        {index + 1}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-left leading-tight">
                    {step.description}
                  </p>
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
