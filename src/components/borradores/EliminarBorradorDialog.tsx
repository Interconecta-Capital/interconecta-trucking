
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { BorradorCartaPorte } from '@/types/cartaPorteLifecycle';

interface EliminarBorradorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  borrador: BorradorCartaPorte | null;
  onConfirmar: () => void;
}

export function EliminarBorradorDialog({
  open,
  onOpenChange,
  borrador,
  onConfirmar
}: EliminarBorradorDialogProps) {
  if (!borrador) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar borrador?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. El borrador "{borrador.nombre_borrador}" 
            será eliminado permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirmar}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
