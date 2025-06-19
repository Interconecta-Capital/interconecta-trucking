
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { UbicacionCompleta } from '@/types/cartaPorte';
import { UbicacionFormOptimizado } from './UbicacionFormOptimizado';

interface UbicacionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (ubicacion: UbicacionCompleta) => void;
  ubicacion?: UbicacionCompleta;
  mode: 'add' | 'edit';
}

export function UbicacionFormDialog({
  open,
  onOpenChange,
  onSave,
  ubicacion,
  mode
}: UbicacionFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultUbicacion: UbicacionCompleta = {
    id: crypto.randomUUID(),
    tipo_estacion: '',
    id_ubicacion: crypto.randomUUID(),
    tipo_ubicacion: 'Origen',
    rfc_remitente_destinatario: '',
    nombre_remitente_destinatario: '',
    fecha_hora_salida_llegada: '',
    distancia_recorrida: 0,
    domicilio: {
      calle: '',
      numero_exterior: '',
      numero_interior: '',
      colonia: '',
      localidad: '',
      municipio: '',
      estado: '',
      pais: 'MEX',
      codigo_postal: '',
      referencia: ''
    }
  };

  const [currentUbicacion, setCurrentUbicacion] = useState<UbicacionCompleta>(
    ubicacion || defaultUbicacion
  );

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      onSave(currentUbicacion);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving ubicacion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    if (!ubicacion) {
      setCurrentUbicacion(defaultUbicacion);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Agregar Nueva Ubicación' : 'Editar Ubicación'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <UbicacionFormOptimizado
            ubicacion={currentUbicacion}
            onChange={setCurrentUbicacion}
          />

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
