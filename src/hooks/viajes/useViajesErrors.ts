
import { useState, useCallback } from 'react';

export interface ViajesError {
  type: 'data' | 'mutation' | 'action';
  message: string;
  details?: any;
  context?: string;
}

export const useViajesErrors = () => {
  const [error, setError] = useState<ViajesError | null>(null);

  const handleError = useCallback((type: ViajesError['type'], error: any, context: string) => {
    const errorMessage = error?.message || 'Error desconocido';
    console.error(`[ViajesErrors ${type}] ${context}:`, error);
    
    setError({
      type,
      message: errorMessage,
      details: error,
      context
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
};
