
import { useState } from 'react';

interface ViajesError {
  type: string;
  message: string;
  source: string;
}

export const useViajesErrors = () => {
  const [error, setError] = useState<ViajesError | null>(null);

  const handleError = (type: string, errorObj: any, source: string) => {
    const errorMessage = errorObj?.message || 'Error desconocido';
    setError({
      type,
      message: errorMessage,
      source
    });
  };

  const clearError = () => {
    setError(null);
  };

  return {
    error,
    handleError,
    clearError
  };
};
