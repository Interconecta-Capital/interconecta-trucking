import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type Usuario = Database['public']['Tables']['usuarios']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Tenant = Database['public']['Tables']['tenants']['Row'];

export interface UnifiedAuthUser extends User {
  profile?: Profile | null;
  usuario?: Usuario | null;
  tenant?: Tenant | null;
}

interface UnifiedAuthState {
  user: UnifiedAuthUser | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
}

export const useUnifiedAuth = () => {
  const [authState, setAuthState] = useState<UnifiedAuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false,
  });
  
  const navigate = useNavigate();
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);
  const lastUserIdRef = useRef<string | null>(null);

  const loadUserData = useCallback(async (authUser: User): Promise<UnifiedAuthUser> => {
    try {
      if (loadingRef.current || lastUserIdRef.current === authUser.id) {
        return { ...authUser, profile: null, usuario: null, tenant: null };
      }

      loadingRef.current = true;
      lastUserIdRef.current = authUser.id;

      console.log('[UnifiedAuth] Loading user data for:', authUser.id);
      
      const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      // Use proper typing for Supabase responses
      const [profileResult, usuarioResult] = await Promise.allSettled([
        Promise.race([
          supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle(),
          timeout
        ]),
        Promise.race([
          supabase.from('usuarios').select('*').eq('auth_user_id', authUser.id).maybeSingle(),
          timeout
        ])
      ]);

      // Safely extract data with proper typing
      const profile: Profile | null = profileResult.status === 'fulfilled' && 
        profileResult.value && 
        typeof profileResult.value === 'object' && 
        'data' in profileResult.value 
        ? (profileResult.value as any).data 
        : null;

      const usuario: Usuario | null = usuarioResult.status === 'fulfilled' && 
        usuarioResult.value && 
        typeof usuarioResult.value === 'object' && 
        'data' in usuarioResult.value 
        ? (usuarioResult.value as any).data 
        : null;

      let tenant: Tenant | null = null;
      if (usuario?.tenant_id) {
        try {
          const tenantResult = await Promise.race([
            supabase.from('tenants').select('*').eq('id', usuario.tenant_id).maybeSingle(),
            timeout
          ]);
          if (tenantResult && typeof tenantResult === 'object' && 'data' in tenantResult) {
            tenant = (tenantResult as any).data;
          }
        } catch (error) {
          console.warn('[UnifiedAuth] Error loading tenant:', error);
        }
      }

      const userData: UnifiedAuthUser = {
        ...authUser,
        profile,
        usuario,
        tenant
      };

      console.log('[UnifiedAuth] User data loaded successfully');
      return userData;
    } catch (error) {
      console.error('[UnifiedAuth] Error loading user data:', error);
      return {
        ...authUser,
        profile: null,
        usuario: null,
        tenant: null
      };
    } finally {
      loadingRef.current = false;
    }
  }, []);

  const updateAuthState = useCallback(async (session: Session | null) => {
    if (!mountedRef.current) return;

    if (session?.user) {
      const userData = await loadUserData(session.user);
      setAuthState({
        user: userData,
        session,
        loading: false,
        initialized: true,
      });
    } else {
      setAuthState({
        user: null,
        session: null,
        loading: false,
        initialized: true,
      });
    }
  }, [loadUserData]);

  // Inicializar autenticación una sola vez
  useEffect(() => {
    let authSubscription: any = null;

    const initializeAuth = async () => {
      try {
        console.log('[UnifiedAuth] Initializing authentication...');

        authSubscription = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('[UnifiedAuth] Auth state change:', event, !!session);
            
            if (event === 'TOKEN_REFRESHED') {
              if (mountedRef.current) {
                setAuthState(prev => ({ ...prev, session }));
              }
              return;
            }

            setTimeout(async () => {
              if (mountedRef.current) {
                await updateAuthState(session);
                
                if (event === 'SIGNED_IN' && session?.user) {
                  const currentPath = window.location.pathname;
                  if (currentPath === '/' || currentPath === '/auth') {
                    navigate('/dashboard', { replace: true });
                  }
                } else if (event === 'SIGNED_OUT') {
                  lastUserIdRef.current = null;
                  const currentPath = window.location.pathname;
                  if (!currentPath.includes('/auth') && currentPath !== '/') {
                    navigate('/auth', { replace: true });
                  }
                }
              }
            }, 100);
          }
        );

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('[UnifiedAuth] Error getting initial session:', error);
        }

        await updateAuthState(session);
        
      } catch (error) {
        console.error('[UnifiedAuth] Error initializing auth:', error);
        if (mountedRef.current) {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            initialized: true,
          });
        }
      }
    };

    initializeAuth();

    return () => {
      mountedRef.current = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [updateAuthState, navigate]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Funciones de autenticación
  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }, []);

  const signUp = useCallback(async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) throw error;
    return { needsVerification: !data.user?.email_confirmed_at };
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      lastUserIdRef.current = null;
      navigate('/auth', { replace: true });
    } catch (error) {
      console.error('[UnifiedAuth] Signout error:', error);
    }
  }, [navigate]);

  const resendConfirmation = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/`
      }
    });
    if (error) throw error;
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!authState.user?.id) throw new Error('No user logged in');
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', authState.user.id);
    
    if (error) throw error;
    
    // Reload user data
    const userData = await loadUserData(authState.user);
    setAuthState(prev => ({ ...prev, user: userData }));
  }, [authState.user, loadUserData]);

  const hasAccess = useCallback((resource: string): boolean => {
    if (!authState.user) return false;
    
    if (authState.user.usuario?.rol_especial === 'superuser' || authState.user.usuario?.rol === 'superuser') {
      return true;
    }
    
    if (authState.user.usuario?.rol === 'admin') {
      return !resource.includes('superuser');
    }
    
    return ['dashboard', 'carta-porte', 'profile'].some(allowed => resource.includes(allowed));
  }, [authState.user]);

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    initialized: authState.initialized,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resendConfirmation,
    updateProfile,
    hasAccess,
  };
};
