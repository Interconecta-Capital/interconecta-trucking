import { createContext, useContext, ReactNode, useEffect } from 'react';
import { AuthContextType } from './auth/types';
import { useAuthState } from './auth/useAuthState';
import { useAuthActions } from './auth/useAuthActions';
import { checkUserAccess } from './auth/useAuthUtils';
import { useSuscripcion } from './useSuscripcion';
import { supabase } from './supabase';

/**
 * Contexto de autenticación
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider de autenticación que combina estado y acciones
 * Proporciona toda la funcionalidad de autenticación a la aplicación
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // Hook para manejar el estado de autenticación
  const { user, loading } = useAuthState();
  
  // Hook para manejar las acciones de autenticación
  const authActions = useAuthActions();

  // Hook para manejar suscripciones
  const { verificarSuscripcion } = useSuscripcion();

  /**
   * Verifica si el usuario tiene acceso a un recurso específico
   * Ahora incluye verificación de superusuario
   */
  const hasAccess = async (resource: string) => {
    // Check if user is superuser first
    if (user?.id) {
      try {
        const { data } = await supabase
          .from('usuarios')
          .select('rol_especial')
          .eq('auth_user_id', user.id)
          .single();
        
        if (data?.rol_especial === 'superuser') {
          return true; // Superusers have access to everything
        }
      } catch (error) {
        console.error('Error checking superuser status:', error);
      }
    }

    return checkUserAccess(user?.usuario?.rol, resource);
  };

  // Verificar suscripción cuando el usuario se autentica
  useEffect(() => {
    if (user && !loading) {
      // Verificar el estado de la suscripción
      verificarSuscripcion();
    }
  }, [user, loading, verificarSuscripcion]);

  // Valor del contexto que incluye estado y todas las acciones
  const contextValue: AuthContextType = {
    user,
    loading,
    hasAccess,
    ...authActions,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para usar el contexto de autenticación
 * Debe ser usado dentro de un AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
