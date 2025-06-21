
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';
import { ConductorBasicFields } from './forms/ConductorBasicFields';
import { ConductorLicenciaFields } from './forms/ConductorLicenciaFields';
import { ConductorContactFields } from './forms/ConductorContactFields';
import { ConductorSCTFields } from './forms/ConductorSCTFields';
import { useConductores } from '@/hooks/useConductores';
import { Conductor } from '@/types/cartaPorte';
import { toast } from 'sonner';
import { User } from 'lucide-react';

interface ConductorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conductor?: Conductor | null;
  onSuccess?: () => void;
}

export function ConductorFormDialog({
  open,
  onOpenChange,
  conductor,
  onSuccess
}: ConductorFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>(conductor || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { createConductor, updateConductor } = useConductores();

  const isEditing = !!conductor;

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nombre?.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isEditing) {
        await updateConductor(conductor.id, formData);
        toast.success('Conductor actualizado exitosamente');
      } else {
        await createConductor(formData);
        toast.success('Conductor creado exitosamente');
      }
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} conductor: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({});
      setErrors({});
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <SectionHeader
            title={isEditing ? 'Editar Conductor' : 'Nuevo Conductor'}
            description={isEditing ? 'Actualiza la información del conductor' : 'Registra un nuevo conductor en el sistema'}
            icon={User}
            className="border-0 pb-0"
          />
        </DialogHeader>

        <div className="space-y-6">
          <ConductorBasicFields
            formData={formData}
            onFieldChange={handleFieldChange}
            errors={errors}
          />

          <ConductorLicenciaFields
            formData={formData}
            onFieldChange={handleFieldChange}
            errors={errors}
          />

          <ConductorContactFields
            formData={formData}
            onFieldChange={handleFieldChange}
            errors={errors}
          />

          <ConductorSCTFields
            formData={formData}
            onFieldChange={handleFieldChange}
          />

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-20">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? 'Guardando...' : isEditing ? 'Actualizar Conductor' : 'Guardar Conductor'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
