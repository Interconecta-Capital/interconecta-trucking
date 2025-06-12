
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSuscripcion } from '@/hooks/useSuscripcion';
import { usePermisosSubscripcion } from '@/hooks/usePermisosSubscripcion';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

export const EstadoSuscripcion = () => {
  const { 
    suscripcion, 
    enPeriodoPrueba, 
    diasRestantesPrueba, 
    suscripcionVencida,
    estaBloqueado 
  } = useSuscripcion();
  
  const { obtenerUsoActual } = usePermisosSubscripcion();

  if (!suscripcion) return null;

  const usoActual = obtenerUsoActual();

  const getStatusBadge = () => {
    if (estaBloqueado) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Bloqueado</Badge>;
    }
    
    if (suscripcionVencida()) {
      return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Vencido</Badge>;
    }
    
    if (enPeriodoPrueba()) {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Período de Prueba</Badge>;
    }
    
    if (suscripcion.status === 'active') {
      return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Activo</Badge>;
    }
    
    return <Badge variant="outline">{suscripcion.status}</Badge>;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No definida';
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Estado de Suscripción</span>
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Plan actual:</span>
              <p>{suscripcion.plan?.nombre || 'Sin plan'}</p>
            </div>
            <div>
              <span className="font-medium">Fecha de vencimiento:</span>
              <p>{formatDate(suscripcion.fecha_vencimiento)}</p>
            </div>
          </div>

          {enPeriodoPrueba() && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                <Clock className="inline w-4 h-4 mr-1" />
                Te quedan <strong>{diasRestantesPrueba()} días</strong> de período de prueba
              </p>
            </div>
          )}

          {suscripcionVencida() && (
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-sm text-red-800">
                <AlertTriangle className="inline w-4 h-4 mr-1" />
                Su suscripción ha vencido. Renueve para continuar usando la plataforma.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uso Actual vs Límites</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(usoActual).map(([key, data]) => {
            const porcentaje = data.limite ? (data.usado / data.limite) * 100 : 0;
            const esSinLimite = data.limite === null;
            
            return (
              <div key={key} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="capitalize">{key.replace('_', ' ')}</span>
                  <span>
                    {data.usado} {esSinLimite ? '(ilimitado)' : `/ ${data.limite}`}
                  </span>
                </div>
                {!esSinLimite && (
                  <Progress 
                    value={porcentaje} 
                    className={`h-2 ${porcentaje > 80 ? 'bg-red-100' : 'bg-gray-200'}`}
                  />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};
