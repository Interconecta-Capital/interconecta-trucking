
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface NotificationData {
  id: string;
  tipo: 'success' | 'warning' | 'error' | 'info';
  titulo: string;
  mensaje: string;
  urgente: boolean;
  metadata?: any;
  created_at: string;
  leida: boolean;
}

export const useRealtimeNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) return;

    // Cargar notificaciones existentes
    loadInitialNotifications();

    // Configurar suscripción en tiempo real
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificaciones',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          handleNewNotification(payload.new as NotificationData);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notificaciones',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          handleNotificationUpdate(payload.new as NotificationData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const loadInitialNotifications = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Type cast the data to ensure proper types
      const typedData: NotificationData[] = (data || []).map(item => ({
        id: item.id,
        tipo: item.tipo as 'success' | 'warning' | 'error' | 'info',
        titulo: item.titulo,
        mensaje: item.mensaje,
        urgente: item.urgente,
        metadata: item.metadata,
        created_at: item.created_at,
        leida: item.leida
      }));

      setNotifications(typedData);
      setUnreadCount(typedData.filter(n => !n.leida).length);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  };

  const handleNewNotification = (notification: NotificationData) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Mostrar toast según el tipo
    const toastOptions = {
      duration: notification.urgente ? 8000 : 4000,
    };

    switch (notification.tipo) {
      case 'success':
        toast.success(notification.titulo, {
          description: notification.mensaje,
          ...toastOptions
        });
        break;
      case 'warning':
        toast.warning(notification.titulo, {
          description: notification.mensaje,
          ...toastOptions
        });
        break;
      case 'error':
        toast.error(notification.titulo, {
          description: notification.mensaje,
          ...toastOptions
        });
        break;
      default:
        toast.info(notification.titulo, {
          description: notification.mensaje,
          ...toastOptions
        });
    }

    // Reproducir sonido para notificaciones urgentes
    if (notification.urgente && 'Audio' in window) {
      try {
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(() => {
          // Silenciar errores de audio si no se puede reproducir
        });
      } catch (error) {
        // Ignorar errores de audio
      }
    }

    // Mostrar notificación del navegador si está permitido
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.titulo, {
        body: notification.mensaje,
        icon: '/favicon.ico',
        tag: notification.id
      });
    }
  };

  const handleNotificationUpdate = (notification: NotificationData) => {
    setNotifications(prev => 
      prev.map(n => n.id === notification.id ? notification : n)
    );

    if (notification.leida) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('user_id', user.id)
        .eq('leida', false);

      if (error) throw error;

      setUnreadCount(0);
      setNotifications(prev => 
        prev.map(n => ({ ...n, leida: true }))
      );
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notificaciones')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Actualizar contador si la notificación no estaba leída
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.leida) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error eliminando notificación:', error);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  // Función para crear notificaciones programáticamente
  const createNotification = async (
    tipo: 'success' | 'warning' | 'error' | 'info',
    titulo: string,
    mensaje: string,
    urgente: boolean = false,
    metadata?: any
  ) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase
        .from('notificaciones')
        .insert({
          user_id: user.id,
          tipo,
          titulo,
          mensaje,
          urgente,
          metadata: metadata || {}
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creando notificación:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    requestNotificationPermission,
    createNotification,
    loadInitialNotifications
  };
};
