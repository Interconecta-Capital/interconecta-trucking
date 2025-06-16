
import { useCallback, useRef } from 'react';

interface DebugEvent {
  type: string;
  data: any;
  timestamp: number;
}

export const useDebugMonitor = () => {
  const eventsRef = useRef<DebugEvent[]>([]);
  const lastLogTime = useRef<number>(0);

  const logEvent = useCallback((type: string, data: any) => {
    const now = Date.now();
    
    // Throttle logging más agresivamente - solo 1 evento cada 5 segundos
    if (now - lastLogTime.current < 5000) {
      return;
    }
    
    lastLogTime.current = now;
    
    const event: DebugEvent = {
      type,
      data,
      timestamp: now,
    };

    // Mantener solo los últimos 10 eventos para reducir memoria
    eventsRef.current = [...eventsRef.current.slice(-9), event];
    
    // Solo loggear en desarrollo y con throttling
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Debug] ${type}:`, data);
    }
  }, []);

  const getEvents = useCallback(() => {
    return eventsRef.current;
  }, []);

  const clearEvents = useCallback(() => {
    eventsRef.current = [];
  }, []);

  return {
    logEvent,
    getEvents,
    clearEvents,
  };
};
