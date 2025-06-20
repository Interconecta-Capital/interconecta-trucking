
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
  created_at: string;
  trial_end_date?: string;
  plan_type?: string;
}

interface UnifiedUser extends User {
  profile?: Profile;
}

export function useUnifiedAuth() {
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  // Cargar profile del usuario
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
    staleTime: 5 * 60 * 1000 // 5 minutos
  });

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initializeAuth = async () => {
      try {
        // Configurar listener de cambios de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('[UnifiedAuth] Auth state change:', event, !!session?.user);
            setUser(session?.user ?? null);
            
            if (event !== 'TOKEN_REFRESHED') {
              setLoading(false);
            }
          }
        );

        // Obtener sesión inicial
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[UnifiedAuth] Error getting session:', error);
        } else {
          setUser(session?.user ?? null);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('[UnifiedAuth] Error initializing:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Actualizar usuario con profile cuando esté disponible
  useEffect(() => {
    if (user && profile) {
      setUser(prev => prev ? { ...prev, profile } : null);
    }
  }, [user, profile]);

  return {
    user,
    loading,
    isAuthenticated: !!user
  };
}
