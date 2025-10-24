import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useCancelacionCFDI } from '@/hooks/useCancelacionCFDI';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const motivosMap: Record<string, string> = {
  '01': 'Comprobante con errores con relación',
  '02': 'Comprobante con errores sin relación',
  '03': 'No se llevó a cabo la operación',
  '04': 'Operación nominativa en factura global'
};

const estadoConfig = {
  pendiente: {
    icon: Clock,
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    badge: 'warning'
  },
  procesando: {
    icon: AlertCircle,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'default'
  },
  cancelado: {
    icon: CheckCircle2,
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    badge: 'success'
  },
  rechazado: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'destructive'
  },
  error: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    badge: 'destructive'
  }
};

export const SolicitudesCancelacionPendientes = () => {
  const { solicitudesPendientes, loadingSolicitudes } = useCancelacionCFDI();

  if (loadingSolicitudes) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes de Cancelación</CardTitle>
          <CardDescription>Cargando solicitudes pendientes...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!solicitudesPendientes || solicitudesPendientes.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitudes de Cancelación Pendientes</CardTitle>
        <CardDescription>
          Tienes {solicitudesPendientes.length} solicitud(es) esperando respuesta
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {solicitudesPendientes.map((solicitud: any) => {
            const config = estadoConfig[solicitud.estado as keyof typeof estadoConfig] || estadoConfig.procesando;
            const Icon = config.icon;

            return (
              <div
                key={solicitud.id}
                className={`rounded-lg border p-4 ${config.bg} ${config.border}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className={`h-5 w-5 ${config.color} flex-shrink-0 mt-0.5`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-sm">UUID: {solicitud.uuid_cfdi.slice(0, 8)}...</p>
                        <Badge variant={config.badge as any}>
                          {solicitud.estado.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1">
                        Motivo: {motivosMap[solicitud.motivo_cancelacion] || solicitud.motivo_cancelacion}
                      </p>
                      
                      {solicitud.folio_sustitucion && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Folio sustitución: {solicitud.folio_sustitucion.slice(0, 8)}...
                        </p>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        Solicitada: {format(new Date(solicitud.fecha_solicitud), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                      </p>

                      {solicitud.requiere_aceptacion && (
                        <p className="text-xs text-yellow-600 mt-1 font-medium">
                          ⏳ Esperando aceptación del receptor
                        </p>
                      )}

                      {solicitud.mensaje_error && (
                        <p className="text-xs text-red-600 mt-1">
                          Error: {solicitud.mensaje_error}
                        </p>
                      )}
                    </div>
                  </div>

                  {solicitud.acuse_cancelacion && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const blob = new Blob([solicitud.acuse_cancelacion], { type: 'application/xml' });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `acuse_${solicitud.uuid_cfdi}.xml`;
                        link.click();
                      }}
                    >
                      Descargar Acuse
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};