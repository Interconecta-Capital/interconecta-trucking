
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

export function useUnifiedAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Intentar cargar desde sessionStorage para auth más rápido
    try {
      const cachedAuth = sessionStorage.getItem('auth-state');
      if (cachedAuth) {
        const parsed = JSON.parse(cachedAuth);
        // Solo usar cache si es reciente (< 5 minutos)
        const cacheAge = Date.now() - (parsed.timestamp || 0);
        if (cacheAge < 5 * 60 * 1000) {
          console.log('[UnifiedAuth] Using cached auth state');
          return {
            user: parsed.user,
            session: parsed.session,
            loading: false,
            initialized: true
          };
        }
      }
    } catch (error) {
      console.error('[UnifiedAuth] Error reading cache:', error);
    }
    
    return {
      user: null,
      session: null,
      loading: true,
      initialized: false
    };
  });

  // Optimized auth initialization con timeout
  const initializeAuth = useCallback(async () => {
    try {
      // Race condition: timeout vs auth check
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Auth timeout')), 100)
      );
      
      const authPromise = supabase.auth.getSession();
      
      const { data: { session }, error } = await Promise.race([
        authPromise,
        timeoutPromise
      ]).catch(() => ({ data: { session: null }, error: null })) as any;
      
      if (error) {
        console.error('[UnifiedAuth] Session error:', error);
        setAuthState({
          user: null,
          session: null,
          loading: false,
          initialized: true
        });
        return;
      }

      const newState = {
        user: session?.user ?? null,
        session,
        loading: false,
        initialized: true
      };
      
      setAuthState(newState);
      
      // Guardar en sessionStorage para siguiente carga
      try {
        sessionStorage.setItem('auth-state', JSON.stringify({
          ...newState,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.error('[UnifiedAuth] Error caching auth:', error);
      }

      console.log('[UnifiedAuth] Session initialized:', session?.user?.id ? 'authenticated' : 'not authenticated');
    } catch (error) {
      console.error('[UnifiedAuth] Initialization error:', error);
      setAuthState({
        user: null,
        session: null,
        loading: false,
        initialized: true
      });
    }
  }, []);

  useEffect(() => {
    initializeAuth();

    // Optimized auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log(`[UnifiedAuth] Auth state change: ${event}`, session?.user?.id ? 'authenticated' : 'not authenticated');
        
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false,
          initialized: true
        });

        // Defer any data fetching to prevent RLS evaluation conflicts
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            console.log('[UnifiedAuth] User signed in, ready for data operations');
          }, 0);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth]);

  const signOut = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      // Clean auth state first
      const cleanupAuthState = () => {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
            localStorage.removeItem(key);
          }
        });
      };

      cleanupAuthState();
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) {
        console.error('[UnifiedAuth] Sign out error:', error);
      }

      // Force full page refresh for clean state
      window.location.href = '/auth';
    } catch (error) {
      console.error('[UnifiedAuth] Sign out error:', error);
      window.location.href = '/auth';
    }
  }, []);

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    initialized: authState.initialized,
    signOut
  };
}
