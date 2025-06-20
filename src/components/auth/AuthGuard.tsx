
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Timeout para evitar loading infinito
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.warn('[AuthGuard] Authentication timeout reached');
        setTimeoutReached(true);
      }, 10000);

      return () => clearTimeout(timeout);
    } else {
      setTimeoutReached(false);
    }
  }, [loading]);

  // Mostrar loading mientras verifica autenticación
  if (loading && !timeoutReached) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Verificando autenticación...</p>
            <div className="w-48 bg-secondary rounded-full h-1 mx-auto">
              <div className="bg-primary h-1 rounded-full animate-pulse" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Redirigir a auth si no hay usuario
  if ((!user && !loading) || timeoutReached) {
    navigate('/auth', { replace: true });
    return null;
  }

  return <>{children}</>;
}
