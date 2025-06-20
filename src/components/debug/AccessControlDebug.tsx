
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePermissionCheck } from '@/hooks/useUnifiedAccessControl';
import { useAuth } from '@/hooks/useAuth';
import { useSuscripcion } from '@/hooks/useSuscripcion';
import { useTrialTracking } from '@/hooks/useTrialTracking';
import { useSuperuser } from '@/hooks/useSuperuser';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export const AccessControlDebug = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();
  const { isSuperuser } = useSuperuser();
  const { suscripcion, estaBloqueado } = useSuscripcion();
  const { trialInfo } = useTrialTracking();
  const accessControl = usePermissionCheck();

  if (!user || (!isSuperuser && !isVisible)) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-sm">
            <span>Debug de Acceso</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(!isVisible)}
            >
              {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        {!isSuperuser && (
          <CardContent>
            <p className="text-xs text-blue-700">Click el ojo para ver debug info</p>
          </CardContent>
        )}
      </Card>
    );
  }

  const now = new Date();
  const trialEndDate = trialInfo?.trialEndDate ? new Date(trialInfo.trialEndDate) : null;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-sm">
          <span>🔍 Debug de Control de Acceso</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(!isVisible)}
          >
            <EyeOff className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {/* Estado del Usuario */}
        <div className="space-y-2">
          <h4 className="font-semibold text-blue-800">👤 Usuario</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>ID: {user?.id?.substring(0, 8)}...</div>
            <div>Email: {user?.email}</div>
            <div>Superuser: 
              <Badge variant={isSuperuser ? "default" : "secondary"} className="ml-1">
                {isSuperuser ? "SÍ" : "NO"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Estado del Trial */}
        <div className="space-y-2">
          <h4 className="font-semibold text-blue-800">⏱️ Trial</h4>
          <div className="space-y-1">
            <div>Fecha fin trial: {trialEndDate?.toLocaleDateString('es-MX') || 'N/A'}</div>
            <div>Fecha actual: {now.toLocaleDateString('es-MX')}</div>
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
            <div>Bloqueado admin: 
              <Badge variant={estaBloqueado() ? "destructive" : "default"} className="ml-1">
                {estaBloqueado() ? "SÍ" : "NO"}
              </Badge>
            </div>
            <div>Fecha vencimiento: {suscripcion?.fecha_vencimiento || 'N/A'}</div>
          </div>
        </div>

        {/* Estado Final de Acceso */}
        <div className="space-y-2">
          <h4 className="font-semibold text-blue-800">🚦 Control de Acceso Final</h4>
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
            <div>Puede ver: 
              <Badge variant={accessControl.canViewContent ? "default" : "destructive"} className="ml-1">
                {accessControl.canViewContent ? "SÍ" : "NO"}
              </Badge>
            </div>
            <div>Tipo restricción: 
              <Badge variant="outline" className="ml-1">
                {accessControl.restrictionType}
              </Badge>
            </div>
            <div>Plan actual: {accessControl.planName}</div>
          </div>
        </div>

        {/* Mensaje de Estado */}
        <div className="space-y-2">
          <h4 className="font-semibold text-blue-800">💬 Mensajes</h4>
          <div className="space-y-1">
            <div className="text-xs bg-white p-2 rounded border">
              <strong>Estado:</strong> {accessControl.statusMessage}
            </div>
            {accessControl.actionRequired && (
              <div className="text-xs bg-yellow-100 p-2 rounded border border-yellow-300">
                <strong>Acción requerida:</strong> {accessControl.actionRequired}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
