
import { useMemo } from 'react';
import { usePermisosSubscripcion } from './usePermisosSubscripcion';
import { useTrialManager } from './useTrialManager';
import { useSuperuser } from './useSuperuser';

export const useEnhancedPermissions = () => {
  const { isSuperuser } = useSuperuser();
  const { 
    hasFullAccess, 
    isTrialExpired, 
    isInGracePeriod,
    restrictionType,
    canPerformAction
  } = useTrialManager();
  const subscriptionPermissions = usePermisosSubscripcion();

  console.log('🔍 Enhanced Permissions Debug:', {
    isSuperuser,
    hasFullAccess,
    isTrialExpired,
    isInGracePeriod,
    restrictionType,
    canCreateActions: canPerformAction('create')
  });

  // Override all permissions for superusers
  const enhancedPermissions = useMemo(() => {
    if (isSuperuser) {
      console.log('✅ Superuser detected - full access granted');
      return {
        ...subscriptionPermissions,
        puedeAcceder: () => ({ puede: true, razon: undefined }),
        puedeCrear: () => ({ puede: true, razon: undefined }),
        puedeAccederAdministracion: () => ({ puede: true, razon: undefined }),
        puedeAccederFuncionesAvanzadas: () => ({ puede: true, razon: undefined }),
        puedeAccederEnterprise: () => ({ puede: true, razon: undefined }),
        estaBloqueado: false,
        suscripcionVencida: false,
        planActual: 'Enterprise Sin Límites (Superuser)',
        obtenerLimites: () => ({
          cartas_porte: null,
          conductores: null,
          vehiculos: null,
          socios: null,
        }),
        obtenerUsoActual: () => ({
          cartas_porte: { usado: 0, limite: null },
          conductores: { usado: 0, limite: null },
          vehiculos: { usado: 0, limite: null },
          socios: { usado: 0, limite: null },
        })
      };
    }

    // Para usuarios no-superuser, verificar acceso real
    console.log('🚫 Non-superuser - checking restrictions:', {
      hasFullAccess,
      restrictionType,
      canCreate: canPerformAction('create')
    });

    // Si no tiene acceso completo, bloquear todo
    if (!hasFullAccess) {
      console.log('❌ Access blocked - no full access');
      const blockedMessage = restrictionType === 'trial_expired' 
        ? 'Su período de prueba ha finalizado. Adquiera un plan para continuar.'
        : restrictionType === 'payment_suspended'
        ? 'Su cuenta está suspendida por falta de pago.'
        : restrictionType === 'grace_period'
        ? 'Su cuenta está en período de gracia. Solo puede consultar datos.'
        : 'Acceso restringido';

      return {
        ...subscriptionPermissions,
        puedeAcceder: (recurso: string) => {
          // Solo permitir recursos de solo lectura
          const readOnlyResources = ['dashboard', 'profile', 'planes', 'logout'];
          const isReadOnly = readOnlyResources.some(r => recurso.includes(r)) || recurso.includes('view');
          return { 
            puede: isReadOnly, 
            razon: isReadOnly ? undefined : blockedMessage 
          };
        },
        puedeCrear: () => ({ puede: false, razon: blockedMessage }),
        estaBloqueado: true,
        suscripcionVencida: true
      };
    }

    return subscriptionPermissions;
  }, [isSuperuser, subscriptionPermissions, hasFullAccess, restrictionType, canPerformAction]);

  return {
    ...enhancedPermissions,
    isSuperuser,
    hasFullAccess,
    restrictionType
  };
};
