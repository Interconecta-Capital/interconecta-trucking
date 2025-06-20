
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSimpleAccessControl } from '@/hooks/useSimpleAccessControl';
import { useAuth } from '@/hooks/useAuth';
import { useSuscripcion } from '@/hooks/useSuscripcion';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export const AccessControlDebug = () => {
  const [isVisible, setIsVisible] = useState(true); // Siempre visible para debug
  const { user } = useAuth();
  const { suscripcion } = useSuscripcion();
  const accessControl = useSimpleAccessControl();

  if (!user) {
    return null;
  }

  const now = new Date();
  const userCreatedAt = user?.created_at ? new Date(user.created_at) : null;
  const trialEndDate = userCreatedAt ? new Date(userCreatedAt.getTime() + (14 * 24 * 60 * 60 * 1000)) : null;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <span>🔍 Debug de Acceso SIMPLE</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
          >
            {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      {isVisible && (
        <CardContent className="space-y-3 text-xs">
          {/* Estado del Usuario */}
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-800">👤 Usuario</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>ID: {user?.id?.substring(0, 8)}...</div>
              <div>Email: {user?.email}</div>
              <div>Creado: {userCreatedAt?.toLocaleDateString('es-MX')}</div>
              <div>Trial hasta: {trialEndDate?.toLocaleDateString('es-MX')}</div>
            </div>
          </div>

          {/* Estado del Trial */}
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-800">⏱️ Trial (14 días desde creación)</h4>
            <div className="space-y-1">
              <div>Días restantes: 
                <Badge variant={accessControl.daysRemaining > 0 ? "default" : "destructive"} className="ml-1">
                  {accessControl.daysRemaining}
                </Badge>
              </div>
              <div>Trial activo: 
                <Badge variant={accessControl.isInActiveTrial ? "default" : "destructive"} className="ml-1">
                  {accessControl.isInActiveTrial ? "SÍ" : "NO"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Estado de Suscripción */}
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-800">💳 Suscripción</h4>
            <div className="space-y-1">
              <div>Status: 
                <Badge variant="outline" className="ml-1">
                  {suscripcion?.status || 'N/A'}
                </Badge>
              </div>
              <div>Plan: {suscripcion?.plan?.nombre || 'N/A'}</div>
            </div>
          </div>

          {/* Estado Final Simple */}
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-800">🚦 Control de Acceso SIMPLE</h4>
            <div className="space-y-1">
              <div>Acceso completo: 
                <Badge variant={accessControl.hasFullAccess ? "default" : "destructive"} className="ml-1">
                  {accessControl.hasFullAccess ? "SÍ" : "NO"}
                </Badge>
              </div>
              <div>Bloqueado: 
                <Badge variant={accessControl.isBlocked ? "destructive" : "default"} className="ml-1">
                  {accessControl.isBlocked ? "SÍ" : "NO"}
                </Badge>
              </div>
              <div>Puede crear: 
                <Badge variant={accessControl.canCreateContent ? "default" : "destructive"} className="ml-1">
                  {accessControl.canCreateContent ? "SÍ" : "NO"}
                </Badge>
              </div>
              <div>Plan actual: {accessControl.planName}</div>
            </div>
          </div>

          {/* Mensaje de Estado */}
          <div className="space-y-2">
            <h4 className="font-semibold text-blue-800">💬 Mensaje</h4>
            <div className="text-xs bg-white p-2 rounded border">
              <strong>Estado:</strong> {accessControl.statusMessage}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
