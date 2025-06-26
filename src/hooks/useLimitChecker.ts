
import { useUnifiedPermissionsV2 } from './useUnifiedPermissionsV2';

export interface LimitCheckResult {
  allowed: boolean;
  errorResponse?: {
    status: number;
    data: {
      code: 'LIMIT_REACHED';
      limit_type: string;
      message: string;
      current_usage: number;
      limit_value: number;
    };
  };
}

// Simulamos contadores actuales para testing
const MOCK_USAGE = {
  vehiculos: 2,
  remolques: 1,
  socios: 4,
  viajes: 4,
  cartas_porte: 3
};

export const useLimitChecker = () => {
  const permissions = useUnifiedPermissionsV2();

  const checkLimit = (resourceType: string): LimitCheckResult => {
    console.log('[LimitChecker] 🔍 Verificando límite para:', resourceType);
    
    // Solo aplicar límites en plan Freemium
    if (permissions.accessLevel !== 'freemium') {
      console.log('[LimitChecker] ✅ Sin restricciones para:', permissions.accessLevel);
      return { allowed: true };
    }

    const limits = permissions.planInfo.limits;
    if (!limits) {
      return { allowed: true };
    }

    let currentUsage = 0;
    let limitValue = 0;
    let limitType = resourceType;

    switch (resourceType) {
      case 'vehiculos':
        currentUsage = MOCK_USAGE.vehiculos;
        limitValue = limits.vehiculos;
        break;
      case 'remolques':
        currentUsage = MOCK_USAGE.remolques;
        limitValue = limits.remolques;
        break;
      case 'socios':
        currentUsage = MOCK_USAGE.socios;
        limitValue = limits.socios;
        break;
      case 'viajes':
        currentUsage = MOCK_USAGE.viajes;
        limitValue = limits.viajes_mensual;
        limitType = 'viajes_mensual';
        break;
      case 'cartas_porte':
        currentUsage = MOCK_USAGE.cartas_porte;
        limitValue = limits.cartas_porte_mensual;
        limitType = 'cartas_porte_mensual';
        break;
      default:
        return { allowed: true };
    }

    // Verificar si se alcanzó el límite
    if (currentUsage >= limitValue) {
      console.log('[LimitChecker] 🚫 Límite alcanzado:', { currentUsage, limitValue });
      
      return {
        allowed: false,
        errorResponse: {
          status: 402,
          data: {
            code: 'LIMIT_REACHED',
            limit_type: limitType,
            message: `Has alcanzado el límite de ${limitValue} ${resourceType} para el plan gratuito.`,
            current_usage: currentUsage,
            limit_value: limitValue
          }
        }
      };
    }

    console.log('[LimitChecker] ✅ Límite OK:', { currentUsage, limitValue });
    return { allowed: true };
  };

  const simulateApiCall = async (resourceType: string): Promise<void> => {
    const result = checkLimit(resourceType);
    
    if (!result.allowed && result.errorResponse) {
      // Simular error de API
      const error = {
        response: result.errorResponse,
        message: `HTTP Error ${result.errorResponse.status}`
      };
      
      throw error;
    }
    
    // Simular éxito
    console.log('[LimitChecker] ✅ Acción simulada exitosa para:', resourceType);
  };

  return {
    checkLimit,
    simulateApiCall
  };
};
