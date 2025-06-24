
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSuscripcion } from '@/hooks/useSuscripcion';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';
import { LimitUsageIndicator } from '@/components/common/LimitUsageIndicator';
import { Crown, Zap, Clock, Settings, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PlanSummaryCard = () => {
  const { 
    suscripcion, 
    enPeriodoPrueba, 
    diasRestantesPrueba,
    suscripcionVencida,
    estaBloqueado,
    abrirPortalCliente,
    isOpeningPortal
  } = useSuscripcion();
  
  const permissions = useUnifiedPermissionsV2();

  if (!suscripcion) return null;

  const getPlanIcon = () => {
    if (enPeriodoPrueba()) return <Clock className="h-4 w-4" />;
    
    switch (suscripcion.plan?.nombre) {
      case 'Básico':
        return <Zap className="h-4 w-4" />;
      case 'Profesional':
      case 'Empresarial':
        return <Crown className="h-4 w-4" />;
      default:
        return <Zap className="h-4 w-4" />;
    }
  };

  const getPlanColor = () => {
    if (estaBloqueado || suscripcionVencida()) return 'destructive';
    if (enPeriodoPrueba()) return 'secondary';
    
    switch (suscripcion.plan?.nombre) {
      case 'Básico':
        return 'outline';
      case 'Profesional':
        return 'default';
      case 'Empresarial':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getStatusMessage = () => {
    if (estaBloqueado) return '¡Cuenta bloqueada por falta de pago!';
    if (suscripcionVencida()) return '¡Suscripción vencida!';
    if (enPeriodoPrueba()) {
      const dias = diasRestantesPrueba();
      return `${dias} día${dias !== 1 ? 's' : ''} restante${dias !== 1 ? 's' : ''} de prueba`;
    }
    return 'Suscripción activa';
  };

  const showUpgradePrompt = () => {
    return enPeriodoPrueba() || suscripcion.plan?.nombre === 'Básico';
  };

  const handlePortalClick = () => {
    abrirPortalCliente();
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getPlanIcon()}
            Plan {suscripcion.plan?.nombre || 'Desconocido'}
          </CardTitle>
          <Badge variant={getPlanColor()} className="flex items-center gap-1">
            {estaBloqueado && <AlertTriangle className="h-3 w-3" />}
            {getStatusMessage()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumen de uso */}
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(permissions.usage).map(([key, data]) => (
            <div key={key} className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground capitalize">
                {key.replace('_', ' ')}
              </div>
              <LimitUsageIndicator 
                resourceType={key as any} 
                showDetails={false}
                className="text-xs"
              />
            </div>
          ))}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 pt-2">
          {showUpgradePrompt() && (
            <Link to="/planes" className="flex-1">
              <Button className="w-full" size="sm">
                <Crown className="h-3 w-3 mr-1" />
                Mejorar Plan
              </Button>
            </Link>
          )}
          
          {suscripcion.status === 'active' && (
            <Button
              onClick={handlePortalClick}
              disabled={isOpeningPortal}
              variant="outline"
              size="sm"
              className={showUpgradePrompt() ? '' : 'flex-1'}
            >
              <Settings className="h-3 w-3 mr-1" />
              {isOpeningPortal ? 'Abriendo...' : 'Gestionar'}
            </Button>
          )}
        </div>

        {/* Mensaje de alerta si está cerca de límites */}
        {Object.entries(permissions.usage).some(([_, data]) => {
          if (data.limit === null) return false;
          return (data.used / data.limit) >= 0.8;
        }) && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-orange-800">
                <p className="font-medium">Te estás acercando a los límites de tu plan</p>
                <p>Considera actualizar para evitar interrupciones en el servicio.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
