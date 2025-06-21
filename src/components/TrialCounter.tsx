
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useTrialTracking } from '@/hooks/useTrialTracking';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function TrialCounter() {
  const { trialInfo, loading } = useTrialTracking();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = (trialInfo.daysUsed / trialInfo.totalTrialDays) * 100;

  return (
    <Card className={`${trialInfo.isTrialExpired ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          {trialInfo.isTrialExpired ? (
            <AlertCircle className="h-4 w-4 text-red-500" />
          ) : (
            <Calendar className="h-4 w-4 text-blue-500" />
          )}
          {trialInfo.isTrialExpired ? 'Trial Expirado' : 'Periodo de Prueba'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!trialInfo.isTrialExpired ? (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Días utilizados</span>
                <span className="font-medium">{trialInfo.daysUsed} / {trialInfo.totalTrialDays}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-3 w-3" />
              <span>
                {trialInfo.daysRemaining === 0 
                  ? 'Último día de prueba'
                  : `${trialInfo.daysRemaining} días restantes`
                }
              </span>
            </div>

            {trialInfo.daysRemaining <= 3 && (
              <div className="pt-2">
                <Link to="/planes">
                  <Button size="sm" className="w-full">
                    Actualizar Plan
                  </Button>
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-red-600">
              Tu periodo de prueba ha expirado. Actualiza tu plan para continuar usando todas las funciones.
            </p>
            <Link to="/planes">
              <Button className="w-full">
                Ver Planes
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
