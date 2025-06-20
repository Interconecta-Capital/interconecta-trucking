
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useConductores } from '@/hooks/useConductores';
import { ConductorBasicFields } from './forms/ConductorBasicFields';
import { ConductorLicenciaFields } from './forms/ConductorLicenciaFields';
import { ConductorSCTFields } from './forms/ConductorSCTFields';
import { ConductorContactFields } from './forms/ConductorContactFields';
import { FormStepper } from './forms/FormStepper';
import { toast } from 'sonner';
import { User, ChevronLeft, ChevronRight, Save } from 'lucide-react';

interface ConductorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conductor?: any;
  onSuccess?: () => void;
}

const steps = [
  { id: 'basica', title: 'Información Básica', description: 'Datos personales del conductor' },
  { id: 'licencia', title: 'Licencia', description: 'Información de conducir y médica' },
  { id: 'contacto', title: 'Contacto', description: 'Información de contacto y dirección' },
  { id: 'sct', title: 'SCT', description: 'Información del sistema de transporte' }
];

export function ConductorFormDialog({ 
  open, 
  onOpenChange, 
  conductor, 
  onSuccess 
}: ConductorFormDialogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(conductor || {
    nombre: '',
    rfc: '',
    curp: '',
    num_licencia: '',
    tipo_licencia: '',
    vigencia_licencia: '',
    telefono: '',
    email: '',
    direccion: {},
    operador_sct: false,
    residencia_fiscal: 'MEX',
    activo: true,
    estado: 'disponible'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { createConductor, updateConductor, loading } = useConductores();

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.nombre?.trim()) {
        newErrors.nombre = 'El nombre es requerido';
      }
      if (formData.rfc && formData.rfc.length < 12) {
        newErrors.rfc = 'RFC debe tener al menos 12 caracteres';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        handleSave();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSave = async () => {
    try {
      if (conductor) {
        await updateConductor(conductor.id, formData);
      } else {
        await createConductor(formData);
      }
      
      toast.success(conductor ? 'Conductor actualizado exitosamente' : 'Conductor creado exitosamente');
      onSuccess?.();
      onOpenChange(false);
      setCurrentStep(0);
    } catch (error) {
      toast.error('Error al guardar el conductor');
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
          <ConductorContactFields
            formData={formData}
            onFieldChange={handleFieldChange}
            errors={errors}
          />
        );
      case 3:
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {conductor ? 'Editar Conductor' : 'Nuevo Conductor'}
          </DialogTitle>
          <DialogDescription>
            {conductor ? 'Modifica los datos del conductor' : 'Ingresa los datos del nuevo conductor'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <FormStepper
            steps={steps}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
          />

          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleNext}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <Save className="h-4 w-4" />
                    {loading ? 'Guardando...' : (conductor ? 'Actualizar' : 'Crear Conductor')}
                  </>
                ) : (
                  <>
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
