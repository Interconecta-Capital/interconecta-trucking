import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, XCircle } from 'lucide-react';

interface ValidationError {
  field: string;
  message: string;
  required?: boolean;
}

interface TimbradoValidationErrorsProps {
  errors: ValidationError[];
  satError?: {
    codigo?: string;
    message?: string;
    messageDetail?: string;
  };
}

export function TimbradoValidationErrors({ errors, satError }: TimbradoValidationErrorsProps) {
  if (errors.length === 0 && !satError) return null;

  return (
    <div className="space-y-3">
      {/* Errores de validación previa */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Errores de Validación</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              <p className="text-sm font-medium">
                Corrije los siguientes campos antes de timbrar:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm">
                    <span className="font-medium">{error.field}:</span> {error.message}
                  </li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Error del SAT */}
      {satError && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error del SAT</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-2">
              {satError.codigo && (
                <p className="text-sm">
                  <span className="font-medium">Código:</span> {satError.codigo}
                </p>
              )}
              {satError.message && (
                <p className="text-sm">
                  <span className="font-medium">Mensaje:</span> {satError.message}
                </p>
              )}
              {satError.messageDetail && (
                <div className="mt-2 p-3 bg-destructive/10 rounded-md">
                  <p className="text-xs font-mono">{satError.messageDetail}</p>
                </div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
