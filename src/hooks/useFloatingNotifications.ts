
import { useNotificationCore } from './notifications/useNotificationCore';
import { useVehicleNotifications } from './notifications/useVehicleNotifications';
import { useTripNotifications } from './notifications/useTripNotifications';
import { useRealtimeSubscriptions } from './notifications/useRealtimeSubscriptions';
import { useDocumentExpirationCheck } from './notifications/useDocumentExpirationCheck';

export const useFloatingNotifications = () => {
  const { 
    notifications, 
    addNotification, 
    dismissNotification, 
    createContextualNotification 
  } = useNotificationCore();
  
  const { vehicleNotifications } = useVehicleNotifications();
  const { tripNotifications } = useTripNotifications();
  const { checkDocumentExpirations } = useDocumentExpirationCheck();

  // Set up realtime subscriptions
  useRealtimeSubscriptions(createContextualNotification);

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

// Re-export types for convenience
export type { FloatingNotification } from './notifications/types';
