
import { useState } from 'react';
import { ResponsiveDialog, ResponsiveDialogContent, ResponsiveDialogDescription, ResponsiveDialogHeader, ResponsiveDialogTitle } from '@/components/ui/responsive-dialog';
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
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {vehiculo ? 'Editar Vehículo' : 'Nuevo Vehículo'}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {vehiculo ? 'Modifica los datos del vehículo' : 'Ingresa los datos del nuevo vehículo con información SAT completa'}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <VehiculoFormRefactored
          vehiculoId={vehiculo?.id}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
