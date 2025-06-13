
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useEnhancedPermissions } from '@/hooks/useEnhancedPermissions';
import { useTrialManager } from '@/hooks/useTrialManager';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, TrendingUp, X, Crown, Gift, Clock, Trash2 } from 'lucide-react';
import { useSuscripcion } from '@/hooks/useSuscripcion';

export function PlanNotifications() {
  const { 
    obtenerUsoActual, 
    estaBloqueado, 
    suscripcionVencida, 
    isSuperuser 
  } = useEnhancedPermissions();
  const { 
    isInActiveTrial, 
    isTrialExpired,
    isInGracePeriod,
    daysRemaining, 
    graceDaysRemaining,
    dataWillBeDeleted,
    getContextualMessage,
    getUrgencyLevel
  } = useTrialManager();
  const { enPeriodoPrueba, diasRestantesPrueba, enPeriodoGracia, diasRestantesGracia } = useSuscripcion();
  const navigate = useNavigate();
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Superusers no ven notificaciones excepto su badge
  if (isSuperuser) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50 mb-4">
        <Crown className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Modo Superuser:</strong> Acceso completo sin restricciones de plan o límites.
        </AlertDescription>
      </Alert>
    );
  }

  const usoActual = obtenerUsoActual();
  const alerts = [];

  // Alertas críticas de período de gracia
  if (isInGracePeriod && dataWillBeDeleted) {
    alerts.push({
      id: 'grace-critical',
      type: 'critical',
      title: `¡DATOS SERÁN ELIMINADOS EN ${graceDaysRemaining} ${graceDaysRemaining === 1 ? 'DÍA' : 'DÍAS'}!`,
      message: 'Tus datos serán eliminados permanentemente. Adquiere un plan ahora para conservar toda tu información.',
      action: 'Comprar Plan AHORA',
      priority: 1,
      icon: Trash2
    });
  } else if (isInGracePeriod) {
    alerts.push({
      id: 'grace-period',
      type: 'warning',
      title: `Período de gracia: ${graceDaysRemaining} días restantes`,
      message: 'Estás en modo solo lectura. Adquiere un plan para recuperar todas las funciones y mantener tus datos.',
      action: 'Ver Planes',
      priority: 2,
      icon: Clock
    });
  }

  // Alertas críticas de bloqueo
  if (estaBloqueado) {
    alerts.push({
      id: 'blocked',
      type: 'critical',
      title: 'Cuenta Bloqueada',
      message: 'Su cuenta está bloqueada por falta de pago. Renueve su suscripción para continuar.',
      action: 'Renovar Suscripción',
      priority: 1
    });
  } else if (suscripcionVencida || (isTrialExpired && !isInGracePeriod)) {
    alerts.push({
      id: 'expired',
      type: 'critical',
      title: 'Trial Expirado',
      message: 'Su período de prueba de 14 días ha terminado. Seleccione un plan para continuar.',
      action: 'Ver Planes',
      priority: 2
    });
  }

  // Alertas de trial activo
  if (isInActiveTrial) {
    if (daysRemaining <= 3) {
      alerts.push({
        id: 'trial-ending',
        type: 'warning',
        title: `Trial termina en ${daysRemaining} ${daysRemaining === 1 ? 'día' : 'días'}`,
        message: 'Está disfrutando de acceso completo durante su prueba. Elija un plan para continuar sin interrupción.',
        action: 'Ver Planes',
        priority: 3
      });
    } else if (daysRemaining <= 7) {
      alerts.push({
        id: 'trial-week-left',
        type: 'info',
        title: `${daysRemaining} días de trial restantes`,
        message: 'Explore todas las funciones disponibles y encuentre el plan perfecto para su negocio.',
        action: 'Ver Planes',
        priority: 4
      });
    }
  }

  // Alertas de límites (solo para usuarios con plan pagado)
  if (!isInActiveTrial && !isTrialExpired && !isInGracePeriod) {
    Object.entries(usoActual).forEach(([resource, data]) => {
      if (data.limite !== null && data.limite !== undefined) {
        const porcentaje = (data.usado / data.limite) * 100;
        
        if (porcentaje >= 100) {
          alerts.push({
            id: `limit-exceeded-${resource}`,
            type: 'error',
            title: `Límite de ${resource.replace('_', ' ')} excedido`,
            message: `Ha alcanzado el límite de ${data.limite}. Actualice su plan para continuar.`,
            action: 'Actualizar Plan',
            priority: 5
          });
        } else if (porcentaje >= 90) {
          alerts.push({
            id: `limit-warning-${resource}`,
            type: 'warning',
            title: `Cerca del límite de ${resource.replace('_', ' ')}`,
            message: `Ha usado ${data.usado} de ${data.limite}. Considere actualizar su plan.`,
            action: 'Ver Planes',
            priority: 6
          });
        }
      }
    });
  }

  // Filtrar alertas dismisseadas y ordenar por prioridad
  const visibleAlerts = alerts
    .filter(alert => !dismissedAlerts.has(alert.id))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 2); // Mostrar máximo 2 alertas para no saturar

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-red-200 bg-red-50 animate-pulse';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-orange-200 bg-orange-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getAlertIcon = (alert: any) => {
    if (alert.icon) return alert.icon;
    
    switch (alert.type) {
      case 'critical':
      case 'error':
      case 'warning':
        return AlertTriangle;
      case 'info':
        return isInActiveTrial ? Gift : Clock;
      default:
        return TrendingUp;
    }
  };

  const getButtonStyle = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-600 hover:bg-red-700 text-white animate-pulse';
      case 'error':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-orange-600 hover:bg-orange-700 text-white';
      default:
        return '';
    }
  };

  // Mostrar notificación de bienvenida al trial si es nuevo usuario
  if (isInActiveTrial && daysRemaining >= 10 && !dismissedAlerts.has('trial-welcome')) {
    visibleAlerts.unshift({
      id: 'trial-welcome',
      type: 'info',
      title: '¡Bienvenido a su Trial Completo de 14 días!',
      message: `Tiene acceso completo a todas las funciones por ${daysRemaining} días. Explore sin límites.`,
      action: 'Explorar Funciones',
      priority: 0
    });
  }

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {visibleAlerts.map((alert) => {
        const Icon = getAlertIcon(alert);
        return (
          <Alert key={alert.id} className={getAlertStyle(alert.type)}>
            <Icon className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div className="flex-1">
                <div className={`font-medium ${alert.type === 'critical' ? 'text-red-900' : ''}`}>
                  {alert.title}
                </div>
                <div className={`text-sm ${alert.type === 'critical' ? 'text-red-800' : ''}`}>
                  {alert.message}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button 
                  size="sm" 
                  onClick={() => navigate('/planes')}
                  className={`shrink-0 ${getButtonStyle(alert.type)}`}
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {alert.action}
                </Button>
                {alert.type !== 'critical' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => dismissAlert(alert.id)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}
