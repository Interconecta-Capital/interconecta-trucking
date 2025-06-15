
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetrics {
  queryTime: number;
  cacheHitRate: number;
  activeConnections: number;
  slowQueries: number;
}

export const usePerformanceMonitoring = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    queryTime: 0,
    cacheHitRate: 0,
    activeConnections: 0,
    slowQueries: 0
  });
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    if (!isMonitoring) return;

    const startTime = performance.now();
    let queryCount = 0;
    let totalQueryTime = 0;

    // Monitor query performance
    const originalQuery = supabase.from;
    
    const monitoredQuery = function(table: string) {
      queryCount++;
      const queryStart = performance.now();
      
      const originalSelect = originalQuery.call(this, table).select;
      const monitoredSelect = function(...args: any[]) {
        const result = originalSelect.apply(this, args);
        
        // Measure query completion time
        if (result.then) {
          result.then(() => {
            const queryEnd = performance.now();
            totalQueryTime += (queryEnd - queryStart);
            
            setMetrics(prev => ({
              ...prev,
              queryTime: totalQueryTime / queryCount,
              slowQueries: prev.slowQueries + ((queryEnd - queryStart) > 1000 ? 1 : 0)
            }));
          });
        }
        
        return result;
      };
      
      return {
        ...originalQuery.call(this, table),
        select: monitoredSelect
      };
    };

    // Replace supabase.from temporarily
    (supabase as any).from = monitoredQuery;

    return () => {
      // Restore original functionality
      (supabase as any).from = originalQuery;
    };
  }, [isMonitoring]);

  const startMonitoring = () => setIsMonitoring(true);
  const stopMonitoring = () => setIsMonitoring(false);
  
  const resetMetrics = () => {
    setMetrics({
      queryTime: 0,
      cacheHitRate: 0,
      activeConnections: 0,
      slowQueries: 0
    });
  };

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    resetMetrics
  };
};
