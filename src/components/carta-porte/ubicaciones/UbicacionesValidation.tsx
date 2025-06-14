
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface UbicacionesValidationProps {
  validation: {
    esValido: boolean;
    errores: string[];
  };
  showForm: boolean;
}

export function UbicacionesValidation({ validation, showForm }: UbicacionesValidationProps) {
  if (showForm || validation.esValido) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        <div className="space-y-1">
          <p className="font-medium">Se requieren correcciones:</p>
          <ul className="list-disc list-inside">
            {validation.errores.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
}
