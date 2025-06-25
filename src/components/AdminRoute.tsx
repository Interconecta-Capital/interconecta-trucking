
import React from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { canAccessAdmin } = usePermissions();

  if (!canAccessAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
