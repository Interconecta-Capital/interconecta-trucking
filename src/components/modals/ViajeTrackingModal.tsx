
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Truck, MapPin, Clock, Play, Square, AlertTriangle, CheckCircle } from 'lucide-react';
import { useViajesEstados, Viaje, EventoViaje } from '@/hooks/useViajesEstados';

interface ViajeTrackingModalProps {
  viaje: Viaje | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ESTADOS_CONFIG = {
  programado: { label: 'Programado', color: 'bg-blue-500 text-white', icon: Clock },
  en_transito: { label: 'En Tránsito', color: 'bg-green-500 text-white', icon: Play },
  completado: { label: 'Completado', color: 'bg-green-600 text-white', icon: CheckCircle },
  cancelado: { label: 'Cancelado', color: 'bg-gray-500 text-white', icon: Square },
  retrasado: { label: 'Retrasado', color: 'bg-orange-500 text-white', icon: AlertTriangle }
};

export const ViajeTrackingModal = ({ viaje, open, onOpenChange }: ViajeTrackingModalProps) => {
  const [eventos, setEventos] = useState<EventoViaje[]>([]);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [ubicacionActual, setUbicacionActual] = useState('');
  
  const { 
    obtenerEventosViaje, 
    cambiarEstadoViaje, 
    reportarRetraso,
    iniciarViaje,
    completarViaje,
    isLoading 
  } = useViajesEstados();

  useEffect(() => {
    if (viaje?.id) {
      cargarEventos();
    }
  }, [viaje?.id]);

  const cargarEventos = async () => {
    if (!viaje?.id) return;
    try {
      const eventosData = await obtenerEventosViaje(viaje.id);
      setEventos(eventosData);
    } catch (error) {
      console.error('Error al cargar eventos:', error);
    }
  };

  const handleCambiarEstado = () => {
    if (!viaje?.id || !nuevoEstado) return;

    cambiarEstadoViaje({
      viajeId: viaje.id,
      nuevoEstado: nuevoEstado as Viaje['estado'],
      observaciones: observaciones || undefined,
      ubicacionActual: ubicacionActual || undefined
    });

    // Resetear formulario
    setNuevoEstado('');
    setObservaciones('');
    setUbicacionActual('');
    
    // Recargar eventos después de un momento
    setTimeout(cargarEventos, 1000);
  };

  const handleIniciarViaje = () => {
    if (!viaje?.id) return;
    iniciarViaje(viaje.id, ubicacionActual || undefined);
    setTimeout(cargarEventos, 1000);
  };

  const handleCompletarViaje = () => {
    if (!viaje?.id) return;
    completarViaje(viaje.id, observaciones || undefined);
    setTimeout(cargarEventos, 1000);
  };

  const handleReportarRetraso = () => {
    if (!viaje?.id || !observaciones) return;
    reportarRetraso(viaje.id, observaciones);
    setObservaciones('');
    setTimeout(cargarEventos, 1000);
  };

  if (!viaje) return null;

  const estadoConfig = ESTADOS_CONFIG[viaje.estado] || ESTADOS_CONFIG.programado;
  const IconComponent = estadoConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Tracking - Viaje {viaje.carta_porte_id}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información del viaje */}
          <div className="lg:col-span-2 space-y-4">
            {/* Estado actual */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5" />
                  Estado Actual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={estadoConfig.color}>
                  {estadoConfig.label}
                </Badge>
                
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Origen:</span>
                    <p className="font-medium">{viaje.origen}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Destino:</span>
                    <p className="font-medium">{viaje.destino}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Inicio programado:</span>
                    <p className="font-medium">{formatDateTime(viaje.fecha_inicio_programada)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Fin programado:</span>
                    <p className="font-medium">{formatDateTime(viaje.fecha_fin_programada)}</p>
                  </div>
                </div>

                {viaje.fecha_inicio_real && (
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">Inicio real:</span>
                    <p className="font-medium">{formatDateTime(viaje.fecha_inicio_real)}</p>
                  </div>
                )}

                {viaje.fecha_fin_real && (
                  <div className="mt-2 text-sm">
                    <span className="text-muted-foreground">Fin real:</span>
                    <p className="font-medium">{formatDateTime(viaje.fecha_fin_real)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Historial de eventos */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Historial de Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {eventos.map((evento) => (
                    <div key={evento.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {getEventoIcon(evento.tipo_evento)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{evento.descripcion}</p>
                        {evento.ubicacion && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {evento.ubicacion}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDateTime(evento.timestamp)}
                          {evento.automatico && ' (Automático)'}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {eventos.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No hay eventos registrados
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Panel de control */}
          <div className="space-y-4">
            {/* Acciones rápidas */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {viaje.estado === 'programado' && (
                  <Button onClick={handleIniciarViaje} disabled={isLoading} className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Viaje
                  </Button>
                )}

                {viaje.estado === 'en_transito' && (
                  <>
                    <Button onClick={handleCompletarViaje} disabled={isLoading} className="w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completar Viaje
                    </Button>
                    
                    <Button 
                      onClick={handleReportarRetraso} 
                      disabled={isLoading || !observaciones} 
                      variant="outline" 
                      className="w-full"
                    >
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Reportar Retraso
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Cambio de estado manual */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Cambiar Estado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label>Nuevo Estado</Label>
                  <Select value={nuevoEstado} onValueChange={setNuevoEstado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="programado">Programado</SelectItem>
                      <SelectItem value="en_transito">En Tránsito</SelectItem>
                      <SelectItem value="completado">Completado</SelectItem>
                      <SelectItem value="retrasado">Retrasado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Ubicación Actual</Label>
                  <Input
                    value={ubicacionActual}
                    onChange={(e) => setUbicacionActual(e.target.value)}
                    placeholder="Ej: Km 45 Carretera México-Guadalajara"
                  />
                </div>

                <div>
                  <Label>Observaciones</Label>
                  <Textarea
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Detalles del cambio de estado..."
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleCambiarEstado} 
                  disabled={isLoading || !nuevoEstado}
                  className="w-full"
                >
                  Actualizar Estado
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('es-MX');
}

function getEventoIcon(tipoEvento: EventoViaje['tipo_evento']) {
  switch (tipoEvento) {
    case 'inicio':
      return <Play className="h-4 w-4 text-green-500" />;
    case 'entrega':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'retraso':
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case 'incidente':
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    case 'ubicacion':
      return <MapPin className="h-4 w-4 text-blue-500" />;
    case 'parada':
      return <Square className="h-4 w-4 text-gray-500" />;
    default:
      return <Clock className="h-4 w-4 text-gray-400" />;
  }
}
