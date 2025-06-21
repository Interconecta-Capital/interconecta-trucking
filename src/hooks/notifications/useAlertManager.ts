
import { useState } from 'react';
import { useUnifiedPermissions } from '@/hooks/useUnifiedPermissions';
import { useTrialManager } from '@/hooks/useTrialManager';
import { useSuscripcion } from '@/hooks/useSuscripcion';
import { AlertTriangle, TrendingUp, Gift, Clock, Trash2 } from 'lucide-react';
import { AlertConfig } from '@/types/alerts';

export const useAlertManager = () => {
  const { 
    obtenerUsoActual, 
    estaBloqueado, 
    suscripcionVencida, 
    isSuperuser 
  } = useUnifiedPermissions();
  const { 
    isInActiveTrial, 
    isTrialExpired,
    isInGracePeriod,
    daysRemaining, 
    graceDaysRemaining,
    dataWillBeDeleted
  } = useTrialManager();
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const generateAlerts = (): AlertConfig[] => {
    const usoActual = obtenerUsoActual();
    const alerts: AlertConfig[] = [];

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
        if (data && typeof data === 'object' && 'limite' in data && 'usado' in data) {
          const resourceData = data as { limite: number | null; usado: number };
          
          if (resourceData.limite !== null && resourceData.limite !== undefined) {
            const porcentaje = (resourceData.usado / resourceData.limite) * 100;
            
            if (porcentaje >= 100) {
              alerts.push({
                id: `limit-exceeded-${resource}`,
                type: 'error',
                title: `Límite de ${resource.replace('_', ' ')} excedido`,
                message: `Ha alcanzado el límite de ${resourceData.limite}. Actualice su plan para continuar.`,
                action: 'Actualizar Plan',
                priority: 5
              });
            } else if (porcentaje >= 90) {
              alerts.push({
                id: `limit-warning-${resource}`,
                type: 'warning',
                title: `Cerca del límite de ${resource.replace('_', ' ')}`,
                message: `Ha usado ${resourceData.usado} de ${resourceData.limite}. Considere actualizar su plan.`,
                action: 'Ver Planes',
                priority: 6
              });
            }
          }
        }
      });
    }

    // Mostrar notificación de bienvenida al trial si es nuevo usuario
    if (isInActiveTrial && daysRemaining >= 10 && !dismissedAlerts.has('trial-welcome')) {
      alerts.unshift({
        id: 'trial-welcome',
        type: 'info',
        title: '¡Bienvenido a su Trial Completo de 14 días!',
        message: `Tiene acceso completo a todas las funciones por ${daysRemaining} días. Explore sin límites.`,
        action: 'Explorar Funciones',
        priority: 0
      });
    }

    // Filtrar alertas dismisseadas y ordenar por prioridad
    return alerts
      .filter(alert => !dismissedAlerts.has(alert.id))
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 2); // Mostrar máximo 2 alertas para no saturar
  };

  return {
    generateAlerts,
    dismissAlert,
    dismissedAlerts
  };
};
