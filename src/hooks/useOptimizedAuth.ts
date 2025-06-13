
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

  // Optimized session fetcher with caching
  const fetchSession = useCallback(async () => {
    if (initializingRef.current) return;
    
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

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[OptimizedAuth] Auth state change:', event);
        
        if (mountedRef.current) {
          setAuthState({
            user: session?.user || null,
            session,
            loading: false,
            initialized: true,
          });
        }

        // Handle specific auth events
        if (event === 'SIGNED_OUT') {
          // Clear any cached data
          sessionStorage.clear();
          localStorage.removeItem('supabase.auth.token');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      mountedRef.current = false;
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
      await supabase.auth.signOut();
    },
  };
};
