
import { useState } from 'react';
import { ResponsiveDialog, ResponsiveDialogContent, ResponsiveDialogDescription, ResponsiveDialogHeader, ResponsiveDialogTitle } from '@/components/ui/responsive-dialog';
import { ConductorFormRefactored } from './forms/ConductorFormRefactored';
import { User } from 'lucide-react';

interface ConductorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conductor?: any;
  onSuccess?: () => void;
}

export function ConductorFormDialog({ open, onOpenChange, conductor, onSuccess }: ConductorFormDialogProps) {
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
            <User className="h-5 w-5" />
            {conductor ? 'Editar Conductor' : 'Nuevo Conductor'}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {conductor ? 'Modifica los datos del conductor' : 'Ingresa los datos del nuevo conductor con información SCT completa'}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <ConductorFormRefactored
          conductorId={conductor?.id}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
