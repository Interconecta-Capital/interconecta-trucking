
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, Clock, TrendingUp } from 'lucide-react';
import { useNotifications } from '@/hooks/notifications/useNotifications';
import { useNavigate } from 'react-router-dom';

export function PlanNotifications() {
  const { generateAlerts, dismissAlert } = useNotifications();
  const navigate = useNavigate();
  const alerts = generateAlerts();

  if (alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <Alert 
          key={alert.id} 
          variant={alert.type === 'critical' ? 'destructive' : 'default'}
          className="relative"
        >
          <div className="flex items-start gap-3">
            {alert.type === 'critical' ? (
              <AlertTriangle className="h-4 w-4 mt-0.5" />
            ) : (
              <Clock className="h-4 w-4 mt-0.5" />
            )}
            
            <div className="flex-1">
              <h4 className="font-medium">{alert.title}</h4>
              <AlertDescription className="mt-1">
                {alert.message}
              </AlertDescription>
            </div>

            <div className="flex items-center gap-2">
              {alert.action && (
                <Button 
                  size="sm" 
                  onClick={() => navigate('/planes')}
                  variant={alert.type === 'critical' ? 'secondary' : 'default'}
                >
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {alert.action}
                </Button>
              )}
              
              {alert.type !== 'critical' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissAlert(alert.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </Alert>
      ))}
    </div>
  );
}
