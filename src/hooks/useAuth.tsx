
import { createContext, useContext, ReactNode } from 'react';
import { AuthContextType } from './auth/types';
import { useAuthState } from './auth/useAuthState';
import { useAuthActions } from './auth/useAuthActions';
import { checkUserAccess } from './auth/useAuthUtils';

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

  /**
   * Verifica si el usuario tiene acceso a un recurso específico
   */
  const hasAccess = (resource: string) => {
    return checkUserAccess(user?.usuario?.rol, resource);
  };

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
