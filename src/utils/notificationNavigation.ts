import { NavigateFunction } from 'react-router-dom';

interface NotificationMetadata {
  link?: string;
  entityType?: 'viaje' | 'carta_porte' | 'vehiculo' | 'conductor' | 'socio' | 'certificado' | 'seguro' | 'licencia';
  entityId?: string;
  [key: string]: any;
}

/**
 * Navega a la ruta correspondiente basándose en los metadatos de la notificación
 * @param metadata - Metadatos de la notificación
 * @param navigate - Función de navegación de react-router-dom
 */
export const navigateFromNotification = (
  metadata: NotificationMetadata | null | undefined,
  navigate: NavigateFunction
): void => {
  if (!metadata) {
    console.warn('[NotificationNavigation] No metadata provided');
    return;
  }

  // Prioridad 1: Link directo
  if (metadata.link) {
    console.log('[NotificationNavigation] Navegando a:', metadata.link);
    navigate(metadata.link);
    return;
  }

  // Prioridad 2: Navegación por tipo de entidad
  if (metadata.entityType && metadata.entityId) {
    console.log('[NotificationNavigation] Navegando por entidad:', metadata.entityType, metadata.entityId);
    
    switch (metadata.entityType) {
      case 'viaje':
        navigate(`/viajes/editar/${metadata.entityId}`);
        break;
      
      case 'carta_porte':
        navigate(`/cartas-porte`);
        // TODO: Implementar modal o vista de detalle con filtro por ID
        break;
      
      case 'vehiculo':
        navigate('/vehiculos');
        // TODO: Implementar filtro por ID en la URL o localStorage
        break;
      
      case 'conductor':
        navigate('/conductores');
        // TODO: Implementar filtro por ID
        break;
      
      case 'socio':
        navigate('/socios');
        // TODO: Implementar filtro por ID
        break;
      
      case 'certificado':
      case 'seguro':
      case 'licencia':
        navigate('/configuracion/empresa');
        break;
      
      default:
        console.warn('[NotificationNavigation] Tipo de entidad desconocido:', metadata.entityType);
        navigate('/dashboard');
    }
    return;
  }

  // Fallback: Ir al dashboard
  console.log('[NotificationNavigation] No se pudo determinar navegación, redirigiendo a dashboard');
  navigate('/dashboard');
};

/**
 * Obtiene el ícono correspondiente al tipo de notificación
 * @param tipo - Tipo de notificación
 * @param urgente - Si la notificación es urgente
 * @returns Nombre del ícono de lucide-react
 */
export const getNotificationIcon = (tipo: string, urgente: boolean): string => {
  if (urgente) return 'AlertTriangle';
  
  switch (tipo) {
    case 'success':
    case 'entrega':
      return 'CheckCircle';
    case 'warning':
    case 'retraso':
      return 'Clock';
    case 'error':
      return 'XCircle';
    case 'mantenimiento':
      return 'Wrench';
    case 'certificado':
    case 'documento':
      return 'FileText';
    default:
      return 'Bell';
  }
};

/**
 * Obtiene el color del badge según el tipo de notificación
 * @param tipo - Tipo de notificación
 * @param urgente - Si la notificación es urgente
 * @returns Variante del badge
 */
export const getNotificationBadgeVariant = (tipo: string, urgente: boolean): 'default' | 'destructive' | 'outline' | 'secondary' => {
  if (urgente) return 'destructive';
  
  switch (tipo) {
    case 'success':
    case 'entrega':
      return 'default';
    case 'warning':
    case 'retraso':
      return 'outline';
    case 'error':
      return 'destructive';
    default:
      return 'secondary';
  }
};
