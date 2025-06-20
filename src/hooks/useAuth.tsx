
import React, { createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

type Usuario = Database['public']['Tables']['usuarios']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];
type Tenant = Database['public']['Tables']['tenants']['Row'];

export interface AuthUser extends User {
  profile?: Profile | null;
  usuario?: Usuario | null;
  tenant?: Tenant | null;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  initialized: boolean;
  hasAccess: (resource: string) => boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, metadata?: any) => Promise<any>;
  signInWithGoogle: () => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
  updateProfile: (updates: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();

  const loadUserData = useCallback(async (authUser: User): Promise<AuthUser> => {
    try {
      console.log('[Auth] Loading user data for:', authUser.id);
      
      // Load profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      // Load usuario data
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

      console.log('[Auth] User data loaded successfully', userData);
      return userData;
    } catch (error) {
      console.error('[Auth] Error loading user data:', error);
      return {
        ...authUser,
        profile: null,
        usuario: null,
        tenant: null
      };
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('[Auth] Initializing authentication...');

        // Get initial session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession?.user && mounted) {
          const userData = await loadUserData(currentSession.user);
          setUser(userData);
          setSession(currentSession);
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('[Auth] Auth state change:', event, !!session);
            
            if (!mounted) return;

            setSession(session);
            
            if (event === 'SIGNED_IN' && session?.user) {
              setLoading(true);
              const userData = await loadUserData(session.user);
              setUser(userData);
              setLoading(false);
              
              // Redirect after sign in
              const currentPath = window.location.pathname;
              if (currentPath === '/' || currentPath === '/auth') {
                navigate('/dashboard', { replace: true });
              }
            } else if (event === 'SIGNED_OUT') {
              setUser(null);
              // Redirect to landing page if not already there
              const currentPath = window.location.pathname;
              if (!currentPath.includes('/auth') && currentPath !== '/') {
                navigate('/', { replace: true });
              }
            }
          }
        );

        setInitialized(true);
        setLoading(false);

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('[Auth] Error initializing auth:', error);
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [loadUserData, navigate]);

  // Authentication functions
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
      navigate('/', { replace: true });
    } catch (error) {
      console.error('[Auth] Signout error:', error);
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

  const updateProfile = useCallback(async (updates: any) => {
    if (!user?.id) throw new Error('No user logged in');
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    
    if (error) throw error;
    
    // Reload user data
    const userData = await loadUserData(user);
    setUser(userData);
  }, [user, loadUserData]);

  const hasAccess = useCallback((resource: string): boolean => {
    if (!user) return false;
    
    if (user.usuario?.rol_especial === 'superuser' || user.usuario?.rol === 'superuser') {
      return true;
    }
    
    if (user.usuario?.rol === 'admin') {
      return !resource.includes('superuser');
    }
    
    return ['dashboard', 'carta-porte', 'profile', 'socios', 'vehiculos', 'conductores'].some(allowed => resource.includes(allowed));
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user, 
      session,
      loading, 
      initialized,
      hasAccess,
      signOut,
      signIn,
      signUp,
      signInWithGoogle,
      resendConfirmation,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
