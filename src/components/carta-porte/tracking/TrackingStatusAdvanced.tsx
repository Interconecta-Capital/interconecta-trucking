
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Truck,
  Package,
  FileText,
  Stamp
} from 'lucide-react';
import { TrackingStatus, TrackingEvent } from '@/services/tracking/trackingEngine';

interface TrackingStatusAdvancedProps {
  status?: TrackingStatus;
  eventos: TrackingEvent[];
  alertas: string[];
  onIniciarViaje?: () => void;
  onFinalizarViaje?: () => void;
  className?: string;
}

export function TrackingStatusAdvanced({
  status,
  eventos,
  alertas,
  onIniciarViaje,
  onFinalizarViaje,
  className = ''
}: TrackingStatusAdvancedProps) {
  const getStatusIcon = (statusValue: string) => {
    const icons = {
      borrador: FileText,
      xml_generado: Package,
      timbrado: Stamp,
      en_transito: Truck,
      entregado: CheckCircle,
      cancelado: AlertTriangle
    };
    
    const Icon = icons[statusValue as keyof typeof icons] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusColor = (statusValue: string) => {
    const colors = {
      borrador: 'bg-gray-100 text-gray-800',
      xml_generado: 'bg-blue-100 text-blue-800',
      timbrado: 'bg-green-100 text-green-800',
      en_transito: 'bg-yellow-100 text-yellow-800',
      entregado: 'bg-green-100 text-green-800',
      cancelado: 'bg-red-100 text-red-800'
    };
    
    return colors[statusValue as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusDescription = (statusValue: string) => {
    const descriptions = {
      borrador: 'Documento en preparación',
      xml_generado: 'XML generado según SAT',
      timbrado: 'Documento fiscalmente válido',
      en_transito: 'Mercancía en tránsito',
      entregado: 'Entrega completada',
      cancelado: 'Proceso cancelado'
    };
    
    return descriptions[statusValue as keyof typeof descriptions] || 'Estado desconocido';
  };

  if (!status) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            No hay información de tracking disponible
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Estado principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>Estado de la Carta Porte</span>
              {getStatusIcon(status.status)}
            </div>
            <Badge className={getStatusColor(status.status)}>
              {status.status.replace('_', ' ').toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">
                {getStatusDescription(status.status)}
              </span>
              <span className="text-sm text-muted-foreground">
                {status.progreso}%
              </span>
            </div>
            <Progress value={status.progreso} className="w-full" />
          </div>

          {status.ultimoEvento && (
            <div className="bg-muted p-3 rounded-lg">
              <div className="flex items-start space-x-2">
                <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {status.ultimoEvento.descripcion}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(status.ultimoEvento.timestamp).toLocaleString('es-MX')}
                  </p>
                  {status.ultimoEvento.ubicacion && (
                    <div className="flex items-center mt-1">
                      <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {status.ultimoEvento.ubicacion}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {status.proximoEvento && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Próximo: {status.proximoEvento}
              </span>
              {status.status === 'timbrado' && onIniciarViaje && (
                <Button size="sm" onClick={onIniciarViaje}>
                  <Truck className="h-4 w-4 mr-2" />
                  Iniciar Viaje
                </Button>
              )}
              {status.status === 'en_transito' && onFinalizarViaje && (
                <Button size="sm" onClick={onFinalizarViaje}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Finalizar Entrega
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alertas */}
      {alertas.length > 0 && (
        <div className="space-y-2">
          {alertas.map((alerta, index) => (
            <Alert key={index} variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{alerta}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Timeline de eventos recientes */}
      {eventos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historial de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {eventos.slice(0, 5).map((evento, index) => (
                <div key={evento.id} className="flex items-start space-x-3 pb-3 border-b border-border last:border-b-0">
                  <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {evento.descripcion}
                    </p>
                    <div className="flex items-center mt-1 space-x-3">
                      <p className="text-xs text-muted-foreground">
                        {new Date(evento.timestamp).toLocaleString('es-MX')}
                      </p>
                      {evento.automatico && (
                        <Badge variant="outline" className="text-xs">
                          Automático
                        </Badge>
                      )}
                      {evento.uuidFiscal && (
                        <Badge variant="outline" className="text-xs">
                          UUID: {evento.uuidFiscal.slice(-8)}
                        </Badge>
                      )}
                    </div>
                    {evento.ubicacion && (
                      <div className="flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {evento.ubicacion}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
