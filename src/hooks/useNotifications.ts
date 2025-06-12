
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, CheckCircle, Bell, Shield } from 'lucide-react';

export interface NotificationOptions {
  title?: string;
  description?: string;
  duration?: number;
  action?: React.ReactElement;
}

export function useNotifications() {
  const { toast } = useToast();

  const showSuccess = (options: NotificationOptions) => {
    toast({
      title: options.title || "Éxito",
      description: options.description,
      duration: options.duration || 3000,
      action: options.action,
      className: "border-green-200 bg-green-50 text-green-800",
    });
  };

  const showError = (options: NotificationOptions) => {
    toast({
      title: options.title || "Error",
      description: options.description,
      duration: options.duration || 5000,
      action: options.action,
      variant: "destructive",
    });
  };

  const showWarning = (options: NotificationOptions) => {
    toast({
      title: options.title || "Advertencia",
      description: options.description,
      duration: options.duration || 4000,
      action: options.action,
      className: "border-yellow-200 bg-yellow-50 text-yellow-800",
    });
  };

  const showInfo = (options: NotificationOptions) => {
    toast({
      title: options.title || "Información",
      description: options.description,
      duration: options.duration || 3000,
      action: options.action,
      className: "border-blue-200 bg-blue-50 text-blue-800",
    });
  };

  // Notificaciones específicas para Carta Porte
  const cartaPorteNotifications = {
    mercanciaAgregada: (descripcion: string) => {
      showSuccess({
        title: "Mercancía agregada",
        description: `Se agregó: ${descripcion}`,
      });
    },

    mercanciaEliminada: () => {
      showSuccess({
        title: "Mercancía eliminada",
        description: "La mercancía se eliminó correctamente",
      });
    },

    ubicacionAgregada: (tipo: string) => {
      showSuccess({
        title: "Ubicación agregada",
        description: `Se agregó ${tipo.toLowerCase()} correctamente`,
      });
    },

    xmlGenerado: () => {
      showSuccess({
        title: "XML Generado",
        description: "El archivo XML se generó correctamente según especificaciones SAT",
      });
    },

    errorValidacion: (campo: string) => {
      showError({
        title: "Error de validación",
        description: `Error en el campo: ${campo}`,
      });
    },

    materiaPeligrosa: () => {
      showWarning({
        title: "Material Peligroso Detectado",
        description: "Esta mercancía requiere documentación especial",
      });
    },

    timbradoExitoso: (uuid: string) => {
      showSuccess({
        title: "Timbrado Exitoso",
        description: `UUID: ${uuid.substring(0, 8)}...`,
        duration: 6000,
      });
    },

    errorTimbrado: (mensaje: string) => {
      showError({
        title: "Error en Timbrado",
        description: mensaje,
        duration: 8000,
      });
    },

    importacionExitosa: (cantidad: number) => {
      showSuccess({
        title: "Importación Completada",
        description: `Se importaron ${cantidad} registros correctamente`,
      });
    },

    conexionPACError: () => {
      showError({
        title: "Error de Conexión PAC",
        description: "No se pudo conectar con el proveedor de certificación",
        duration: 6000,
      });
    },

    procesoIACompleto: (tipo: string) => {
      showSuccess({
        title: "Procesamiento IA Completado",
        description: `Se extrajo información del ${tipo} correctamente`,
      });
    }
  };

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    cartaPorte: cartaPorteNotifications,
  };
}
