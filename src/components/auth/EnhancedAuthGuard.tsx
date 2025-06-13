
import { ReactNode, useEffect } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import { useLocation, useNavigate } from 'react-router-dom';

interface EnhancedAuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function EnhancedAuthGuard({ children, requireAuth = true }: EnhancedAuthGuardProps) {
  const { user, loading } = useSimpleAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    console.log('[EnhancedAuthGuard] Checking auth state:', { 
      user: !!user, 
      requireAuth, 
      pathname: location.pathname 
    });

    if (requireAuth && !user) {
      // User needs to be authenticated but isn't
      console.log('[EnhancedAuthGuard] Redirecting to auth page');
      navigate('/auth', { replace: true });
    } else if (!requireAuth && user && location.pathname === '/auth') {
      // User is authenticated and specifically on the auth page, redirect to dashboard
      console.log('[EnhancedAuthGuard] User is authenticated on auth page, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, requireAuth, navigate, location.pathname]);

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

  // If requireAuth is true and no user, don't render children (will redirect)
  if (requireAuth && !user) {
    return null;
  }

  // If user is authenticated and specifically on /auth page, don't render children (will redirect)
  if (!requireAuth && user && location.pathname === '/auth') {
    return null;
  }

  return <>{children}</>;
}
