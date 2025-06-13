
import React from 'react';
import { Check, X, Loader2 } from 'lucide-react';

type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid';

interface ValidationIndicatorProps {
  status: ValidationStatus;
  message?: string;
}

export function ValidationIndicator({ status, message }: ValidationIndicatorProps) {
  if (status === 'idle') return null;

  return (
    <div className="flex items-center gap-1 text-sm">
      {status === 'validating' && (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
          <span className="text-blue-600">Validando...</span>
        </>
      )}
      
      {status === 'valid' && (
        <>
          <Check className="h-3 w-3 text-green-500" />
          <span className="text-green-600">Válido</span>
        </>
      )}
      
      {status === 'invalid' && (
        <>
          <X className="h-3 w-3 text-red-500" />
          <span className="text-red-600">{message || 'Inválido'}</span>
        </>
      )}
    </div>
  );
}
