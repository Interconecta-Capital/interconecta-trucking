
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { FloatingNotification } from '@/components/ui/floating-notification';

interface RealtimeNotification {
  id: string;
  user_id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  urgente: boolean;
  metadata: any;
  created_at: string;
}

export const useFloatingNotifications = () => {
  const [notifications, setNotifications] = useState<FloatingNotification[]>([]);
  const { user } = useAuth();

  const addNotification = useCallback((notification: Omit<FloatingNotification, 'id'>) => {
    const newNotification: FloatingNotification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration if not persistent
    if (!newNotification.persistent) {
      setTimeout(() => {
        dismissNotification(newNotification.id);
      }, newNotification.duration || 5000);
    }
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const createContextualNotification = useCallback((tipo: string, titulo: string, mensaje: string, urgente = false) => {
    const notificationType = urgente ? 'error' : tipo === 'success' ? 'success' : tipo === 'warning' ? 'warning' : 'info';
    
    addNotification({
      type: notificationType,
      title: titulo,
      message: mensaje,
      persistent: urgente,
      autoHide: !urgente
    });
  }, [addNotification]);

  // Escuchar notificaciones en tiempo real con WebSockets
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
  }, [user?.id, createContextualNotification]);

  // Notificaciones específicas del sistema
  const vehicleNotifications = {
    estadoCambiado: (placa: string, estadoAnterior: string, estadoNuevo: string) => {
      const esUrgente = estadoNuevo === 'fuera_servicio' || estadoNuevo === 'mantenimiento';
      createContextualNotification(
        esUrgente ? 'warning' : 'info',
        'Estado de Vehículo Actualizado',
        `${placa}: ${estadoAnterior} → ${estadoNuevo}`,
        esUrgente
      );
    },

    mantenimientoProgramado: (placa: string, fecha: string) => {
      addNotification({
        type: 'info',
        title: 'Mantenimiento Programado',
        message: `Vehículo ${placa} programado para ${fecha}`,
        action: {
          label: 'Ver Detalles',
          onClick: () => console.log('Navigate to vehicle details')
        }
      });
    },

    documentoVencePronto: (placa: string, documento: string, dias: number) => {
      addNotification({
        type: 'warning',
        title: 'Documento por Vencer',
        message: `${documento} del vehículo ${placa} vence en ${dias} días`,
        persistent: true,
        action: {
          label: 'Renovar',
          onClick: () => console.log('Navigate to document renewal')
        }
      });
    }
  };

  const tripNotifications = {
    viajeIniciado: (origen: string, destino: string) => {
      createContextualNotification(
        'success',
        'Viaje Iniciado',
        `Ruta: ${origen} → ${destino}`
      );
    },

    viajeCompletado: (origen: string, destino: string) => {
      createContextualNotification(
        'success',
        'Viaje Completado',
        `Entrega exitosa en ${destino}`
      );
    },

    retrasoDetectado: (retrasoMinutos: number, ubicacionActual: string) => {
      addNotification({
        type: 'warning',
        title: 'Retraso Detectado',
        message: `${retrasoMinutos} min de retraso en ${ubicacionActual}`,
        persistent: true,
        action: {
          label: 'Ver Tracking',
          onClick: () => console.log('Navigate to tracking')
        }
      });
    },

    emergencia: (ubicacion: string, descripcion: string) => {
      addNotification({
        type: 'error',
        title: 'EMERGENCIA',
        message: `${descripcion} en ${ubicacion}`,
        persistent: true,
        action: {
          label: 'Atender',
          onClick: () => console.log('Handle emergency')
        }
      });
    }
  };

  // Sistema de verificación de documentos próximos a vencer
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

  return {
    notifications,
    addNotification,
    dismissNotification,
    createContextualNotification,
    vehicleNotifications,
    tripNotifications,
    checkDocumentExpirations
  };
};
