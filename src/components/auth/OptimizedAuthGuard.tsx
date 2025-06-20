
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface OptimizedAuthGuardProps {
  children: React.ReactNode;
}

export function OptimizedAuthGuard({ children }: OptimizedAuthGuardProps) {
  const { user, loading, initialized } = useUnifiedAuth();
  const navigate = useNavigate();
  const [timeoutReached, setTimeoutReached] = useState(false);

  // Timeout optimizado - 10 segundos
  useEffect(() => {
    if (loading && !initialized) {
      const timeout = setTimeout(() => {
        console.warn('[OptimizedAuthGuard] Authentication timeout reached');
        setTimeoutReached(true);
      }, 10000);

      return () => clearTimeout(timeout);
    } else {
      setTimeoutReached(false);
    }
  }, [loading, initialized]);

  // Loading state optimizado
  if (loading && !timeoutReached && !initialized) {
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

  // Handle timeout or no user
  if ((timeoutReached && !user) || (!user && !loading && initialized)) {
    navigate('/auth', { replace: true });
    return null;
  }

  return <>{children}</>;
}
