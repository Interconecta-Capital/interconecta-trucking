
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { TrendingUp, X } from 'lucide-react';
import { AlertConfig } from '@/types/alerts';
import { getAlertStyle, getAlertIcon, getButtonStyle } from '@/utils/alertUtils';

interface AlertItemProps {
  alert: AlertConfig;
  onAction: () => void;
  onDismiss?: (id: string) => void;
}

export function AlertItem({ alert, onAction, onDismiss }: AlertItemProps) {
  const Icon = getAlertIcon(alert);

  return (
    <Alert className={getAlertStyle(alert.type)}>
      <Icon className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <div className={`font-medium ${alert.type === 'critical' ? 'text-red-900' : ''}`}>
            {alert.title}
          </div>
          <div className={`text-sm ${alert.type === 'critical' ? 'text-red-800' : ''}`}>
            {alert.message}
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button 
            size="sm" 
            onClick={onAction}
            className={`shrink-0 ${getButtonStyle(alert.type)}`}
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            {alert.action}
          </Button>
          {alert.type !== 'critical' && onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDismiss(alert.id)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}
