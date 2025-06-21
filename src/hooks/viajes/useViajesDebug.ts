
import { useState } from 'react';

export const useViajesDebug = () => {
  const [debugMode, setDebugMode] = useState(false);

  const logDebug = (component: string, message: string, data?: any) => {
    if (debugMode) {
      console.log(`[${component}] DEBUG:`, message, data);
    }
  };

  const logInfo = (component: string, message: string, data?: any) => {
    console.log(`[${component}] INFO:`, message, data);
  };

  const logError = (component: string, message: string, error?: any) => {
    console.error(`[${component}] ERROR:`, message, error);
  };

  const enableDebugMode = () => {
    setDebugMode(true);
    console.log('[ViajesDebug] Debug mode enabled');
  };

  const disableDebugMode = () => {
    setDebugMode(false);
    console.log('[ViajesDebug] Debug mode disabled');
  };

  return {
    debugMode,
    logDebug,
    logInfo,
    logError,
    enableDebugMode,
    disableDebugMode
  };
};
