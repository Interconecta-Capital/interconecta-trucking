
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useSimpleAccessControl } from '@/hooks/useSimpleAccessControl';
import { Calendar, Clock, AlertTriangle, Crown, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TrialStatusCard() {
  const accessControl = useSimpleAccessControl();
  const navigate = useNavigate();

  console.log('📊 TrialStatusCard:', {
    hasFullAccess: accessControl.hasFullAccess,
    isBlocked: accessControl.isBlocked,
    isInActiveTrial: accessControl.isInActiveTrial,
    daysRemaining: accessControl.daysRemaining,
    statusMessage: accessControl.statusMessage
  });

  // Si tiene acceso completo y está en trial, mostrar info del trial
  if (accessControl.hasFullAccess && accessControl.isInActiveTrial) {
    const getCardStyle = () => {
      if (accessControl.daysRemaining <= 3) return 'border-yellow-500 bg-yellow-50';
      return 'border-green-500 bg-green-50';
    };

    const getProgressValue = () => {
      return ((14 - accessControl.daysRemaining) / 14) * 100;
    };

    return (
      <Card className={getCardStyle()}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            Trial Activo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <p className="text-sm font-medium">
              Te quedan {accessControl.daysRemaining} días de prueba gratuita
            </p>
            
            <div className="space-y-1">
              <Progress value={getProgressValue()} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Trial gratuito</span>
                <span>{accessControl.daysRemaining}/14 días</span>
              </div>
            </div>
          </div>

          {accessControl.daysRemaining <= 7 && (
            <Button 
              onClick={() => navigate('/planes')}
              className="w-full"
              variant={accessControl.daysRemaining <= 3 ? 'default' : 'outline'}
              size="sm"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Ver Planes Disponibles
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Si tiene plan pagado, mostrar info del plan
  if (accessControl.hasFullAccess && !accessControl.isInActiveTrial) {
    return (
      <Card className="border-blue-500 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Crown className="h-5 w-5" />
            Plan Activo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-700">
            {accessControl.statusMessage}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Si no tiene acceso, mostrar mensaje de upgrade
  return (
    <Card className="border-orange-300 bg-orange-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-4 w-4" />
          Acceso Limitado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-orange-700">{accessControl.statusMessage}</p>
        <Button 
          onClick={() => navigate('/planes')}
          className="w-full bg-orange-600 hover:bg-orange-700"
          size="sm"
        >
          <TrendingUp className="w-3 h-3 mr-1" />
          Ver Planes
        </Button>
      </CardContent>
    </Card>
  );
}
