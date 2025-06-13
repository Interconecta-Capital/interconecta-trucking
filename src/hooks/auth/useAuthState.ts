
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { AuthUser } from './types';

type Usuario = Database['public']['Tables']['usuarios']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Tenant = Database['public']['Tables']['tenants']['Row'];

export function useAuthState() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  const loadUserData = async (authUser: User) => {
    try {
      console.log('[AuthState] Loading user data for:', authUser.id);
      
      // Load profile data first (no recursion risk)
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      // Load usuario data safely
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
        } else {
          console.log('[AuthState] No session found');
          setUser(null);
        }
      } catch (error) {
        console.error('[AuthState] Error getting session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthState] Auth state change:', event, !!session);
        setSession(session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setLoading(true);
          // Minimal delay to avoid potential issues, reduced from 100ms to 25ms
          setTimeout(async () => {
            await loadUserData(session.user);
            setLoading(false);
          }, 25);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          // Refresh user data on token refresh
          await loadUserData(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading, session };
}

// Export AuthUser type for use in other modules
export type { AuthUser } from './types';
