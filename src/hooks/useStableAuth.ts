
import { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export function useStableAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);
  const authSubscription = useRef<any>(null);

  useEffect(() => {
    // Evitar múltiples inicializaciones
    if (initialized.current) return;
    initialized.current = true;

    const initializeAuth = async () => {
      try {
        console.log('[StableAuth] Initializing authentication...');
        
        // Configurar listener de cambios de estado de autenticación
        authSubscription.current = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('[StableAuth] Auth state change:', event, !!session?.user);
            setUser(session?.user ?? null);
            
            // Solo establecer loading como false después del primer evento
            if (event !== 'TOKEN_REFRESHED') {
              setLoading(false);
            }
          }
        );

        // Obtener sesión inicial
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('[StableAuth] Error getting initial session:', error);
        } else {
          console.log('[StableAuth] Initial session loaded:', !!session?.user);
          setUser(session?.user ?? null);
        }
        
      } catch (error) {
        console.error('[StableAuth] Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Cleanup function
    return () => {
      if (authSubscription.current?.data?.subscription) {
        authSubscription.current.data.subscription.unsubscribe();
      }
    };
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user
  };
}
