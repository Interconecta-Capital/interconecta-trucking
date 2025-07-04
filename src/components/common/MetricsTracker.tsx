
import React, { useEffect } from 'react';
import { useAPITracking, useCalculationTracking, useUserActionTracking } from '@/hooks/useMonitoreoSistema';

interface MetricsTrackerProps {
  children: React.ReactNode;
}

export const MetricsTracker: React.FC<MetricsTrackerProps> = ({ children }) => {
  const trackAPI = useAPITracking();
  const trackCalculation = useCalculationTracking();
  const trackUserAction = useUserActionTracking();

  useEffect(() => {
    // Track page load time
    const loadTime = performance.now();
    trackUserAction('page_load', loadTime, { page: window.location.pathname });

    // Track user interactions
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const buttonText = target.textContent || target.closest('button')?.textContent || 'Unknown';
        trackUserAction('button_click', undefined, { 
          button: buttonText,
          page: window.location.pathname 
        });
      }
    };

    const handleFormSubmit = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement;
      const formName = form.getAttribute('name') || form.id || 'unnamed_form';
      trackUserAction('form_submit', undefined, { 
        form: formName,
        page: window.location.pathname 
      });
    };

    // Track errors
    const handleError = (event: ErrorEvent) => {
      trackUserAction('javascript_error', undefined, { 
        error: event.message,
        filename: event.filename,
        line: event.lineno,
        page: window.location.pathname 
      });
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('submit', handleFormSubmit);
    window.addEventListener('error', handleError);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('submit', handleFormSubmit);
      window.removeEventListener('error', handleError);
    };
  }, [trackUserAction]);

  return <>{children}</>;
};

// Higher-order component to wrap API calls with tracking
export function withAPITracking<T extends (...args: any[]) => Promise<any>>(
  apiCall: T,
  apiName: string
): T {
  return (async (...args: Parameters<T>) => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall(...args);
      const duration = performance.now() - startTime;
      
      // This would use the hook if we were in a component context
      // For now, we'll use the service directly
      console.log(`📊 API Success: ${apiName} took ${duration}ms`);
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      console.error(`📊 API Error: ${apiName} failed after ${duration}ms`, error);
      
      throw error;
    }
  }) as T;
}

// Helper to track calculation precision
export const trackCalculationPrecision = (
  calculationType: string,
  estimated: number,
  actual: number,
  metadata: Record<string, any> = {}
) => {
  const precision = 1 - Math.abs(estimated - actual) / Math.max(estimated, actual);
  const success = precision > 0.8; // Consider 80%+ as successful
  
  console.log(`📊 Calculation ${calculationType}: ${(precision * 100).toFixed(1)}% precision`);
  
  return {
    precision,
    success,
    metadata: {
      ...metadata,
      estimated,
      actual,
      difference: Math.abs(estimated - actual),
      percentage_error: ((Math.abs(estimated - actual) / Math.max(estimated, actual)) * 100).toFixed(2)
    }
  };
};
