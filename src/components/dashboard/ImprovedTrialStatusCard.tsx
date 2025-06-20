
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTimezoneAwareTrialTracking } from '@/hooks/useTimezoneAwareTrialTracking';
import { useSuperuser } from '@/hooks/useSuperuser';
import { Calendar, Clock, AlertTriangle, Crown, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ImprovedTrialStatusCard() {
  const { trialInfo, loading } = useTimezoneAwareTrialTracking();
  const { isSuperuser } = useSuperuser();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

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

  const getCardStyle = () => {
    if (trialInfo.isTrialExpired) return 'border-red-300 bg-red-50';
    if (trialInfo.daysRemaining <= 3) return 'border-yellow-500 bg-yellow-50';
    if (trialInfo.isTrialActive) return 'border-green-500 bg-green-50';
    return 'border-gray-300 bg-gray-50';
  };

  const getIcon = () => {
    if (trialInfo.isTrialExpired) return AlertTriangle;
    return Calendar;
  };

  const getMessage = () => {
    if (trialInfo.isTrialExpired) {
      return 'Tu período de prueba ha expirado';
    }
    
    if (trialInfo.daysRemaining === 0) {
      return '¡Último día de tu período de prueba!';
    }
    
    if (trialInfo.daysRemaining === 1) {
      return '¡Solo te queda 1 día de prueba!';
    }
    
    return `Te quedan ${trialInfo.daysRemaining} días de prueba`;
  };

  const getProgressValue = () => {
    return (trialInfo.daysUsed / trialInfo.totalTrialDays) * 100;
  };

  const Icon = getIcon();

  return (
    <Card className={getCardStyle()}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Icon className="h-4 w-4" />
          Período de Prueba
          <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {trialInfo.timezone.split('/')[1]}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <p className="text-sm font-medium">{getMessage()}</p>
          
          {trialInfo.isTrialActive && (
            <div className="space-y-1">
              <Progress value={getProgressValue()} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Días utilizados: {trialInfo.daysUsed}</span>
                <span>Total: {trialInfo.totalTrialDays} días</span>
              </div>
            </div>
          )}
          
          {trialInfo.trialStartDate && trialInfo.trialEndDate && (
            <div className="text-xs text-muted-foreground">
              <div>Inicio: {trialInfo.trialStartDate.toLocaleDateString('es-MX')}</div>
              <div>Fin: {trialInfo.trialEndDate.toLocaleDateString('es-MX')}</div>
            </div>
          )}
        </div>

        <Button 
          onClick={() => navigate('/planes')}
          className="w-full"
          variant={trialInfo.isTrialExpired ? 'destructive' : trialInfo.daysRemaining <= 3 ? 'default' : 'outline'}
          size="sm"
        >
          {trialInfo.isTrialExpired ? 'Adquirir Plan YA' : 'Ver Planes Disponibles'}
        </Button>
      </CardContent>
    </Card>
  );
}
