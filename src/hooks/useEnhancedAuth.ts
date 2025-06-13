
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from './auth/useSecureAuth';
import { useSessionSecurity } from './useSessionSecurity';
import { multiTenancyService } from '@/services/multiTenancyService';
import { toast } from 'sonner';

interface EnhancedAuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  tenant: any | null;
}

export const useEnhancedAuth = () => {
  const [authState, setAuthState] = useState<EnhancedAuthState>({
    user: null,
    session: null,
    loading: true,
    initialized: false,
    tenant: null
  });

  const { secureLogin, secureRegister, secureLogout } = useSecureAuth();
  const { resetActivityTimer } = useSessionSecurity();

  const loadTenantData = useCallback(async (userId: string) => {
    try {
      const tenant = await multiTenancyService.getCurrentTenant(userId);
      setAuthState(prev => ({ ...prev, tenant }));
      return tenant;
    } catch (error) {
      console.error('Error loading tenant data:', error);
      return null;
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      console.log('[EnhancedAuth] Initializing...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('[EnhancedAuth] Session error:', error);
        setAuthState({
          user: null,
          session: null,
          loading: false,
          initialized: true,
          tenant: null
        });
        return;
      }

      if (session?.user) {
        console.log('[EnhancedAuth] Session found, loading tenant...');
        const tenant = await loadTenantData(session.user.id);
        
        setAuthState({
          user: session.user,
          session,
          loading: false,
          initialized: true,
          tenant
        });
      } else {
        console.log('[EnhancedAuth] No session found');
        setAuthState({
          user: null,
          session: null,
          loading: false,
          initialized: true,
          tenant: null
        });
      }
    } catch (error) {
      console.error('[EnhancedAuth] Initialization error:', error);
      setAuthState({
        user: null,
        session: null,
        loading: false,
        initialized: true,
        tenant: null
      });
    }
  }, [loadTenantData]);

  useEffect(() => {
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[EnhancedAuth] Auth state change:', event);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setAuthState(prev => ({ ...prev, loading: true }));
          
          // Defer tenant loading to avoid deadlocks
          setTimeout(async () => {
            const tenant = await loadTenantData(session.user.id);
            setAuthState({
              user: session.user,
              session,
              loading: false,
              initialized: true,
              tenant
            });
            
            // Redirect to dashboard after successful login
            if (window.location.pathname === '/auth' || window.location.pathname === '/') {
              window.location.href = '/dashboard';
            }
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          setAuthState({
            user: null,
            session: null,
            loading: false,
            initialized: true,
            tenant: null
          });
        } else {
          setAuthState(prev => ({
            ...prev,
            user: session?.user || null,
            session,
            loading: false,
            initialized: true
          }));
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [initializeAuth, loadTenantData]);

  const enhancedLogin = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const success = await secureLogin(email, password);
      
      if (success) {
        resetActivityTimer();
        toast.success('Inicio de sesión exitoso');
        return true;
      }
      
      setAuthState(prev => ({ ...prev, loading: false }));
      return false;
    } catch (error) {
      console.error('Enhanced login error:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      toast.error('Error al iniciar sesión');
      return false;
    }
  }, [secureLogin, resetActivityTimer]);

  const enhancedRegister = useCallback(async (
    email: string, 
    password: string, 
    userData: { nombre: string; empresa?: string; rfc?: string; telefono?: string }
  ): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      const success = await secureRegister(
        email, 
        password, 
        userData.nombre, 
        userData.rfc,
        userData.empresa,
        userData.telefono
      );
      
      setAuthState(prev => ({ ...prev, loading: false }));
      return success;
    } catch (error) {
      console.error('Enhanced register error:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      toast.error('Error en el registro');
      return false;
    }
  }, [secureRegister]);

  const enhancedLogout = useCallback(async () => {
    try {
      await secureLogout();
      
      setAuthState({
        user: null,
        session: null,
        loading: false,
        initialized: true,
        tenant: null
      });
    } catch (error) {
      console.error('Enhanced logout error:', error);
      throw error;
    }
  }, [secureLogout]);

  return {
    user: authState.user,
    session: authState.session,
    loading: authState.loading,
    initialized: authState.initialized,
    tenant: authState.tenant,
    enhancedLogin,
    enhancedRegister,
    enhancedLogout,
    hasAccess: (requiredRole?: string) => {
      if (!authState.user) return false;
      if (!requiredRole) return true;
      
      // Basic role checking - can be enhanced based on tenant data
      return authState.tenant?.rol === requiredRole || authState.tenant?.rol === 'admin';
    }
  };
};
