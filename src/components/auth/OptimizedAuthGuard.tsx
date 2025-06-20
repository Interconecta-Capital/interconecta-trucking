
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useLocation } from 'react-router-dom';

interface OptimizedAuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function OptimizedAuthGuard({ children, fallback }: OptimizedAuthGuardProps) {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se inicializa la autenticación
  if (loading || !initialized) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Redirigir a login si no hay usuario
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
