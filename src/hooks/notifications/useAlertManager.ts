
import { useMemo, useCallback } from 'react';
import { useTrialManager } from '../useTrialManager';
import { useSuperuser } from '../useSuperuser';
import { AlertConfig } from '@/types/alerts';

export const useAlertManager = () => {
  const { 
    isInActiveTrial, 
    isTrialExpired, 
    isInGracePeriod, 
    daysRemaining, 
    graceDaysRemaining,
    dataWillBeDeleted,
    getUrgencyLevel 
  } = useTrialManager();
  
  const { isSuperuser } = useSuperuser();

  const generateAlerts = useCallback((): AlertConfig[] => {
    // Superusers no ven alertas
    if (isSuperuser) return [];

    const alerts: AlertConfig[] = [];

    // Alerta crítica: datos serán eliminados
    if (dataWillBeDeleted) {
      alerts.push({
        id: 'data-deletion-warning',
        type: 'critical',
        title: '¡URGENTE! Datos serán eliminados',
        message: `Tus datos serán eliminados permanentemente en ${graceDaysRemaining} día${graceDaysRemaining !== 1 ? 's' : ''}. Adquiere un plan ahora para evitar la pérdida.`,
        action: 'Adquirir Plan YA',
        dismissible: false,
        persistent: true
      });
      return alerts;
    }

    // Período de gracia
    if (isInGracePeriod) {
      const urgency = getUrgencyLevel();
      alerts.push({
        id: 'grace-period-warning',
        type: urgency === 'high' ? 'critical' : 'warning',
        title: 'Período de Gracia Activo',
        message: `Tu período de gracia termina en ${graceDaysRemaining} día${graceDaysRemaining !== 1 ? 's' : ''}. Solo tienes acceso de lectura.`,
        action: 'Elegir Plan',
        dismissible: urgency !== 'high'
      });
    }

    // Trial activo próximo a vencer
    if (isInActiveTrial && daysRemaining <= 3) {
      alerts.push({
        id: 'trial-ending-soon',
        type: daysRemaining <= 1 ? 'warning' : 'info',
        title: 'Trial Termina Pronto',
        message: `Tu período de prueba termina en ${daysRemaining} día${daysRemaining !== 1 ? 's' : ''}. Elige un plan para continuar.`,
        action: 'Ver Planes',
        dismissible: true
      });
    }

    // Trial expirado
    if (isTrialExpired && !isInGracePeriod) {
      alerts.push({
        id: 'trial-expired',
        type: 'warning',
        title: 'Trial Expirado',
        message: 'Tu período de prueba ha terminado. Elige un plan para continuar usando todas las funciones.',
        action: 'Adquirir Plan',
        dismissible: false
      });
    }

    return alerts;
  }, [
    isSuperuser, 
    isInActiveTrial, 
    isTrialExpired, 
    isInGracePeriod, 
    daysRemaining, 
    graceDaysRemaining, 
    dataWillBeDeleted, 
    getUrgencyLevel
  ]);

  const dismissAlert = useCallback((alertId: string) => {
    // Guardar en localStorage para recordar alertas dismissadas
    const dismissed = JSON.parse(localStorage.getItem('dismissedAlerts') || '[]');
    const newDismissed = [...dismissed, alertId];
    localStorage.setItem('dismissedAlerts', JSON.stringify(newDismissed));
  }, []);

  const visibleAlerts = useMemo(() => {
    const dismissed = JSON.parse(localStorage.getItem('dismissedAlerts') || '[]');
    return generateAlerts().filter(alert => 
      !alert.dismissible || !dismissed.includes(alert.id)
    );
  }, [generateAlerts]);

  return {
    generateAlerts: () => visibleAlerts,
    dismissAlert,
    hasActiveAlerts: visibleAlerts.length > 0,
    criticalAlertsCount: visibleAlerts.filter(a => a.type === 'critical').length
  };
};
