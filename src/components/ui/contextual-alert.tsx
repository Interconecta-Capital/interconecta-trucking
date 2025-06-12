
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Bell, CheckCircle, Shield, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextualAlertProps {
  type: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const icons = {
  info: <Bell className="h-4 w-4" />,
  warning: <AlertTriangle className="h-4 w-4" />,
  error: <AlertTriangle className="h-4 w-4" />,
  success: <CheckCircle className="h-4 w-4" />,
};

const variants = {
  info: "border-blue-200 bg-blue-50 text-blue-800",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-800", 
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-green-200 bg-green-50 text-green-800",
};

export function ContextualAlert({
  type,
  title,
  message,
  action,
  dismissible = false,
  onDismiss,
  className
}: ContextualAlertProps) {
  return (
    <Alert className={cn(variants[type], className)}>
      {icons[type]}
      <div className="flex-1">
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription className="flex items-center justify-between">
          <span>{message}</span>
          <div className="flex items-center space-x-2 ml-4">
            {action && (
              <Button
                variant="outline"
                size="sm"
                onClick={action.onClick}
                className="bg-white/20 border-current hover:bg-white/30"
              >
                {action.label}
              </Button>
            )}
            {dismissible && onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-6 w-6 p-0 hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </AlertDescription>
      </div>
    </Alert>
  );
}
