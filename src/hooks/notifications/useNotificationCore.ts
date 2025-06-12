
import { useState, useCallback } from 'react';
import { FloatingNotification } from './types';

export const useNotificationCore = () => {
  const [notifications, setNotifications] = useState<FloatingNotification[]>([]);

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

  return {
    notifications,
    addNotification,
    dismissNotification,
    createContextualNotification
  };
};
