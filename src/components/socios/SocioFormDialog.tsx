
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SocioFormRefactored } from './forms/SocioFormRefactored';
import { Building } from 'lucide-react';

interface SocioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  socio?: any;
}

export function SocioFormDialog({ open, onOpenChange, socio }: SocioFormDialogProps) {
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
            <Building className="h-5 w-5" />
            {socio ? 'Editar Socio' : 'Nuevo Socio'}
          </DialogTitle>
          <DialogDescription>
            {socio ? 'Modifica los datos del socio' : 'Ingresa los datos del nuevo socio comercial con información SAT completa'}
          </DialogDescription>
        </DialogHeader>

        <SocioFormRefactored
          socioId={socio?.id}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
