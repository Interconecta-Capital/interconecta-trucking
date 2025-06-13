
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

  // Add timeout to prevent infinite loading - reduced to 5 seconds
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.warn('[AuthGuard] Authentication timeout reached');
        logEvent('auth_guard_timeout', { 
          timestamp: Date.now(),
          timeoutDuration: 5000,
          currentPath: window.location.pathname
        });
        setTimeoutReached(true);
      }, 5000); // Reduced to 5 second timeout

      return () => clearTimeout(timeout);
    } else {
      setTimeoutReached(false);
    }
  }, [loading, logEvent]);

  // Show loading state with timeout handling
  if (loading && !timeoutReached) {
    logEvent('auth_guard_loading', { 
      timestamp: Date.now(),
      currentPath: window.location.pathname 
    });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Verificando autenticación...</p>
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
    
    // Use React Router navigation instead of window.location.href
    navigate('/auth', { replace: true });
    return null;
  }

  // Redirect to auth if not authenticated
  if (!user && !loading) {
    logEvent('auth_guard_redirect', { 
      reason: 'no_user',
      currentUrl: window.location.href 
    });
    
    // Use React Router navigation
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
