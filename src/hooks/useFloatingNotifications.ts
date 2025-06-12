
import { useState, useCallback } from 'react';
import { FloatingNotification } from '@/components/ui/floating-notification';

export function useFloatingNotifications() {
  const [notifications, setNotifications] = useState<FloatingNotification[]>([]);

  const addNotification = useCallback((notification: Omit<FloatingNotification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification: FloatingNotification = {
      ...notification,
      id,
    };
    
    setNotifications(prev => [...prev, newNotification]);
    return id;
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Notificaciones específicas para validaciones
  const validationNotifications = {
    rfcInvalido: () => addNotification({
      type: 'error',
      title: 'RFC Inválido',
      message: 'El RFC ingresado no tiene un formato válido',
    }),

    pesoExcesivo: (peso: number) => addNotification({
      type: 'warning',
      title: 'Peso Excesivo',
      message: `El peso de ${peso.toLocaleString()} kg excede los límites recomendados`,
      persistent: true,
    }),

    materiaPeligrosaDetectada: () => addNotification({
      type: 'warning',
      title: 'Material Peligroso',
      message: 'Se detectó material peligroso. Revise la documentación requerida.',
      action: {
        label: 'Ver Guía',
        onClick: () => {
          // Abrir guía de materiales peligrosos
          window.open('/guia-materiales-peligrosos', '_blank');
        }
      }
    }),

    rutaOptimizada: (ahorro: number) => addNotification({
      type: 'success',
      title: 'Ruta Optimizada',
      message: `Se optimizó la ruta con un ahorro de ${ahorro} km`,
    }),

    conexionRestaurada: () => addNotification({
      type: 'success',
      title: 'Conexión Restaurada',
      message: 'La conexión con los servicios SAT se ha restablecido',
    }),

    backup automatico: () => addNotification({
      type: 'info',
      title: 'Respaldo Automático',
      message: 'Sus datos se han guardado automáticamente',
      autoHide: true,
      duration: 2000,
    }),
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    validation: validationNotifications,
  };
}
