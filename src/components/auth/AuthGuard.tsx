
import { useAuth } from '@/hooks/useAuth';
import { useDebugMonitor } from '@/hooks/useDebugMonitor';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const { logEvent } = useDebugMonitor();
  const navigate = useNavigate();
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    logEvent('auth_guard_check', {
      hasUser: !!user,
      loading,
      userId: user?.id,
      currentPath: window.location.pathname,
    });
  }, [user, loading, logEvent]);

  // Timeout más corto para AuthGuard - 8 segundos
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.warn('[AuthGuard] Authentication timeout reached');
        logEvent('auth_guard_timeout', { 
          timestamp: Date.now(),
          timeoutDuration: 8000,
          currentPath: window.location.pathname
        });
        setTimeoutReached(true);
      }, 8000);

      return () => clearTimeout(timeout);
    } else {
      setTimeoutReached(false);
    }
  }, [loading, logEvent]);

  // Loading state más específico
  if (loading && !timeoutReached) {
    logEvent('auth_guard_loading', { 
      timestamp: Date.now(),
      currentPath: window.location.pathname 
    });
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Verificando autenticación...</p>
            <div className="w-48 bg-secondary rounded-full h-1 mx-auto">
              <div className="bg-primary h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle timeout case
  if (timeoutReached && !user) {
    logEvent('auth_guard_timeout_redirect', { 
      reason: 'timeout_no_user',
      currentUrl: window.location.href 
    });
    
    navigate('/auth', { replace: true });
    return null;
  }

  // Redirect to auth if not authenticated
  if (!user && !loading) {
    logEvent('auth_guard_redirect', { 
      reason: 'no_user',
      currentUrl: window.location.href 
    });
    
    navigate('/auth', { replace: true });
    return null;
  }

  logEvent('auth_guard_allowed', { 
    userId: user?.id,
    userEmail: user?.email,
    currentPath: window.location.pathname
  });

  return <>{children}</>;
}
