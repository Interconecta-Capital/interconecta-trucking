
import { useState, useCallback } from 'react';

export const useViajesDebug = () => {
  const [debugMode, setDebugMode] = useState(false);

  const logDebug = useCallback((component: string, message: string, data?: any) => {
    if (debugMode) {
      console.log(`[${component}] ${message}`, data);
    }
  }, [debugMode]);

  const logInfo = useCallback((component: string, message: string, data?: any) => {
    console.log(`[${component}] ${message}`, data);
  }, []);

  const logError = useCallback((component: string, message: string, error?: any) => {
    console.error(`[${component}] ${message}`, error);
  }, []);

  const enableDebugMode = useCallback(() => {
    setDebugMode(true);
    console.log('[ViajesDebug] Debug mode enabled');
  }, []);

  const disableDebugMode = useCallback(() => {
    setDebugMode(false);
    console.log('[ViajesDebug] Debug mode disabled');
  }, []);

  return {
    debugMode,
    logDebug,
    logInfo,
    logError,
    enableDebugMode,
    disableDebugMode
  };
};
