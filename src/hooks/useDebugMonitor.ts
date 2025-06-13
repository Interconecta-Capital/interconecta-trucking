import { useEffect, useRef } from 'react';

interface DebugEvent {
  timestamp: number;
  type: string;
  data: any;
  url?: string;
  userAgent?: string;
}

export const useDebugMonitor = () => {
  const debugEventsRef = useRef<DebugEvent[]>([]);
  const maxEvents = 50; // Keep last 50 events

  const logEvent = (type: string, data: any) => {
    const event: DebugEvent = {
      timestamp: Date.now(),
      type,
      data,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    debugEventsRef.current.push(event);
    
    // Keep only recent events
    if (debugEventsRef.current.length > maxEvents) {
      debugEventsRef.current = debugEventsRef.current.slice(-maxEvents);
    }

    // Log to console for debugging
    console.log(`[DEBUG] ${type}:`, data);
  };

  const getDebugEvents = () => debugEventsRef.current;

  const clearDebugEvents = () => {
    debugEventsRef.current = [];
  };

  // Monitor page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      logEvent('visibility_change', {
        hidden: document.hidden,
        visibilityState: document.visibilityState,
      });
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      logEvent('page_show', {
        persisted: event.persisted,
      });
    };

    const handlePageHide = (event: PageTransitionEvent) => {
      logEvent('page_hide', {
        persisted: event.persisted,
      });
    };

    const handleBeforeUnload = () => {
      logEvent('before_unload', {
        timestamp: Date.now(),
      });
    };

    const handleFocus = () => {
      logEvent('window_focus', {
        timestamp: Date.now(),
      });
    };

    const handleBlur = () => {
      logEvent('window_blur', {
        timestamp: Date.now(),
      });
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Log initial page load
    logEvent('page_load', {
      url: window.location.href,
      referrer: document.referrer,
      timestamp: Date.now(),
    });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return {
    logEvent,
    getDebugEvents,
    clearDebugEvents,
  };
};
