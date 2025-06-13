
import { useState, useCallback } from 'react';

export const useErrorBoundary = () => {
  const [error, setError] = useState<Error | null>(null);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  const captureError = useCallback((error: Error | string) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    console.error('[ErrorBoundary] Captured error:', errorObj);
    setError(errorObj);
  }, []);

  return {
    error,
    resetError,
    captureError,
    hasError: !!error,
  };
};
