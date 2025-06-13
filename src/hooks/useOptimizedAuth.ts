
import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

export const useOptimizedAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false,
  });
  
  const initializingRef = useRef(false);
  const mountedRef = useRef(true);
  const lastSessionCheck = useRef<number>(0);

  // Optimized session fetcher with caching and rate limiting
  const fetchSession = useCallback(async () => {
    if (initializingRef.current) return;
    
    // Rate limit session checks to once per 30 seconds
    const now = Date.now();
    if (now - lastSessionCheck.current < 30000) {
      console.log('[OptimizedAuth] Skipping session check (rate limited)');
      return;
    }
    lastSessionCheck.current = now;
    
    try {
      initializingRef.current = true;
      console.log('[OptimizedAuth] Fetching session...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[OptimizedAuth] Session fetch error:', error);
        if (mountedRef.current) {
          setAuthState(prev => ({ ...prev, loading: false, initialized: true }));
        }
        return;
      }

      if (mountedRef.current) {
        setAuthState({
          user: session?.user || null,
          session,
          loading: false,
          initialized: true,
        });
        console.log('[OptimizedAuth] Session loaded:', !!session);
      }
    } catch (error) {
      console.error('[OptimizedAuth] Unexpected error:', error);
      if (mountedRef.current) {
        setAuthState(prev => ({ ...prev, loading: false, initialized: true }));
      }
    } finally {
      initializingRef.current = false;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    fetchSession();

    // Set up auth state change listener with debouncing
    let debounceTimeout: NodeJS.Timeout;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[OptimizedAuth] Auth state change:', event);
        
        // Clear any pending debounced updates
        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
        }
        
        // Debounce rapid auth state changes
        debounceTimeout = setTimeout(() => {
          if (mountedRef.current) {
            setAuthState({
              user: session?.user || null,
              session,
              loading: false,
              initialized: true,
            });
          }

          // Handle specific auth events without full page refresh
          if (event === 'SIGNED_OUT') {
            // Clear any cached data
            sessionStorage.clear();
            // Only clear auth-related localStorage items
            Object.keys(localStorage).forEach((key) => {
              if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
                localStorage.removeItem(key);
              }
            });
            console.log('[OptimizedAuth] Cleaned up auth data after signout');
          }
        }, 100); // 100ms debounce
      }
    );

    return () => {
      subscription.unsubscribe();
      mountedRef.current = false;
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [fetchSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    initialized: authState.initialized,
    signOut: async () => {
      try {
        await supabase.auth.signOut();
        // Use programmatic navigation instead of window.location.href
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('auth-logout', { detail: { reason: 'manual' } });
          window.dispatchEvent(event);
        }
      } catch (error) {
        console.error('[OptimizedAuth] Signout error:', error);
      }
    },
  };
};
