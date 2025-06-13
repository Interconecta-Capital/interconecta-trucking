
import { ReactNode, useEffect } from 'react';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';
import { useLocation, useNavigate } from 'react-router-dom';

interface EnhancedAuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function EnhancedAuthGuard({ children, requireAuth = true }: EnhancedAuthGuardProps) {
  const { user, loading, initialized } = useEnhancedAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!initialized || loading) return;

    console.log('[EnhancedAuthGuard] Checking auth state:', { 
      user: !!user, 
      requireAuth, 
      pathname: location.pathname 
    });

    if (requireAuth && !user) {
      // User needs to be authenticated but isn't
      console.log('[EnhancedAuthGuard] Redirecting to auth page');
      navigate('/auth', { replace: true });
    } else if (!requireAuth && user) {
      // User is authenticated but on a public page (like auth page)
      console.log('[EnhancedAuthGuard] Redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, initialized, requireAuth, navigate, location.pathname]);

  if (loading || !initialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-interconecta-primary"></div>
      </div>
    );
  }

  // If requireAuth is true and no user, don't render children (will redirect)
  if (requireAuth && !user) {
    return null;
  }

  // If requireAuth is false and user exists, don't render children (will redirect)
  if (!requireAuth && user) {
    return null;
  }

  return <>{children}</>;
}
