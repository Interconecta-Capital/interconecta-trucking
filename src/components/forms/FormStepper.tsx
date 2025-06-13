
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  description: string;
}

interface FormStepperProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLoading?: boolean;
}

export function FormStepper({
  steps,
  currentStep,
  onStepChange,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  isLoading = false
}: FormStepperProps) {
  return (
    <div className="space-y-4">
      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
          >
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 cursor-pointer ${
                index === currentStep
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : index < currentStep
                  ? 'border-green-500 bg-green-500 text-white'
                  : 'border-gray-300 bg-white text-gray-500'
              }`}
              onClick={() => onStepChange(index)}
            >
              {index < currentStep ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-sm">{index + 1}</span>
              )}
            </div>
            
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 ${
                index < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Current step info */}
      <div className="text-center">
        <h3 className="text-lg font-semibold">{steps[currentStep]?.title}</h3>
        <p className="text-sm text-muted-foreground">{steps[currentStep]?.description}</p>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          disabled={!canGoPrevious || isLoading}
        >
          Anterior
        </Button>
        
        <Badge variant="outline">
          Paso {currentStep + 1} de {steps.length}
        </Badge>
        
        <Button
          type="button"
          onClick={onNext}
          disabled={!canGoNext || isLoading}
        >
          {currentStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
        </Button>
      </div>
    </div>
  );
}
