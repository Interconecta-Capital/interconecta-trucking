
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetric {
  operation: string;
  duration: number;
  timestamp: Date;
  success: boolean;
  error?: string;
}

export function useRLSPerformanceMonitor() {
  const logMetric = useCallback((metric: PerformanceMetric) => {
    const key = 'rls_performance_metrics';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = [...existing.slice(-49), metric]; // Keep last 50 metrics
    localStorage.setItem(key, JSON.stringify(updated));
    
    console.log(`[RLS Performance] ${metric.operation}: ${metric.duration}ms`, 
      metric.success ? '✅' : '❌', metric.error || '');
  }, []);

  const measureQuery = useCallback(async <T>(
    operation: string,
    queryFn: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    let success = true;
    let error: string | undefined;
    
    try {
      const result = await queryFn();
      return result;
    } catch (err) {
      success = false;
      error = err instanceof Error ? err.message : 'Unknown error';
      throw err;
    } finally {
      const duration = performance.now() - startTime;
      logMetric({
        operation,
        duration,
        timestamp: new Date(),
        success,
        error
      });
    }
  }, [logMetric]);

  const getMetrics = useCallback(() => {
    const key = 'rls_performance_metrics';
    return JSON.parse(localStorage.getItem(key) || '[]') as PerformanceMetric[];
  }, []);

  const clearMetrics = useCallback(() => {
    localStorage.removeItem('rls_performance_metrics');
  }, []);

  // Test RLS performance on mount
  useEffect(() => {
    const testRLSPerformance = async () => {
      try {
        await measureQuery('rls_test_auth_check', async () => {
          const { data } = await supabase.auth.getUser();
          return data;
        });

        // Only test conductores if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await measureQuery('rls_test_conductores_query', async () => {
            const { data } = await supabase
              .from('conductores')
              .select('id, nombre')
              .limit(1);
            return data;
          });
        }
      } catch (error) {
        console.warn('[RLS Performance] Test failed:', error);
      }
    };

    // Delay test to avoid interference with app initialization
    setTimeout(testRLSPerformance, 2000);
  }, [measureQuery]);

  return {
    measureQuery,
    getMetrics,
    clearMetrics,
    logMetric
  };
}
