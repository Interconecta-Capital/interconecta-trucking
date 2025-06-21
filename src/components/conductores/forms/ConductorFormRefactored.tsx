
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useConductores } from '@/hooks/useConductores';
import { ConductorBasicFields } from './ConductorBasicFields';
import { ConductorLicenciaFields } from './ConductorLicenciaFields';
import { ConductorSCTFields } from './ConductorSCTFields';
import { FormStepper } from './FormStepper';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import { useIsMobile } from '@/hooks/use-mobile';

interface ConductorFormRefactoredProps {
  conductorId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ConductorFormRefactored({ conductorId, onSuccess, onCancel }: ConductorFormRefactoredProps) {
  const isMobile = useIsMobile();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  
  const { createConductor, updateConductor, getConductorById } = useConductores();
  const { handleSubmit, formState: { errors } } = useForm();

  // Load existing conductor data if editing
  React.useEffect(() => {
    if (conductorId) {
      const loadConductor = async () => {
        try {
          const conductor = await getConductorById(conductorId);
          setFormData(conductor);
        } catch (error) {
          toast.error('Error al cargar datos del conductor');
        }
      };
      loadConductor();
    }
  }, [conductorId, getConductorById]);

  const steps = [
    {
      id: 'basic',
      title: 'Información Personal',
      description: 'Datos básicos del conductor'
    },
    {
      id: 'license',
      title: 'Licencia',
      description: 'Información de licencia de conducir'
    },
    {
      id: 'sct',
      title: 'Datos SCT',
      description: 'Información del Sistema de Transporte'
    }
  ];

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0: // Basic info
        if (!formData.nombre) {
          toast.error('El nombre es requerido');
          return false;
        }
        break;
      case 1: // License info
        // Optional validation for license
        break;
      case 2: // SCT info
        // Optional validation for SCT
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async () => {
    if (!validateCurrentStep()) return;

    setLoading(true);
    try {
      if (conductorId) {
        await updateConductor(conductorId, formData);
        toast.success('Conductor actualizado exitosamente');
      } else {
        await createConductor(formData);
        toast.success('Conductor creado exitosamente');
      }
      onSuccess?.();
    } catch (error: any) {
      toast.error('Error al guardar conductor: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ConductorBasicFields
            formData={formData}
            onFieldChange={handleFieldChange}
            errors={errors}
          />
        );
      case 1:
        return (
          <ConductorLicenciaFields
            formData={formData}
            onFieldChange={handleFieldChange}
            errors={errors}
          />
        );
      case 2:
        return (
          <ConductorSCTFields
            formData={formData}
            onFieldChange={handleFieldChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Stepper - Mobile optimized */}
      <div className={isMobile ? 'px-2' : ''}>
        <FormStepper
          steps={steps}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
        />
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="min-h-[400px]">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons - Mobile optimized */}
        <ResponsiveGrid 
          cols={{ default: 1, md: 3 }} 
          gap={{ default: 3, md: 4 }}
          className={`pt-6 border-t border-gray-10 ${isMobile ? 'space-y-3' : ''}`}
        >
          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                className={isMobile ? 'flex-1 h-12' : ''}
              >
                Anterior
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className={isMobile ? 'flex-1 h-12' : ''}
            >
              Cancelar
            </Button>
          </div>

          <div></div>

          <div className="flex gap-3 justify-end">
            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                onClick={handleNext}
                className={isMobile ? 'flex-1 h-12' : 'min-w-[120px]'}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                className={isMobile ? 'flex-1 h-12' : 'min-w-[120px]'}
              >
                {loading ? 'Guardando...' : (conductorId ? 'Actualizar' : 'Crear Conductor')}
              </Button>
            )}
          </div>
        </ResponsiveGrid>
      </form>
    </div>
  );
}
