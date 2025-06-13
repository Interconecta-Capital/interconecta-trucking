
import { ReactNode } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';

interface SimpleAuthGuardProps {
  children: ReactNode;
}

export function SimpleAuthGuard({ children }: SimpleAuthGuardProps) {
  const { user, loading } = useSimpleAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null; // El router se encarga de la redirección
  }

  return <>{children}</>;
}
