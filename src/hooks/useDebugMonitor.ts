
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
  const maxEvents = 100; // Increased to keep more events for debugging

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

    // Enhanced logging for auth events
    if (type.includes('auth')) {
      console.log(`[DEBUG-AUTH] ${type}:`, data);
    } else {
      console.log(`[DEBUG] ${type}:`, data);
    }
  };

  const getDebugEvents = () => debugEventsRef.current;

  const clearDebugEvents = () => {
    debugEventsRef.current = [];
  };

  const getAuthEvents = () => {
    return debugEventsRef.current.filter(event => 
      event.type.includes('auth') || 
      event.type.includes('session') ||
      event.type.includes('token')
    );
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

    // Monitor URL hash changes for auth token detection
    const handleHashChange = () => {
      logEvent('hash_change', {
        hash: window.location.hash,
        hasAuthTokens: window.location.hash.includes('access_token'),
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
    window.addEventListener('hashchange', handleHashChange);

    // Log initial page load
    logEvent('page_load', {
      url: window.location.href,
      referrer: document.referrer,
      hasAuthTokens: window.location.hash.includes('access_token'),
      timestamp: Date.now(),
    });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return {
    logEvent,
    getDebugEvents,
    clearDebugEvents,
    getAuthEvents,
  };
};
