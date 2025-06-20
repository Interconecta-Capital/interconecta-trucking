
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { VehiculoFormRefactored } from './forms/VehiculoFormRefactored';
import { Truck, Lock } from 'lucide-react';
import { useEnhancedPermissions } from '@/hooks/useEnhancedPermissions';
import { useTrialManager } from '@/hooks/useTrialManager';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VehiculoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehiculo?: any;
  onSuccess?: () => void;
}

export function VehiculoFormDialog({ open, onOpenChange, vehiculo, onSuccess }: VehiculoFormDialogProps) {
  const { isSuperuser, hasFullAccess } = useEnhancedPermissions();
  const { getContextualMessage, canPerformAction } = useTrialManager();

  console.log('🔍 VehiculoFormDialog Debug:', {
    open,
    isSuperuser,
    hasFullAccess,
    canPerformAction: canPerformAction('create')
  });

  // BLOQUEO TOTAL: Si no es superuser Y no tiene acceso completo, NO mostrar el modal
  if (!isSuperuser && !hasFullAccess) {
    console.log('❌ VehiculoFormDialog completely blocked - no access');
    return null;
  }

  // BLOQUEO ADICIONAL: Si no puede realizar acciones de creación, NO mostrar el modal
  if (!isSuperuser && !canPerformAction('create')) {
    console.log('❌ VehiculoFormDialog blocked - cannot perform create action');
    return null;
  }

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

        {/* VERIFICACIÓN FINAL: Mostrar alerta si por alguna razón no tiene acceso */}
        {!hasFullAccess && !isSuperuser ? (
          <div className="p-6">
            <Alert className="border-red-200 bg-red-50">
              <Lock className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {getContextualMessage()}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <VehiculoFormRefactored
            vehiculoId={vehiculo?.id}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
