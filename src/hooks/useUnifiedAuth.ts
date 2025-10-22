
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
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false
  });

  // Optimized auth initialization
  const initializeAuth = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
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

      setAuthState({
        user: session?.user ?? null,
        session,
        loading: false,
        initialized: true
      });

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
