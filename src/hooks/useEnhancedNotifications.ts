import { useFloatingNotifications } from './useFloatingNotifications';
import { toast } from 'sonner';

interface EnhancedNotificationOptions {
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'default' | 'destructive';
  }>;
}

export const useEnhancedNotifications = () => {
  const { addNotification, dismissNotification } = useFloatingNotifications();

  // Migrar gradualmente de sonner a FloatingNotifications
  const showNotification = (options: EnhancedNotificationOptions) => {
    // Por ahora usar sonner pero preparar para transición
    if (options.actions && options.actions.length > 0) {
      // Para notificaciones con acciones, usar FloatingNotifications
      const notificationId = addNotification({
        type: options.type,
        title: options.title,
        message: options.message,
        duration: options.duration,
        persistent: options.persistent
      });

      return notificationId;
    } else {
      // Para notificaciones simples, seguir usando sonner por compatibilidad
      const toastFn = {
        success: toast.success,
        error: toast.error,
        warning: toast.warning,
        info: toast.info
      }[options.type];
      
      return toastFn(options.title, {
        description: options.message,
        duration: options.duration
      });
    }
  };

  const success = (title: string, message?: string, actions?: EnhancedNotificationOptions['actions']) => {
    return showNotification({ type: 'success', title, message, actions });
  };

  const error = (title: string, message?: string, actions?: EnhancedNotificationOptions['actions']) => {
    return showNotification({ type: 'error', title, message, actions, persistent: true });
  };

  const warning = (title: string, message?: string, actions?: EnhancedNotificationOptions['actions']) => {
    return showNotification({ type: 'warning', title, message, actions });
  };

  const info = (title: string, message?: string, actions?: EnhancedNotificationOptions['actions']) => {
    return showNotification({ type: 'info', title, message, actions });
  };

  // Notificación especial para cuando se crea una carta porte
  const cartaPorteCreated = (cartaPorteId: string, onOpenCartaPorte: () => void) => {
    return addNotification({
      type: 'success',
      title: 'Carta Porte Creada',
      message: `Se creó exitosamente con ID: ${cartaPorteId}`,
      persistent: true, // No se cierra automáticamente
      duration: 0 // Sin duración automática
    });
  };

  return {
    showNotification,
    success,
    error,
    warning,
    info,
    cartaPorteCreated,
    dismiss: dismissNotification
  };
};