
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

export const useAuthRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // No hacer nada si aún está cargando
    if (loading) return;

    // Si el usuario está autenticado y está en landing page o auth, redirigir al dashboard
    if (user && (location.pathname === '/' || location.pathname.startsWith('/auth'))) {
      console.log('[AuthRedirect] Usuario autenticado detectado, redirigiendo al dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  return { user, loading };
};
