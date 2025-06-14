
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FileText, MapPin, Package, Truck, Users, Stamp } from 'lucide-react';

interface Step {
  title: string;
  icon: React.ComponentType<any>;
}

interface CartaPorteProgressTrackerProps {
  currentStep: number;
  totalSteps: number;
}

const steps: Step[] = [
  { title: 'Configuración', icon: FileText },
  { title: 'Ubicaciones', icon: MapPin },
  { title: 'Mercancías', icon: Package },
  { title: 'Autotransporte', icon: Truck },
  { title: 'Figuras', icon: Users },
  { title: 'XML', icon: Stamp },
];

export function CartaPorteProgressTracker({ currentStep, totalSteps }: CartaPorteProgressTrackerProps) {
  const progressPercentage = Math.round((currentStep / (totalSteps - 1)) * 100);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span>Progreso del formulario</span>
        <span>{progressPercentage}%</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      
      {/* Steps navigation */}
      <div className="flex justify-center mt-6">
        <div className="flex space-x-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                index === currentStep
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : index < currentStep
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-gray-50 border-gray-200 text-gray-500'
              }`}
            >
              <step.icon className="h-4 w-4" />
              <span className="text-sm font-medium">{step.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
