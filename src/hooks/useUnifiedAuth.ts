
import { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface Profile {
  id: string;
  nombre: string;
  email: string;
  empresa?: string;
  rfc?: string;
  telefono?: string;
  avatar_url?: string; // Added missing property
  created_at: string;
  trial_end_date?: string;
  plan_type?: string;
}

interface Usuario {
  id: string;
  nombre: string;
  rol: string;
  rol_especial?: string;
  tenant_id?: string;
}

interface Tenant {
  id: string;
  nombre_empresa: string;
  rfc_empresa: string;
}

interface UnifiedUser extends User {
  profile?: Profile;
  usuario?: Usuario; // Added missing property
  tenant?: Tenant; // Added missing property
}

export function useUnifiedAuth() {
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false); // Added missing property
  const initRef = useRef(false);

  // Load profile data
  const { data: profile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error loading profile:', error);
        return null;
      }
      
      return data as Profile;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000
  });

  // Load usuario data
  const { data: usuario } = useQuery({
    queryKey: ['user-usuario', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('auth_user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error loading usuario:', error);
        return null;
      }
      
      return data as Usuario;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000
  });

  // Load tenant data
  const { data: tenant } = useQuery({
    queryKey: ['user-tenant', usuario?.tenant_id],
    queryFn: async () => {
      if (!usuario?.tenant_id) return null;
      
      const { data, error } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', usuario.tenant_id)
        .maybeSingle();
      
      if (error) {
        console.error('Error loading tenant:', error);
        return null;
      }
      
      return data as Tenant;
    },
    enabled: !!usuario?.tenant_id,
    staleTime: 5 * 60 * 1000
  });

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const initializeAuth = async () => {
      try {
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('[UnifiedAuth] Auth state change:', event, !!session?.user);
            setUser(session?.user ?? null);
            
            if (event !== 'TOKEN_REFRESHED') {
              setLoading(false);
              setInitialized(true);
            }
          }
        );

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[UnifiedAuth] Error getting session:', error);
        } else {
          setUser(session?.user ?? null);
        }

        setInitialized(true);
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('[UnifiedAuth] Error initializing:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Update user with additional data when available
  useEffect(() => {
    if (user && (profile || usuario || tenant)) {
      setUser(prev => prev ? { 
        ...prev, 
        profile,
        usuario,
        tenant
      } : null);
    }
  }, [user, profile, usuario, tenant]);

  return {
    user,
    loading,
    initialized,
    isAuthenticated: !!user
  };
}
