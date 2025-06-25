
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { toast } from 'sonner';

interface TrialExpiredGuardProps {
  children: React.ReactNode;
}

/**
 * Interceptor global actualizado para el sistema Freemium
 * Ya no bloquea a usuarios con trial expirado, sino que los deja usar la app con límites
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

    // NUEVO: Solo interceptar si el usuario está completamente bloqueado (no freemium)
    if (permissions.accessLevel !== 'blocked') {
      return;
    }

    // Verificar si la ruta actual está permitida
    const currentPath = location.pathname;
    const isAllowedRoute = allowedRoutesForExpiredTrial.some(route => 
      currentPath.startsWith(route)
    );

    if (!isAllowedRoute) {
      console.log('[TrialExpiredGuard] 🚫 Bloqueando acceso a:', currentPath);
      
      // Mostrar mensaje de error específico
      toast.error('Tu cuenta está bloqueada. Por favor, actualiza tu plan para continuar.', {
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

  // Mostrar contenido normal (ahora incluye usuarios freemium)
  return <>{children}</>;
}
