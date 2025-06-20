
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  nombre: string;
  email: string;
  empresa?: string;
  rfc?: string;
  telefono?: string;
  plan_type?: string;
  trial_end_date?: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  initialized: boolean;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export const useStableAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    initialized: false,
  });

  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);

  const retryWithBackoff = useCallback(async (fn: () => Promise<any>, retries = MAX_RETRIES): Promise<any> => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        console.warn(`[StableAuth] Retrying operation, ${retries} attempts left`, error);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1)));
        return retryWithBackoff(fn, retries - 1);
      }
      throw error;
    }
  }, []);

  const loadUserProfile = useCallback(async (userId: string) => {
    if (!userId || !mountedRef.current) return null;

    try {
      console.log('[StableAuth] Loading user profile for:', userId);

      const loadProfile = async () => {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          console.error('[StableAuth] Profile error:', error);
          // Don't throw error if profile doesn't exist, create default
          if (error.code === 'PGRST116') {
            console.log('[StableAuth] No profile found, using defaults');
            return null;
          }
          throw new Error(`Error loading profile: ${error.message}`);
        }

        return profile;
      };

      const profile = await retryWithBackoff(loadProfile);
      console.log('[StableAuth] Profile loaded successfully:', profile?.nombre || 'Default User');
      
      return profile;
    } catch (error) {
      console.error('[StableAuth] Error loading profile:', error);
      return null;
    }
  }, [retryWithBackoff]);

  // Initialize auth
  useEffect(() => {
    if (!mountedRef.current) return;

    console.log('[StableAuth] Initializing authentication...');

    const initializeAuth = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[StableAuth] Session error:', error);
          throw error;
        }

        if (session?.user && mountedRef.current) {
          console.log('[StableAuth] Session found, loading user data');
          const profile = await loadUserProfile(session.user.id);
          
          if (mountedRef.current) {
            setState({
              user: session.user,
              session,
              profile,
              loading: false,
              initialized: true,
            });
            console.log('[StableAuth] User data loaded successfully');
          }
        } else if (mountedRef.current) {
          setState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            initialized: true,
          });
          console.log('[StableAuth] No active session');
        }
      } catch (error) {
        console.error('[StableAuth] Initialization error:', error);
        if (mountedRef.current) {
          setState(prev => ({
            ...prev,
            loading: false,
            initialized: true,
          }));
          
          if (retryCountRef.current >= MAX_RETRIES) {
            toast.error('Error de autenticación. Por favor, recarga la página.');
          }
          retryCountRef.current++;
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;

      console.log('[StableAuth] Auth state change:', event, !!session);

      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await loadUserProfile(session.user.id);
        if (mountedRef.current) {
          setState({
            user: session.user,
            session,
            profile,
            loading: false,
            initialized: true,
          });
        }
      } else if (event === 'SIGNED_OUT') {
        if (mountedRef.current) {
          setState({
            user: null,
            session: null,
            profile: null,
            loading: false,
            initialized: true,
          });
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  // Cleanup
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('[StableAuth] Sign out error:', error);
      toast.error('Error al cerrar sesión');
    }
  }, []);

  return {
    user: state.user,
    session: state.session,
    profile: state.profile,
    loading: state.loading,
    initialized: state.initialized,
    signOut,
  };
};
