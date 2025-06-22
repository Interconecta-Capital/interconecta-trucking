
import { useUnifiedPermissionsV2 } from '../useUnifiedPermissionsV2';
import { useState, useCallback } from 'react';
import { AlertConfig } from '@/types/alerts';

/**
 * Hook para manejo de alertas - Migrado a useUnifiedPermissionsV2
 */
export const useAlertManager = () => {
  const permissions = useUnifiedPermissionsV2();
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  const generateAlerts = useCallback((): AlertConfig[] => {
    const alerts: AlertConfig[] = [];

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
        action: 'Renovar Plan',
        priority: 1
      });
    }

    // Plan expirado - Crítico
    else if (permissions.accessLevel === 'expired') {
      alerts.push({
        id: 'plan-expired',
        type: 'critical',
        title: 'Plan Expirado',
        message: permissions.accessReason,
        action: 'Renovar Plan',
        priority: 1
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
          action: 'Actualizar Plan',
          priority: 2
        });
      }
    }

    // Filtrar alertas ya desestimadas (solo las que no son críticas)
    return alerts.filter(alert => 
      alert.type === 'critical' || !dismissedAlerts.includes(alert.id)
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
