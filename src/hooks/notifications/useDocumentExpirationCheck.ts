import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSimpleAuth } from '../useSimpleAuth';
import { useVehicleNotifications } from './useVehicleNotifications';

export const useDocumentExpirationCheck = () => {
  const { user } = useSimpleAuth();
  const { vehicleNotifications } = useVehicleNotifications();

  const checkDocumentExpirations = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Verificar vehículos con documentos por vencer
      const { data: vehiculos } = await supabase
        .from('vehiculos')
        .select('placa, vigencia_seguro, verificacion_vigencia')
        .eq('user_id', user.id)
        .eq('activo', true);

      vehiculos?.forEach(vehiculo => {
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        if (vehiculo.vigencia_seguro) {
          const seguroDate = new Date(vehiculo.vigencia_seguro);
          if (seguroDate <= thirtyDaysFromNow && seguroDate > now) {
            const dias = Math.ceil((seguroDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            vehicleNotifications.documentoVencePronto(vehiculo.placa, 'Seguro', dias);
          }
        }

        if (vehiculo.verificacion_vigencia) {
          const verificacionDate = new Date(vehiculo.verificacion_vigencia);
          if (verificacionDate <= thirtyDaysFromNow && verificacionDate > now) {
            const dias = Math.ceil((verificacionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            vehicleNotifications.documentoVencePronto(vehiculo.placa, 'Verificación', dias);
          }
        }
      });
    } catch (error) {
      console.error('Error checking document expirations:', error);
    }
  }, [user?.id, vehicleNotifications]);

  // Ejecutar verificación cada hora
  useEffect(() => {
    if (!user?.id) return;

    // Verificar inmediatamente
    checkDocumentExpirations();

    // Configurar verificación periódica
    const interval = setInterval(checkDocumentExpirations, 60 * 60 * 1000); // Cada hora

    return () => clearInterval(interval);
  }, [user?.id, checkDocumentExpirations]);

  return { checkDocumentExpirations };
};
