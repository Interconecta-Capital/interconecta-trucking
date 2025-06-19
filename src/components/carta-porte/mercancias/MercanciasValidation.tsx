
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface MercanciasValidationProps {
  showForm: boolean;
  isDataComplete: () => boolean;
  hasData: boolean;
}

export function MercanciasValidation({ 
  showForm, 
  isDataComplete, 
  hasData 
}: MercanciasValidationProps) {
  if (showForm || isDataComplete() || !hasData) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        Algunas mercancías tienen datos incompletos. Revise que todas tengan descripción, cantidad, peso y claves SAT válidas.
      </AlertDescription>
    </Alert>
  );
}
