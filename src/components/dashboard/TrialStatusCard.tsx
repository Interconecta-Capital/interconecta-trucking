
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTrialManager } from '@/hooks/useTrialManager';
import { useSuperuser } from '@/hooks/useSuperuser';
import { Calendar, Clock, AlertTriangle, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TrialStatusCard() {
  const { 
    isInActiveTrial, 
    isTrialExpired, 
    isInGracePeriod, 
    daysRemaining, 
    graceDaysRemaining,
    dataWillBeDeleted,
    getContextualMessage,
    getUrgencyLevel
  } = useTrialManager();
  
  const { isSuperuser } = useSuperuser();
  const navigate = useNavigate();

  // Superusers ven un card especial
  if (isSuperuser) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Crown className="h-5 w-5" />
            Superusuario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-700">
            Acceso completo sin restricciones
          </p>
        </CardContent>
      </Card>
    );
  }

  const urgency = getUrgencyLevel();
  const message = getContextualMessage();

  const getCardStyle = () => {
    if (dataWillBeDeleted) return 'border-red-500 bg-red-50';
    if (isInGracePeriod) return 'border-orange-500 bg-orange-50';
    if (isTrialExpired) return 'border-red-300 bg-red-50';
    if (isInActiveTrial && daysRemaining <= 3) return 'border-yellow-500 bg-yellow-50';
    if (isInActiveTrial) return 'border-green-500 bg-green-50';
    return 'border-gray-300 bg-gray-50';
  };

  const getIcon = () => {
    if (dataWillBeDeleted || urgency === 'critical') return AlertTriangle;
    if (isInGracePeriod || isTrialExpired) return Clock;
    return Calendar;
  };

  const getProgressValue = () => {
    if (isInActiveTrial) {
      return ((14 - daysRemaining) / 14) * 100;
    }
    if (isInGracePeriod) {
      return ((90 - graceDaysRemaining) / 90) * 100;
    }
    return 100;
  };

  const Icon = getIcon();

  return (
    <Card className={getCardStyle()}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className="h-4 w-4" />
          Estado de la Cuenta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <p className="text-sm font-medium">{message}</p>
          
          {(isInActiveTrial || isInGracePeriod) && (
            <div className="space-y-1">
              <Progress value={getProgressValue()} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {isInActiveTrial ? 'Trial' : 'Período de gracia'}
                </span>
                <span>
                  {isInActiveTrial ? `${daysRemaining}/14 días` : `${graceDaysRemaining}/90 días`}
                </span>
              </div>
            </div>
          )}
        </div>

        {!isInActiveTrial && (
          <Button 
            onClick={() => navigate('/planes')}
            className="w-full"
            variant={dataWillBeDeleted ? 'destructive' : 'default'}
            size="sm"
          >
            {dataWillBeDeleted ? 'Adquirir Plan YA' : 'Ver Planes'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
