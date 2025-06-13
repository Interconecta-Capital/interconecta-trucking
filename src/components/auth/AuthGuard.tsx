
import { useAuth } from '@/hooks/useAuth';
import { useDebugMonitor } from '@/hooks/useDebugMonitor';
import { useEffect } from 'react';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const { logEvent } = useDebugMonitor();

  useEffect(() => {
    logEvent('auth_guard_check', {
      hasUser: !!user,
      loading,
      userId: user?.id,
    });
  }, [user, loading, logEvent]);

  // Show loading state
  if (loading) {
    logEvent('auth_guard_loading', { timestamp: Date.now() });
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    logEvent('auth_guard_redirect', { 
      reason: 'no_user',
      currentUrl: window.location.href 
    });
    
    // Use programmatic navigation instead of window.location.href
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/auth');
      window.location.reload();
    }
    return null;
  }

  logEvent('auth_guard_allowed', { 
    userId: user.id,
    userEmail: user.email 
  });

  return <>{children}</>;
}
