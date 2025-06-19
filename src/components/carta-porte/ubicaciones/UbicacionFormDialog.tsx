
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UbicacionCompleta } from '@/types/cartaPorte';

interface UbicacionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ubicacion: UbicacionCompleta | null;
  onSave: (ubicacion: UbicacionCompleta) => void;
  existingUbicaciones: UbicacionCompleta[];
}

export function UbicacionFormDialog({
  open,
  onOpenChange,
  ubicacion,
  onSave,
  existingUbicaciones
}: UbicacionFormDialogProps) {
  const handleSave = (data: UbicacionCompleta) => {
    onSave(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {ubicacion ? 'Editar Ubicación' : 'Agregar Nueva Ubicación'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-4">
          {/* Aquí iría el formulario de ubicación */}
          <p>Formulario de ubicación en desarrollo...</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
