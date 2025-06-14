
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface UbicacionesValidationProps {
  validacion: {
    esValido: boolean;
    mensaje: string;
  };
  distanciaTotal: number;
}

export function UbicacionesValidation({ validacion, distanciaTotal }: UbicacionesValidationProps) {
  return (
    <>
      {!validacion.esValido && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{validacion.mensaje}</AlertDescription>
        </Alert>
      )}

      {distanciaTotal > 0 && (
        <div className="text-sm text-muted-foreground">
          Distancia total estimada: <strong>{distanciaTotal.toFixed(2)} km</strong>
        </div>
      )}
    </>
  );
}
