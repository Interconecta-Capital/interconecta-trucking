import { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const BETA_BANNER_DISMISSED_KEY = 'beta_banner_dismissed';

export function BetaBanner() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Solo mostrar si hay usuario autenticado y no fue cerrado en esta sesión
    if (user) {
      const dismissed = sessionStorage.getItem(BETA_BANNER_DISMISSED_KEY);
      if (!dismissed) {
        setIsVisible(true);
      }
    } else {
      setIsVisible(false);
    }
  }, [user]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem(BETA_BANNER_DISMISSED_KEY, 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-amber-950 py-2 px-4">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          <span>
            <strong>Versión Beta:</strong> Esta aplicación está en desarrollo. Pueden existir errores o funcionalidades incompletas.
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-6 w-6 p-0 hover:bg-amber-600/20 text-amber-950"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
