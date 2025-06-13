
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

  // Optimized session fetcher without excessive rate limiting
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
        
        // Clean URL hash if it contains auth tokens
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
          console.log('[OptimizedAuth] Cleaning auth tokens from URL');
          const cleanUrl = window.location.pathname + window.location.search;
          window.history.replaceState({}, document.title, cleanUrl);
        }
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

    // Set up auth state change listener with minimal debouncing
    let debounceTimeout: NodeJS.Timeout;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[OptimizedAuth] Auth state change:', event, !!session);
        
        // Clear any pending debounced updates
        if (debounceTimeout) {
          clearTimeout(debounceTimeout);
        }
        
        // Minimal debounce for rapid auth state changes
        debounceTimeout = setTimeout(() => {
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
            // Only clear auth-related localStorage items
            Object.keys(localStorage).forEach((key) => {
              if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
                localStorage.removeItem(key);
              }
            });
            console.log('[OptimizedAuth] Cleaned up auth data after signout');
          }
          
          // Clean URL for all auth events
          if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
            const cleanUrl = window.location.pathname + window.location.search;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        }, 50); // Reduced debounce to 50ms
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
