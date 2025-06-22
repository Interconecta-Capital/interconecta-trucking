
import { useUnifiedPermissionsV2 } from '../useUnifiedPermissionsV2';
import { useState, useCallback } from 'react';

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  dismissible?: boolean;
}

/**
 * Hook para manejo de alertas - Migrado a useUnifiedPermissionsV2
 */
export const useAlertManager = () => {
  const permissions = useUnifiedPermissionsV2();
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const generateAlerts = useCallback((): Alert[] => {
    const alerts: Alert[] = [];

    // No generar alertas para superusuarios
    if (permissions.accessLevel === 'superuser') {
      return alerts;
    }

    // Cuenta bloqueada - Crítico
    if (permissions.accessLevel === 'blocked') {
      alerts.push({
        id: 'account-blocked',
        type: 'critical',
        title: 'Cuenta Bloqueada',
        message: permissions.accessReason,
        dismissible: false
      });
    }

    // Plan expirado - Crítico
    else if (permissions.accessLevel === 'expired') {
      alerts.push({
        id: 'plan-expired',
        type: 'critical',
        title: 'Plan Expirado',
        message: permissions.accessReason,
        dismissible: false
      });
    }

    // Trial activo con pocos días - Advertencia
    else if (permissions.accessLevel === 'trial') {
      const daysRemaining = permissions.planInfo.daysRemaining || 0;
      if (daysRemaining <= 5) {
        alerts.push({
          id: 'trial-ending',
          type: 'warning',
          title: 'Trial Finalizando',
          message: `Tu período de prueba termina en ${daysRemaining} día${daysRemaining !== 1 ? 's' : ''}`,
          dismissible: true
        });
      }
    }

    // Filtrar alertas ya desestimadas
    return alerts.filter(alert => 
      !alert.dismissible || !dismissedAlerts.includes(alert.id)
    );
  }, [permissions, dismissedAlerts]);

  const dismissAlert = useCallback((alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
  }, []);

  const clearDismissedAlerts = useCallback(() => {
    setDismissedAlerts([]);
  }, []);

  return {
    generateAlerts,
    dismissAlert,
    clearDismissedAlerts
  };
};
