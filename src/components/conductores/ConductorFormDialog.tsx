
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConductorFormRefactored } from './forms/ConductorFormRefactored';
import { User } from 'lucide-react';

interface ConductorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conductorId?: string;
  onSuccess?: () => void;
}

export function ConductorFormDialog({ open, onOpenChange, conductorId, onSuccess }: ConductorFormDialogProps) {
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
            <User className="h-5 w-5" />
            {conductorId ? 'Editar Conductor' : 'Nuevo Conductor'}
          </DialogTitle>
          <DialogDescription>
            {conductorId ? 'Modifica los datos del conductor' : 'Ingresa los datos del nuevo conductor'}
          </DialogDescription>
        </DialogHeader>

        <ConductorFormRefactored
          conductorId={conductorId}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
