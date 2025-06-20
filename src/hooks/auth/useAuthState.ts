
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { AuthUser } from './types';
import { useNavigate, useLocation } from 'react-router-dom';

type Usuario = Database['public']['Tables']['usuarios']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Tenant = Database['public']['Tables']['tenants']['Row'];

export function useAuthState() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const loadUserData = async (authUser: User) => {
    try {
      console.log('[AuthState] Loading user data for:', authUser.id);
      
      // Load profile data first usando .maybeSingle() para evitar errores
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      // Load usuario data usando .maybeSingle() para evitar errores
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .maybeSingle();

      // Load tenant data if usuario has tenant_id
      let tenant: Tenant | null = null;
      if (usuario?.tenant_id) {
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', usuario.tenant_id)
          .maybeSingle();
        tenant = tenantData;
      }

      const userData: AuthUser = {
        ...authUser,
        profile,
        usuario,
        tenant
      };

      console.log('[AuthState] User data loaded successfully');
      setUser(userData);
    } catch (error) {
      console.error('[AuthState] Error loading user data:', error);
      // Set basic user data even if extended data fails
      setUser({
        ...authUser,
        profile: null,
        usuario: null,
        tenant: null
      });
    }
  };

  const shouldRedirectToDashboard = (pathname: string, user: AuthUser | null) => {
    // Si hay usuario autenticado y está en landing o auth, redirigir a dashboard
    return user && (pathname === '/' || pathname.startsWith('/auth'));
  };

  const shouldRedirectToAuth = (pathname: string, user: AuthUser | null) => {
    // Si no hay usuario y está en una ruta protegida, redirigir a auth
    const protectedRoutes = ['/dashboard', '/cartas-porte', '/vehiculos', '/conductores', '/socios', '/viajes', '/administracion', '/planes', '/carta-porte'];
    return !user && protectedRoutes.some(route => pathname.startsWith(route));
  };

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        console.log('[AuthState] Getting initial session...');
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        
        if (currentSession?.user) {
          console.log('[AuthState] Session found, loading user data');
          await loadUserData(currentSession.user);
          
          // Redirigir usuario autenticado desde landing/auth a dashboard
          if (shouldRedirectToDashboard(location.pathname, currentSession.user as AuthUser)) {
            console.log('[AuthState] Redirecting authenticated user to dashboard');
            navigate('/dashboard', { replace: true });
          }
        } else {
          console.log('[AuthState] No session found');
          setUser(null);
          
          // Redirigir usuario no autenticado desde rutas protegidas a auth
          if (shouldRedirectToAuth(location.pathname, null)) {
            console.log('[AuthState] Redirecting unauthenticated user to auth');
            navigate('/auth', { replace: true });
          }
        }
      } catch (error) {
        console.error('[AuthState] Error getting session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes con debouncing mucho más conservador
    let authChangeTimeout: NodeJS.Timeout;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthState] Auth state change:', event, !!session);
        
        // Clear any pending timeout
        if (authChangeTimeout) {
          clearTimeout(authChangeTimeout);
        }
        
        // Debounce auth state changes más agresivamente para evitar múltiples actualizaciones
        authChangeTimeout = setTimeout(async () => {
          setSession(session);
          
          if (event === 'SIGNED_IN' && session?.user) {
            setLoading(true);
            // Delay más largo para evitar conflictos
            setTimeout(async () => {
              await loadUserData(session.user);
              setLoading(false);
              
              // Redirigir después de login exitoso
              if (shouldRedirectToDashboard(location.pathname, session.user as AuthUser)) {
                console.log('[AuthState] Redirecting after sign in to dashboard');
                navigate('/dashboard', { replace: true });
              }
            }, 500);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setLoading(false);
            // Redirigir a auth después de logout
            if (location.pathname !== '/' && !location.pathname.startsWith('/auth')) {
              navigate('/auth', { replace: true });
            }
          } else if (event === 'TOKEN_REFRESHED' && session?.user) {
            // Refresh user data silently sin recargas y con throttling
            console.log('[AuthState] Token refreshed, updating user data silently');
            // Evitar recargas excesivas en token refresh
            setTimeout(async () => {
              await loadUserData(session.user);
            }, 1000);
          }
        }, 500);
      }
    );

    return () => {
      subscription.unsubscribe();
      if (authChangeTimeout) {
        clearTimeout(authChangeTimeout);
      }
    };
  }, [navigate, location.pathname]);

  return { user, loading, session };
}

// Export AuthUser type for use in other modules
export type { AuthUser } from './types';
