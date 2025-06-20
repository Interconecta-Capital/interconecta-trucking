
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { VehiculoFormRefactored } from './forms/VehiculoFormRefactored';
import { Truck } from 'lucide-react';

interface VehiculoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehiculo?: any;
  onSuccess?: () => void;
}

export function VehiculoFormDialog({ open, onOpenChange, vehiculo, onSuccess }: VehiculoFormDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {vehiculo ? 'Editar Vehículo' : 'Nuevo Vehículo'}
          </DialogTitle>
          <DialogDescription>
            {vehiculo ? 'Modifica los datos del vehículo' : 'Ingresa los datos del nuevo vehículo con información SAT completa'}
          </DialogDescription>
        </DialogHeader>

        <VehiculoFormRefactored
          vehiculoId={vehiculo?.id}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
