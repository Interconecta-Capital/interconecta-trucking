
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface AutotransporteValidationProps {
  validationErrors: string[];
  isComplete: boolean;
}

export function AutotransporteValidation({ validationErrors, isComplete }: AutotransporteValidationProps) {
  if (validationErrors.length === 0 && !isComplete) {
    return null;
  }

  return (
    <>
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Complete los siguientes campos requeridos:</p>
              <ul className="list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isComplete && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Configuración Completa</p>
                <p className="text-sm text-green-700">
                  Todos los datos del autotransporte están completos y son válidos según normativa SAT 3.1
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
