
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
  conductor?: any;
}

export function ConductorFormDialog({ open, onOpenChange, conductor }: ConductorFormDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
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
            {conductor ? 'Editar Conductor' : 'Nuevo Conductor'}
          </DialogTitle>
          <DialogDescription>
            {conductor ? 'Modifica los datos del conductor' : 'Ingresa los datos del nuevo conductor con información SAT completa'}
          </DialogDescription>
        </DialogHeader>

        <ConductorFormRefactored
          conductorId={conductor?.id}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
