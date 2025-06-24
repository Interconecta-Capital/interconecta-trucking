
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSuscripcion } from '@/hooks/useSuscripcion';
import { LimitUsageIndicator } from '@/components/LimitUsageIndicator';
import { PlanSummaryCard } from './PlanSummaryCard';
import { Clock, AlertTriangle, CheckCircle, XCircle, RefreshCw, Settings } from 'lucide-react';

export const EstadoSuscripcion = () => {
  const { 
    suscripcion, 
    enPeriodoPrueba, 
    diasRestantesPrueba, 
    suscripcionVencida,
    estaBloqueado,
    verificarSuscripcion,
    isVerifyingSubscription,
    abrirPortalCliente,
    isOpeningPortal
  } = useSuscripcion();

  if (!suscripcion) return null;

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

  const handleVerificarSuscripcion = () => {
    verificarSuscripcion();
  };

  const handleAbrirPortal = () => {
    abrirPortalCliente();
  };

  return (
    <div className="space-y-6">
      {/* Resumen del Plan */}
      <PlanSummaryCard />

      {/* Detalles de la Suscripción */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Detalles de Suscripción</span>
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

          <div className="flex gap-2">
            <Button
              onClick={handleVerificarSuscripcion}
              disabled={isVerifyingSubscription}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isVerifyingSubscription ? 'animate-spin' : ''}`} />
              {isVerifyingSubscription ? 'Verificando...' : 'Verificar Estado'}
            </Button>

            {suscripcion.status === 'active' && (
              <Button
                onClick={handleAbrirPortal}
                disabled={isOpeningPortal}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Settings className="w-4 h-4 mr-2" />
                {isOpeningPortal ? 'Abriendo...' : 'Gestionar'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Uso Detallado */}
      <Card>
        <CardHeader>
          <CardTitle>Uso Detallado por Recurso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <LimitUsageIndicator resourceType="cartas_porte" />
          <LimitUsageIndicator resourceType="conductores" />
          <LimitUsageIndicator resourceType="vehiculos" />
          <LimitUsageIndicator resourceType="socios" />
        </CardContent>
      </Card>
    </div>
  );
};
