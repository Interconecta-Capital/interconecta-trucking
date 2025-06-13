
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { AuthUser } from './types';
import { handleOAuthUser } from './useAuthUtils';

type Usuario = Database['public']['Tables']['usuarios']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Tenant = Database['public']['Tables']['tenants']['Row'];

export function useAuthState() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  const loadUserData = async (authUser: User) => {
    try {
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

      setUser(userData);
    } catch (error) {
      console.error('Error loading user data:', error);
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
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        
        if (currentSession?.user) {
          await loadUserData(currentSession.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setLoading(true);
          // On sign in, ensure the usuario row exists before loading extra data
          // If missing, handleOAuthUser will create the database entry
          setTimeout(async () => {
            const { data: existingUser } = await supabase
              .from('usuarios')
              .select('id')
              .eq('auth_user_id', session.user.id)
              .maybeSingle();

            if (!existingUser) {
              await handleOAuthUser(session.user);
            }

            await loadUserData(session.user);
            setLoading(false);
          }, 100);
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
