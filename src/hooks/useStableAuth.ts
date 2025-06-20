
import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';

type Usuario = Database['public']['Tables']['usuarios']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Tenant = Database['public']['Tables']['tenants']['Row'];

export interface StableAuthUser extends User {
  profile?: Profile | null;
  usuario?: Usuario | null;
  tenant?: Tenant | null;
}

interface AuthState {
  user: StableAuthUser | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export const useStableAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false,
    error: null,
  });
  
  const navigate = useNavigate();
  const mountedRef = useRef(true);
  const initializationRef = useRef(false);
  const retryCountRef = useRef(0);
  const lastUserIdRef = useRef<string | null>(null);

  const retryWithBackoff = useCallback(async (fn: () => Promise<any>, retries = MAX_RETRIES): Promise<any> => {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        console.warn(`[StableAuth] Retrying operation, ${retries} attempts left`, error);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return retryWithBackoff(fn, retries - 1);
      }
      throw error;
    }
  }, []);

  const loadUserData = useCallback(async (authUser: User): Promise<StableAuthUser> => {
    if (!mountedRef.current || lastUserIdRef.current === authUser.id) {
      return { ...authUser, profile: null, usuario: null, tenant: null };
    }

    lastUserIdRef.current = authUser.id;
    console.log('[StableAuth] Loading user data for:', authUser.id);

    try {
      const loadData = async () => {
        const [profileResult, usuarioResult] = await Promise.allSettled([
          supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle(),
          supabase.from('usuarios').select('*').eq('auth_user_id', authUser.id).maybeSingle()
        ]);

        const profile = profileResult.status === 'fulfilled' && profileResult.value?.data 
          ? profileResult.value.data 
          : null;

        const usuario = usuarioResult.status === 'fulfilled' && usuarioResult.value?.data 
          ? usuarioResult.value.data 
          : null;

        let tenant: Tenant | null = null;
        if (usuario?.tenant_id) {
          try {
            const tenantResult = await supabase
              .from('tenants')
              .select('*')
              .eq('id', usuario.tenant_id)
              .maybeSingle();
            tenant = tenantResult.data;
          } catch (error) {
            console.warn('[StableAuth] Error loading tenant:', error);
          }
        }

        return { ...authUser, profile, usuario, tenant };
      };

      return await retryWithBackoff(loadData);
    } catch (error) {
      console.error('[StableAuth] Error loading user data:', error);
      return { ...authUser, profile: null, usuario: null, tenant: null };
    }
  }, [retryWithBackoff]);

  const updateAuthState = useCallback(async (session: Session | null, skipUserLoad = false) => {
    if (!mountedRef.current) return;

    console.log('[StableAuth] Updating auth state, session:', !!session);

    if (session?.user && !skipUserLoad) {
      try {
        setAuthState(prev => ({ ...prev, loading: true, error: null }));
        const userData = await loadUserData(session.user);
        
        if (mountedRef.current) {
          setAuthState({
            user: userData,
            session,
            loading: false,
            initialized: true,
            error: null,
          });
        }
      } catch (error) {
        console.error('[StableAuth] Error updating auth state:', error);
        if (mountedRef.current) {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            initialized: true,
            error: error instanceof Error ? error.message : 'Error de autenticación',
          });
        }
      }
    } else {
      if (mountedRef.current) {
        setAuthState({
          user: null,
          session: null,
          loading: false,
          initialized: true,
          error: null,
        });
      }
    }
  }, [loadUserData]);

  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    let authSubscription: any = null;

    const initializeAuth = async () => {
      try {
        console.log('[StableAuth] Initializing stable authentication...');

        // Set up auth state listener first
        authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('[StableAuth] Auth state change:', event, !!session);
          
          // Handle different auth events
          switch (event) {
            case 'SIGNED_IN':
              retryCountRef.current = 0;
              setTimeout(() => updateAuthState(session), 100);
              
              // Navigate only from auth pages
              const currentPath = window.location.pathname;
              if (currentPath === '/' || currentPath === '/auth') {
                navigate('/dashboard', { replace: true });
              }
              break;
              
            case 'SIGNED_OUT':
              lastUserIdRef.current = null;
              retryCountRef.current = 0;
              await updateAuthState(null);
              
              // Navigate to auth unless already there
              const authPath = window.location.pathname;
              if (!authPath.includes('/auth') && authPath !== '/') {
                navigate('/auth', { replace: true });
              }
              break;
              
            case 'TOKEN_REFRESHED':
              // Update session only, don't reload user data
              if (mountedRef.current) {
                setAuthState(prev => ({ ...prev, session }));
              }
              break;
              
            default:
              setTimeout(() => updateAuthState(session), 100);
              break;
          }
        });

        // Get initial session
        const { data: { session }, error } = await retryWithBackoff(
          () => supabase.auth.getSession()
        );

        if (error) {
          console.error('[StableAuth] Error getting initial session:', error);
          if (mountedRef.current) {
            setAuthState(prev => ({ 
              ...prev, 
              loading: false, 
              initialized: true, 
              error: error.message 
            }));
          }
        } else {
          await updateAuthState(session);
        }

      } catch (error) {
        console.error('[StableAuth] Error initializing auth:', error);
        if (mountedRef.current) {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            initialized: true,
            error: error instanceof Error ? error.message : 'Error de inicialización',
          });
        }
      }
    };

    initializeAuth();

    return () => {
      mountedRef.current = false;
      if (authSubscription?.data?.subscription) {
        authSubscription.data.subscription.unsubscribe();
      }
    };
  }, [updateAuthState, navigate, retryWithBackoff]);

  // Auth actions with retry logic
  const signIn = useCallback(async (email: string, password: string) => {
    return await retryWithBackoff(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    });
  }, [retryWithBackoff]);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      lastUserIdRef.current = null;
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('[StableAuth] Signout error:', error);
      // Force navigation even on error
      navigate('/auth', { replace: true });
    }
  }, [navigate]);

  const hasAccess = useCallback((resource: string): boolean => {
    if (!authState.user) return false;
    
    if (authState.user.usuario?.rol_especial === 'superuser' || 
        authState.user.usuario?.rol === 'superuser') {
      return true;
    }
    
    if (authState.user.usuario?.rol === 'admin') {
      return !resource.includes('superuser');
    }
    
    return ['dashboard', 'carta-porte', 'profile'].some(allowed => 
      resource.includes(allowed)
    );
  }, [authState.user]);

  const refreshUserData = useCallback(async () => {
    if (authState.user && authState.session) {
      try {
        const userData = await loadUserData(authState.user);
        setAuthState(prev => ({ ...prev, user: userData }));
      } catch (error) {
        console.error('[StableAuth] Error refreshing user data:', error);
      }
    }
  }, [authState.user, authState.session, loadUserData]);

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    initialized: authState.initialized,
    error: authState.error,
    signIn,
    signOut,
    hasAccess,
    refreshUserData,
  };
};
