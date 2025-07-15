import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Download, 
  Send, 
  MapPin, 
  Calendar, 
  Truck, 
  User, 
  DollarSign,
  Clock,
  Route
} from "lucide-react";

interface CotizacionViewDialogProps {
  cotizacion: any;
  open: boolean;
  onClose: () => void;
}

const ESTADOS_CONFIG = {
  borrador: { label: "Borrador", color: "bg-gray-500" },
  enviada: { label: "Enviada", color: "bg-blue-500" },
  aprobada: { label: "Aprobada", color: "bg-green-500" },
  cancelada: { label: "Cancelada", color: "bg-red-500" }
};

export function CotizacionViewDialog({ cotizacion, open, onClose }: CotizacionViewDialogProps) {
  if (!cotizacion) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl">{cotizacion.nombre_cotizacion}</DialogTitle>
              <p className="text-muted-foreground">Folio: {cotizacion.folio_cotizacion}</p>
            </div>
            <Badge 
              className={`${ESTADOS_CONFIG[cotizacion.estado as keyof typeof ESTADOS_CONFIG]?.color} text-white`}
            >
              {ESTADOS_CONFIG[cotizacion.estado as keyof typeof ESTADOS_CONFIG]?.label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Fecha de Creación</label>
                <p>{formatDate(cotizacion.created_at)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Validez</label>
                <p>{cotizacion.tiempo_validez_dias} días</p>
              </div>
              {cotizacion.fecha_envio && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Envío</label>
                  <p>{formatDate(cotizacion.fecha_envio)}</p>
                </div>
              )}
              {cotizacion.fecha_aprobacion && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Aprobación</label>
                  <p>{formatDate(cotizacion.fecha_aprobacion)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información de Ruta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Ruta del Viaje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Origen
                  </label>
                  <p className="font-medium">{cotizacion.origen}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Destino
                  </label>
                  <p className="font-medium">{cotizacion.destino}</p>
                </div>
              </div>
              
              {cotizacion.distancia_total > 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Distancia Total</label>
                    <p>{cotizacion.distancia_total} km</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Tiempo Estimado
                    </label>
                    <p>{Math.round(cotizacion.tiempo_estimado / 60)} horas</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recursos Asignados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Recursos Asignados
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-4">
              {cotizacion.vehiculo_id && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Vehículo</label>
                  <p>ID: {cotizacion.vehiculo_id}</p>
                </div>
              )}
              {cotizacion.conductor_id && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Conductor
                  </label>
                  <p>ID: {cotizacion.conductor_id}</p>
                </div>
              )}
              {cotizacion.remolque_id && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Remolque</label>
                  <p>ID: {cotizacion.remolque_id}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información Financiera */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Información Financiera
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Costo Total Interno</label>
                  <p className="text-lg font-semibold">{formatCurrency(cotizacion.costo_total_interno)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Margen de Ganancia</label>
                  <p className="text-lg font-semibold text-green-600">{cotizacion.margen_ganancia}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Precio Cotizado</label>
                  <p className="text-xl font-bold text-primary">{formatCurrency(cotizacion.precio_cotizado)}</p>
                </div>
              </div>
              
              {Object.keys(cotizacion.costos_internos || {}).length > 0 && (
                <div>
                  <Separator className="my-4" />
                  <h4 className="font-medium mb-2">Desglose de Costos Internos</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(cotizacion.costos_internos).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize text-muted-foreground">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <span>{formatCurrency(value as number)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notas y Condiciones */}
          {(cotizacion.notas_internas || cotizacion.condiciones_comerciales) && (
            <Card>
              <CardHeader>
                <CardTitle>Notas y Condiciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cotizacion.notas_internas && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Notas Internas</label>
                    <p className="text-sm">{cotizacion.notas_internas}</p>
                  </div>
                )}
                {cotizacion.condiciones_comerciales && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Condiciones Comerciales</label>
                    <p className="text-sm">{cotizacion.condiciones_comerciales}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Acciones */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Descargar PDF
            </Button>
            {cotizacion.estado === 'borrador' && (
              <Button className="gap-2">
                <Send className="h-4 w-4" />
                Enviar Cliente
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}