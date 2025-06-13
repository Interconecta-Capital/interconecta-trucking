
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RateLimitConfig {
  action: string;
  maxAttempts: number;
  windowMinutes: number;
  enableIpTracking?: boolean;
}

interface RateLimitAttempt {
  identifier: string;
  action: string;
  ip?: string;
  userAgent?: string;
  timestamp: number;
}

export const useAdvancedRateLimit = () => {
  const [attempts, setAttempts] = useState<Map<string, RateLimitAttempt[]>>(new Map());

  // Get client IP (best effort)
  const getClientIP = useCallback(async (): Promise<string | null> => {
    try {
      // In production, you might use a service like ipify
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return null;
    }
  }, []);

  // Check if action is rate limited
  const checkRateLimit = useCallback(async (
    identifier: string,
    config: RateLimitConfig
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number }> => {
    const now = Date.now();
    const windowMs = config.windowMinutes * 60 * 1000;
    const key = `${identifier}:${config.action}`;
    
    // Get current attempts for this identifier
    const currentAttempts = attempts.get(key) || [];
    
    // Filter out expired attempts
    const validAttempts = currentAttempts.filter(
      attempt => now - attempt.timestamp < windowMs
    );

    // Update attempts map
    setAttempts(prev => new Map(prev.set(key, validAttempts)));

    // Check if limit exceeded
    const remaining = Math.max(0, config.maxAttempts - validAttempts.length);
    const allowed = validAttempts.length < config.maxAttempts;
    const resetTime = validAttempts.length > 0 
      ? validAttempts[0].timestamp + windowMs 
      : now + windowMs;

    // Log to Supabase for persistence and monitoring
    if (!allowed) {
      await logRateLimitViolation(identifier, config);
    }

    return { allowed, remaining, resetTime };
  }, [attempts]);

  // Record a rate limit attempt
  const recordAttempt = useCallback(async (
    identifier: string,
    config: RateLimitConfig,
    metadata: Record<string, any> = {}
  ): Promise<void> => {
    const now = Date.now();
    const key = `${identifier}:${config.action}`;
    
    // Create attempt record
    const attempt: RateLimitAttempt = {
      identifier,
      action: config.action,
      timestamp: now,
      userAgent: navigator.userAgent
    };

    // Add IP if tracking enabled
    if (config.enableIpTracking) {
      attempt.ip = await getClientIP();
    }

    // Update local attempts
    const currentAttempts = attempts.get(key) || [];
    currentAttempts.push(attempt);
    setAttempts(prev => new Map(prev.set(key, currentAttempts)));

    // Log to Supabase
    try {
      await supabase.rpc('record_rate_limit_attempt', {
        p_identifier: identifier,
        p_action_type: config.action,
        p_metadata: {
          ...metadata,
          ip: attempt.ip,
          userAgent: attempt.userAgent,
          timestamp: now
        }
      });
    } catch (error) {
      console.error('Failed to record rate limit attempt:', error);
    }
  }, [attempts, getClientIP]);

  // Log rate limit violation
  const logRateLimitViolation = useCallback(async (
    identifier: string,
    config: RateLimitConfig
  ): Promise<void> => {
    try {
      const ip = await getClientIP();
      
      await supabase.rpc('log_security_event', {
        p_user_id: null,
        p_event_type: 'rate_limit_exceeded',
        p_event_data: {
          identifier,
          action: config.action,
          maxAttempts: config.maxAttempts,
          windowMinutes: config.windowMinutes,
          ip,
          userAgent: navigator.userAgent
        },
        p_ip_address: ip,
        p_user_agent: navigator.userAgent
      });
    } catch (error) {
      console.error('Failed to log rate limit violation:', error);
    }
  }, [getClientIP]);

  // Get rate limit status for display
  const getRateLimitStatus = useCallback((
    identifier: string,
    action: string
  ): { attempts: number; lastAttempt: number | null } => {
    const key = `${identifier}:${action}`;
    const currentAttempts = attempts.get(key) || [];
    
    return {
      attempts: currentAttempts.length,
      lastAttempt: currentAttempts.length > 0 
        ? Math.max(...currentAttempts.map(a => a.timestamp))
        : null
    };
  }, [attempts]);

  // Clear rate limit history for identifier
  const clearRateLimit = useCallback((identifier: string, action?: string) => {
    if (action) {
      const key = `${identifier}:${action}`;
      setAttempts(prev => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    } else {
      // Clear all attempts for this identifier
      setAttempts(prev => {
        const newMap = new Map();
        for (const [key, value] of prev) {
          if (!key.startsWith(`${identifier}:`)) {
            newMap.set(key, value);
          }
        }
        return newMap;
      });
    }
  }, []);

  return {
    checkRateLimit,
    recordAttempt,
    getRateLimitStatus,
    clearRateLimit
  };
};
