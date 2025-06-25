
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { toast } from 'sonner';

interface TrialExpiredGuardProps {
  children: React.ReactNode;
}

/**
 * Interceptor global que redirige usuarios con trial expirado a la página de planes
 * Solo permite acceso a rutas de facturación/planes para usuarios con trial expirado
 */
export function TrialExpiredGuard({ children }: TrialExpiredGuardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const permissions = useUnifiedPermissionsV2();

  // Rutas permitidas para usuarios con trial expirado
  const allowedRoutesForExpiredTrial = [
    '/planes',
    '/suscripcion', 
    '/billing',
    '/facturacion',
    '/auth',
    '/login',
    '/logout'
  ];

  useEffect(() => {
    // Solo interceptar si el usuario está autenticado
    if (!permissions.isAuthenticated) return;

    // Solo interceptar si el trial ha expirado
    if (permissions.accessLevel !== 'expired' || !permissions.accessReason.includes('TRIAL_EXPIRED')) {
      return;
    }

    // Verificar si la ruta actual está permitida
    const currentPath = location.pathname;
    const isAllowedRoute = allowedRoutesForExpiredTrial.some(route => 
      currentPath.startsWith(route)
    );

    if (!isAllowedRoute) {
      console.log('[TrialExpiredGuard] 🚫 Bloqueando acceso a:', currentPath);
      console.log('[TrialExpiredGuard] 📅 Días restantes:', permissions.planInfo.daysRemaining);
      
      // Mostrar mensaje de error específico
      toast.error('Tu período de prueba ha finalizado. Por favor, elige un plan para continuar.', {
        duration: 5000,
        action: {
          label: 'Ver Planes',
          onClick: () => navigate('/planes')
        }
      });

      // Redirigir a la página de planes
      navigate('/planes', { replace: true });
    }
  }, [permissions, location.pathname, navigate]);

  // Si el trial no ha expirado o estamos en una ruta permitida, mostrar contenido normal
  return <>{children}</>;
}
