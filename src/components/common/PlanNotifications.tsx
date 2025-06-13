
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useEnhancedPermissions } from '@/hooks/useEnhancedPermissions';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, TrendingUp, X, Crown } from 'lucide-react';
import { useSuscripcion } from '@/hooks/useSuscripcion';

export function PlanNotifications() {
  const { 
    obtenerUsoActual, 
    estaBloqueado, 
    suscripcionVencida, 
    isSuperuser 
  } = useEnhancedPermissions();
  const { enPeriodoPrueba, diasRestantesPrueba } = useSuscripcion();
  const navigate = useNavigate();
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Superusers no ven notificaciones
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

  // Alertas críticas
  if (estaBloqueado) {
    alerts.push({
      id: 'blocked',
      type: 'critical',
      title: 'Cuenta Bloqueada',
      message: 'Su cuenta está bloqueada por falta de pago. Renueve su suscripción para continuar.',
      action: 'Renovar Suscripción',
      priority: 1
    });
  } else if (suscripcionVencida) {
    alerts.push({
      id: 'expired',
      type: 'critical',
      title: 'Suscripción Vencida',
      message: 'Su suscripción ha vencido. Renueve ahora para evitar la suspensión del servicio.',
      action: 'Renovar Plan',
      priority: 2
    });
  }

  // Alertas de período de prueba
  if (enPeriodoPrueba()) {
    const dias = diasRestantesPrueba();
    if (dias <= 3) {
      alerts.push({
        id: 'trial-ending',
        type: 'warning',
        title: `Prueba termina en ${dias} ${dias === 1 ? 'día' : 'días'}`,
        message: 'Elija un plan para continuar usando todas las funcionalidades.',
        action: 'Ver Planes',
        priority: 3
      });
    }
  }

  // Alertas de límites
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
          priority: 4
        });
      } else if (porcentaje >= 90) {
        alerts.push({
          id: `limit-warning-${resource}`,
          type: 'warning',
          title: `Cerca del límite de ${resource.replace('_', ' ')}`,
          message: `Ha usado ${data.usado} de ${data.limite}. Considere actualizar su plan.`,
          action: 'Ver Planes',
          priority: 5
        });
      }
    }
  });

  // Filtrar alertas dismisseadas y ordenar por prioridad
  const visibleAlerts = alerts
    .filter(alert => !dismissedAlerts.has(alert.id))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 3); // Mostrar máximo 3 alertas

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
      case 'error':
      case 'warning':
        return AlertTriangle;
      default:
        return TrendingUp;
    }
  };

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {visibleAlerts.map((alert) => {
        const Icon = getAlertIcon(alert.type);
        return (
          <Alert key={alert.id} className={getAlertStyle(alert.type)}>
            <Icon className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium">{alert.title}</div>
                <div className="text-sm">{alert.message}</div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button 
                  size="sm" 
                  onClick={() => navigate('/planes')}
                  className="shrink-0"
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {alert.action}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => dismissAlert(alert.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}
