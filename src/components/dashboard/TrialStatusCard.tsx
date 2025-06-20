
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePermissionCheck } from '@/hooks/useUnifiedAccessControl';
import { Calendar, Clock, AlertTriangle, Crown, Lock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TrialStatusCard() {
  const accessControl = usePermissionCheck();
  const navigate = useNavigate();

  console.log('📊 TrialStatusCard rendering with:', {
    hasFullAccess: accessControl.hasFullAccess,
    isBlocked: accessControl.isBlocked,
    restrictionType: accessControl.restrictionType,
    statusMessage: accessControl.statusMessage,
    isSuperuser: accessControl.isSuperuser
  });

  // Superusers ven un card especial
  if (accessControl.isSuperuser) {
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

  const getCardStyle = () => {
    switch (accessControl.restrictionType) {
      case 'trial_expired':
        return 'border-orange-300 bg-orange-50';
      case 'payment_suspended':
        return 'border-red-500 bg-red-50';
      case 'grace_period':
        return accessControl.urgencyLevel === 'critical' ? 'border-red-500 bg-red-50' : 'border-orange-500 bg-orange-50';
      default:
        if (accessControl.isInActiveTrial && accessControl.daysRemaining <= 3) return 'border-yellow-500 bg-yellow-50';
        if (accessControl.isInActiveTrial) return 'border-green-500 bg-green-50';
        return 'border-gray-300 bg-gray-50';
    }
  };

  const getIcon = () => {
    switch (accessControl.restrictionType) {
      case 'trial_expired':
        return AlertTriangle;
      case 'payment_suspended':
        return Lock;
      case 'grace_period':
        return accessControl.urgencyLevel === 'critical' ? AlertTriangle : Clock;
      default:
        return Calendar;
    }
  };

  const getProgressValue = () => {
    if (accessControl.isInActiveTrial) {
      return ((14 - accessControl.daysRemaining) / 14) * 100;
    }
    if (accessControl.restrictionType === 'grace_period') {
      return ((90 - accessControl.daysRemaining) / 90) * 100;
    }
    return 100;
  };

  const getButtonText = () => {
    switch (accessControl.restrictionType) {
      case 'trial_expired':
        return 'Ver Planes';
      case 'payment_suspended':
        return 'Renovar Suscripción';
      case 'grace_period':
        return accessControl.urgencyLevel === 'critical' ? 'ADQUIRIR PLAN YA' : 'Ver Planes';
      default:
        return 'Ver Planes';
    }
  };

  const shouldShowButton = () => {
    return (
      accessControl.restrictionType !== 'none' || 
      (accessControl.isInActiveTrial && accessControl.daysRemaining <= 7)
    );
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
          <p className="text-sm font-medium">{accessControl.statusMessage}</p>
          
          {accessControl.actionRequired && (
            <p className="text-xs text-muted-foreground">{accessControl.actionRequired}</p>
          )}
          
          {(accessControl.isInActiveTrial || accessControl.restrictionType === 'grace_period') && (
            <div className="space-y-1">
              <Progress value={getProgressValue()} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {accessControl.isInActiveTrial ? 'Trial' : 'Período de gracia'}
                </span>
                <span>
                  {accessControl.isInActiveTrial 
                    ? `${accessControl.daysRemaining}/14 días` 
                    : `${accessControl.daysRemaining}/90 días`
                  }
                </span>
              </div>
            </div>
          )}
        </div>

        {shouldShowButton() && (
          <Button 
            onClick={() => navigate('/planes')}
            className="w-full"
            variant={accessControl.urgencyLevel === 'critical' || accessControl.restrictionType === 'payment_suspended' ? 'destructive' : 'default'}
            size="sm"
          >
            <TrendingUp className="w-3 h-3 mr-1" />
            {getButtonText()}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
