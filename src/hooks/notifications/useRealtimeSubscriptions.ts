
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';
import { RealtimeNotification } from './types';
import { useVehicleNotifications } from './useVehicleNotifications';
import { useTripNotifications } from './useTripNotifications';

export const useRealtimeSubscriptions = (createContextualNotification: (tipo: string, titulo: string, mensaje: string, urgente?: boolean) => void) => {
  const { user } = useAuth();
  const { vehicleNotifications } = useVehicleNotifications();
  const { tripNotifications } = useTripNotifications();

  useEffect(() => {
    if (!user?.id) return;

    console.log('Setting up realtime notifications for user:', user.id);

    // Configurar canal de tiempo real para notificaciones
    const notificationsChannel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificaciones',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New notification received:', payload);
          const notification = payload.new as RealtimeNotification;
          
          createContextualNotification(
            notification.tipo,
            notification.titulo,
            notification.mensaje,
            notification.urgente
          );
        }
      )
      .subscribe((status) => {
        console.log('Notification subscription status:', status);
      });

    // Configurar canal para cambios de estado de vehículos
    const vehicleStatesChannel = supabase
      .channel('vehicle-states-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'vehiculos',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Vehicle state change:', payload);
          const oldRecord = payload.old as any;
          const newRecord = payload.new as any;
          
          if (oldRecord.estado !== newRecord.estado) {
            vehicleNotifications.estadoCambiado(
              newRecord.placa,
              oldRecord.estado,
              newRecord.estado
            );
          }
        }
      )
      .subscribe();

    // Configurar canal para cambios de estado de viajes
    const tripStatesChannel = supabase
      .channel('trip-states-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'eventos_viaje'
        },
        (payload) => {
          console.log('Trip event:', payload);
          const evento = payload.new as any;
          
          if (evento.tipo_evento === 'retraso') {
            tripNotifications.retrasoDetectado(30, evento.ubicacion || 'Ubicación desconocida');
          } else if (evento.tipo_evento === 'entrega') {
            tripNotifications.viajeCompletado('Origen', evento.ubicacion || 'Destino');
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up notification subscriptions');
      supabase.removeChannel(notificationsChannel);
      supabase.removeChannel(vehicleStatesChannel);
      supabase.removeChannel(tripStatesChannel);
    };
  }, [user?.id, createContextualNotification, vehicleNotifications, tripNotifications]);
};
