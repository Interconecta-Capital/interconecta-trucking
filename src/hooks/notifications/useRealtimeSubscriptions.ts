
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '../useUnifiedAuth';

export const useRealtimeSubscriptions = (
  onNotification: (tipo: string, titulo: string, mensaje: string, urgente?: boolean) => void
) => {
  const { user } = useUnifiedAuth();

  useEffect(() => {
    if (!user?.id) return;

    // Suscribirse a cambios en notificaciones
    const notificationsChannel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificaciones',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const notif = payload.new;
          onNotification(notif.tipo, notif.titulo, notif.mensaje, notif.urgente);
        }
      )
      .subscribe();

    // Suscribirse a cambios de estado en vehículos
    const vehiculosChannel = supabase
      .channel('vehiculos_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vehiculos',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const oldRecord = payload.old;
          const newRecord = payload.new;
          
          if (oldRecord.estado !== newRecord.estado) {
            onNotification(
              'info',
              'Estado de vehículo actualizado',
              `Vehículo ${newRecord.placa} cambió de ${oldRecord.estado} a ${newRecord.estado}`
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(vehiculosChannel);
    };
  }, [user?.id, onNotification]);
};
