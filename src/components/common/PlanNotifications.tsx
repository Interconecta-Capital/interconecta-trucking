
import { useSimpleAccessControl } from '@/hooks/useSimpleAccessControl';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, TrendingUp } from 'lucide-react';

export function PlanNotifications() {
  const accessControl = useSimpleAccessControl();
  const navigate = useNavigate();

  // Solo mostrar notificaciones si NO tiene acceso completo
  if (accessControl.hasFullAccess) {
    return null;
  }

  // Solo mostrar si está bloqueado
  if (!accessControl.isBlocked) {
    return null;
  }

  return (
    <div className="mb-6">
      <Alert className="border-orange-200 bg-orange-50">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="flex items-center justify-between">
          <div className="text-orange-800">
            <div className="font-medium">Trial Expirado</div>
            <div className="text-sm mt-1">{accessControl.statusMessage}</div>
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/planes')}
            className="ml-4 bg-orange-600 hover:bg-orange-700 text-white"
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            Ver Planes
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
