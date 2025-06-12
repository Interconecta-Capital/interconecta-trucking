
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, AlertTriangle, Bell, Shield, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FloatingNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  autoHide?: boolean;
  duration?: number;
}

interface FloatingNotificationProps {
  notification: FloatingNotification;
  onDismiss: (id: string) => void;
}

const icons = {
  info: <Bell className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  error: <AlertTriangle className="h-5 w-5" />,
  success: <CheckCircle className="h-5 w-5" />,
};

const variants = {
  info: "border-blue-200 bg-blue-50 text-blue-800",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-green-200 bg-green-50 text-green-800",
};

export function FloatingNotificationComponent({ 
  notification, 
  onDismiss 
}: FloatingNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    if (notification.autoHide !== false && !notification.persistent) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, notification.duration || 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  };

  return (
    <Card 
      className={cn(
        "w-96 shadow-lg transition-all duration-300 transform",
        variants[notification.type],
        isVisible 
          ? "translate-x-0 opacity-100" 
          : "translate-x-full opacity-0"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className={cn(
            "flex-shrink-0 mt-0.5",
            notification.type === 'info' && "text-blue-600",
            notification.type === 'warning' && "text-yellow-600",
            notification.type === 'error' && "text-red-600",
            notification.type === 'success' && "text-green-600"
          )}>
            {icons[notification.type]}
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{notification.title}</h4>
              {!notification.persistent && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleDismiss}
                  className="h-6 w-6 p-0 hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <p className="text-sm opacity-90">{notification.message}</p>
            
            {notification.action && (
              <Button
                variant="outline"
                size="sm"
                onClick={notification.action.onClick}
                className="mt-2 bg-white/20 border-current hover:bg-white/30"
              >
                {notification.action.label}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
