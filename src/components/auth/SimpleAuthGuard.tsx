
import { ReactNode, useEffect } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useNavigate, useLocation } from 'react-router-dom';

interface SimpleAuthGuardProps {
  children: ReactNode;
}

export function SimpleAuthGuard({ children }: SimpleAuthGuardProps) {
  const { user, loading } = useSimpleAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      console.log('[SimpleAuthGuard] User not authenticated, redirecting to auth');
      navigate('/auth', { replace: true, state: { from: location } });
    }
  }, [user, loading, navigate, location]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-interconecta-primary"></div>
          <p className="text-sm text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return <>{children}</>;
}
