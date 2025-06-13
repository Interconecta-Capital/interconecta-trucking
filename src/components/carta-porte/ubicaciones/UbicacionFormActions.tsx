
import React from 'react';
import { Button } from '@/components/ui/button';

interface UbicacionFormActionsProps {
  ubicacion?: any;
  isFormValid: boolean;
  onCancel: () => void;
}

export function UbicacionFormActions({
  ubicacion,
  isFormValid,
  onCancel
}: UbicacionFormActionsProps) {
  return (
    <div className="flex justify-end space-x-4">
      <Button type="button" variant="outline" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" disabled={!isFormValid}>
        {ubicacion ? 'Actualizar' : 'Agregar'} Ubicación
      </Button>
    </div>
  );
}
