
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useConductores } from '@/hooks/useConductores';
import { ConductorBasicFields } from './ConductorBasicFields';
import { ConductorLicenciaFields } from './ConductorLicenciaFields';
import { ConductorSCTFields } from './ConductorSCTFields';
import { ConductorDireccionFields } from './ConductorDireccionFields';
import { ConductorVehiculoAsignacionFields } from './ConductorVehiculoAsignacionFields';
import { ConductorDocumentosFields } from './ConductorDocumentosFields';
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
  
  const { conductores, createConductor, updateConductor } = useConductores();
  const { handleSubmit, formState: { errors } } = useForm();

  // Load existing conductor data if editing
  React.useEffect(() => {
    if (conductorId && conductores.length > 0) {
      const conductor = conductores.find(c => c.id === conductorId);
      if (conductor) {
        setFormData(conductor);
      }
    }
  }, [conductorId, conductores]);

  const steps = [
    {
      id: 'basic',
      title: 'Información Personal',
      description: 'Datos básicos y foto del conductor'
    },
    {
      id: 'address',
      title: 'Dirección',
      description: 'Dirección completa del conductor'
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
    },
    {
      id: 'vehiculo',
      title: 'Asignación',
      description: 'Vehículo y remolque asignado'
    },
    {
      id: 'documentos',
      title: 'Documentos',
      description: 'Documentos requeridos del conductor'
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
      case 1: // Address
        // Optional validation for address
        break;
      case 2: // License info
        // Optional validation for license
        break;
      case 3: // SCT info
        // Optional validation for SCT
        break;
      case 4: // Vehicle assignment
        // Optional validation for vehicle assignment
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
      // Prepare data for submission (excluding preview fields)
      const submitData = { ...formData };
      delete submitData.foto_preview;
      delete submitData.foto_file;

      if (conductorId) {
        await updateConductor({ id: conductorId, data: submitData });
        toast.success('Conductor actualizado exitosamente');
      } else {
        await createConductor(submitData);
        toast.success('Conductor creado exitosamente');
      }
      onSuccess?.();
    } catch (error: any) {
      toast.error('Error al guardar conductor: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Convert react-hook-form errors to simple string format
  const getFieldErrors = () => {
    const fieldErrors: Record<string, string> = {};
    Object.keys(errors).forEach(key => {
      const error = errors[key];
      if (error && typeof error.message === 'string') {
        fieldErrors[key] = error.message;
      }
    });
    return fieldErrors;
  };

  const renderStepContent = () => {
    const fieldErrors = getFieldErrors();
    
    switch (currentStep) {
      case 0:
        return (
          <ConductorBasicFields
            formData={formData}
            onFieldChange={handleFieldChange}
            errors={fieldErrors}
          />
        );
      case 1:
        return (
          <ConductorDireccionFields
            formData={formData}
            onFieldChange={handleFieldChange}
            errors={fieldErrors}
          />
        );
      case 2:
        return (
          <ConductorLicenciaFields
            formData={formData}
            onFieldChange={handleFieldChange}
            errors={fieldErrors}
          />
        );
      case 3:
        return (
          <ConductorSCTFields
            formData={formData}
            onFieldChange={handleFieldChange}
          />
        );
      case 4:
        return (
          <ConductorVehiculoAsignacionFields
            formData={formData}
            onFieldChange={handleFieldChange}
          />
        );
      case 5:
        return (
          <ConductorDocumentosFields
            conductorId={conductorId}
            onDocumentosChange={(docs) => console.log('Documentos actualizados:', docs)}
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
