
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSocios } from '@/hooks/useSocios';
import { SocioFormRefactored } from './forms/SocioFormRefactored';
import { toast } from 'sonner';

interface SocioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  socio?: any;
  onSuccess?: () => void;
}

export function SocioFormDialog({ open, onOpenChange, socio, onSuccess }: SocioFormDialogProps) {
  const { crearSocio, actualizarSocio, isCreating, isUpdating } = useSocios();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!socio;
  const isLoading = isCreating || isUpdating || isSubmitting;

  const handleSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await actualizarSocio(socio.id, formData);
        toast.success('Socio actualizado exitosamente');
      } else {
        await crearSocio(formData);
        toast.success('Socio creado exitosamente');
      }
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar socio');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccess = () => {
    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Editar Socio: ${socio?.nombre_razon_social}` : 'Nuevo Socio Comercial'}
          </DialogTitle>
        </DialogHeader>

        <SocioFormRefactored
          socioId={socio?.id}
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
