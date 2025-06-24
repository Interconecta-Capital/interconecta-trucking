
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, ExternalLink, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

interface WizardFlowControlsProps {
  onSaveDraft: () => void;
  onSaveAndExit: () => void;
  onFinalize: () => void;
  canFinalize: boolean;
  isSaving: boolean;
  isProcessing: boolean;
  currentStep: number;
  totalSteps: number;
}

export function WizardFlowControls({
  onSaveDraft,
  onSaveAndExit,
  onFinalize,
  canFinalize,
  isSaving,
  isProcessing,
  currentStep,
  totalSteps
}: WizardFlowControlsProps) {
  const isLastStep = currentStep === totalSteps;
  const isDisabled = isSaving || isProcessing;

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-between items-center pt-6 border-t">
      {/* Botones de guardado */}
      <div className="flex gap-2 order-2 sm:order-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSaveDraft}
          disabled={isDisabled}
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Guardar Borrador
        </Button>
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSaveAndExit}
          disabled={isDisabled}
          className="flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          Guardar y Salir
        </Button>
      </div>

      {/* Indicador de progreso y botón principal */}
      <div className="flex items-center gap-4 order-1 sm:order-2">
        {!isLastStep && (
          <span className="text-sm text-gray-600">
            Paso {currentStep} de {totalSteps}
          </span>
        )}
        
        <Button
          type="button"
          onClick={onFinalize}
          disabled={!canFinalize || isDisabled}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : isLastStep ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <ArrowRight className="h-4 w-4" />
          )}
          {isProcessing ? 'Procesando...' : isLastStep ? 'Finalizar y Emitir Documentos' : 'Siguiente Paso'}
        </Button>
      </div>
    </div>
  );
}
