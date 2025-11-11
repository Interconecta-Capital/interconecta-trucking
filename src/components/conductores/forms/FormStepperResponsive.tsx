import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';

interface Step {
  id: string;
  title: string;
  description: string;
}

interface FormStepperProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
}

export function FormStepper({ steps, currentStep, onStepChange }: FormStepperProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <div className="w-full space-y-3">
        <Select 
          value={currentStep.toString()} 
          onValueChange={(value) => onStepChange(parseInt(value))}
        >
          <SelectTrigger className="w-full">
            <SelectValue>
              {`Paso ${currentStep + 1} de ${steps.length}: ${steps[currentStep].title}`}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {steps.map((step, index) => (
              <SelectItem key={step.id} value={index.toString()}>
                <div className="flex items-center gap-2">
                  {index < currentStep ? (
                    <Check className="h-4 w-4 text-blue-600" />
                  ) : index === currentStep ? (
                    <div className="h-4 w-4 rounded-full border-2 border-blue-600" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                  )}
                  <span>{`${index + 1}. ${step.title}`}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex items-center justify-between min-w-max">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                "flex items-center cursor-pointer",
                index <= currentStep ? "text-blue-600" : "text-gray-400"
              )}
              onClick={() => onStepChange(index)}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium",
                  index < currentStep
                    ? "border-blue-600 bg-blue-600 text-white"
                    : index === currentStep
                    ? "border-blue-600 bg-white text-blue-600"
                    : "border-gray-300 bg-white text-gray-400"
                )}
              >
                {index < currentStep ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <div className="text-sm font-medium whitespace-nowrap">{step.title}</div>
                <div className="text-xs text-gray-500 whitespace-nowrap">{step.description}</div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "mx-4 h-0.5 w-16 sm:w-24",
                  index < currentStep ? "bg-blue-600" : "bg-gray-300"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
