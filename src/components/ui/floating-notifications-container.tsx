
import React from 'react';
import { FloatingNotificationComponent, FloatingNotification } from './floating-notification';

interface FloatingNotificationsContainerProps {
  notifications: FloatingNotification[];
  onDismiss: (id: string) => void;
}

export function FloatingNotificationsContainer({ 
  notifications, 
  onDismiss 
}: FloatingNotificationsContainerProps) {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-h-screen overflow-y-auto">
      {notifications.map((notification) => (
        <FloatingNotificationComponent
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}
