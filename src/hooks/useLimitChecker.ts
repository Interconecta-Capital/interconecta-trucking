
import { useUnifiedPermissionsV2 } from './useUnifiedPermissionsV2';

// Simulador de API calls que pueden devolver error 402
export const useLimitChecker = () => {
  const permissions = useUnifiedPermissionsV2();

  const simulateCreateVehicle = async () => {
    console.log('[LimitChecker] 🚗 Simulando creación de vehículo...');
    
    const canCreate = permissions.canCreateVehiculo;
    
    if (!canCreate.allowed) {
      // Simular error 402 de la API
      const error = {
        response: {
          status: 402,
          data: {
            code: 'LIMIT_REACHED',
            limit_type: 'vehicles',
            message: canCreate.reason || 'Has alcanzado el límite de vehículos para tu plan gratuito.'
          }
        }
      };
      
      console.log('[LimitChecker] 🚨 Límite alcanzado:', error);
      throw error;
    }
    
    console.log('[LimitChecker] ✅ Vehículo creado exitosamente');
    return { success: true, message: 'Vehículo creado exitosamente' };
  };

  const simulateCreateTrip = async () => {
    console.log('[LimitChecker] 🛣️ Simulando creación de viaje...');
    
    const canCreate = permissions.canCreateViaje;
    
    if (!canCreate.allowed) {
      const error = {
        response: {
          status: 402,
          data: {
            code: 'LIMIT_REACHED',
            limit_type: 'trips',
            message: canCreate.reason || 'Has alcanzado el límite de viajes mensuales para tu plan gratuito.'
          }
        }
      };
      
      throw error;
    }
    
    console.log('[LimitChecker] ✅ Viaje creado exitosamente');
    return { success: true, message: 'Viaje creado exitosamente' };
  };

  const simulateCreatePartner = async () => {
    console.log('[LimitChecker] 🤝 Simulando creación de socio...');
    
    const canCreate = permissions.canCreateSocio;
    
    if (!canCreate.allowed) {
      const error = {
        response: {
          status: 402,
          data: {
            code: 'LIMIT_REACHED',
            limit_type: 'partners',
            message: canCreate.reason || 'Has alcanzado el límite de socios para tu plan gratuito.'
          }
        }
      };
      
      throw error;
    }
    
    console.log('[LimitChecker] ✅ Socio creado exitosamente');
    return { success: true, message: 'Socio creado exitosamente' };
  };

  return {
    simulateCreateVehicle,
    simulateCreateTrip,
    simulateCreatePartner
  };
};
