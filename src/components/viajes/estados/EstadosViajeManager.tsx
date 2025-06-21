
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Square, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  MapPin,
  Truck,
  Calendar,
  User,
  Package
} from 'lucide-react';
import { useViajesEstados, Viaje } from '@/hooks/useViajesEstados';
import { toast } from 'sonner';

interface EstadosViajeManagerProps {
  viaje: Viaje;
  onViajeUpdate: () => void;
}

const ESTADOS_CONFIG = {
  programado: { 
    label: 'Programado', 
    color: 'bg-blue-500 text-white', 
    icon: Clock,
    description: 'Viaje programado, pendiente de iniciar'
  },
  en_transito: { 
    label: 'En Tránsito', 
    color: 'bg-green-500 text-white', 
    icon: Truck,
    description: 'Mercancía en movimiento'
  },
  completado: { 
    label: 'Completado', 
    color: 'bg-green-600 text-white', 
    icon: CheckCircle,
    description: 'Entrega realizada exitosamente'
  },
  cancelado: { 
    label: 'Cancelado', 
    color: 'bg-red-500 text-white', 
    icon: Square,
    description: 'Viaje cancelado'
  },
  retrasado: { 
    label: 'Retrasado', 
    color: 'bg-orange-500 text-white', 
    icon: AlertTriangle,
    description: 'Retraso reportado en el viaje'
  }
};

export const EstadosViajeManager: React.FC<EstadosViajeManagerProps> = ({ 
  viaje, 
  onViajeUpdate 
}) => {
  const [nuevoEstado, setNuevoEstado] = useState<string>('');
  const [observaciones, setObservaciones] = useState('');
  const [ubicacionActual, setUbicacionActual] = useState('');
  const [tiempoRetraso, setTiempoRetraso] = useState<number>(0);

  const { 
    cambiarEstadoViaje,
    iniciarViaje,
    completarViaje,
    reportarRetraso,
    actualizarUbicacion,
    isLoading 
  } = useViajesEstados();

  const estadoActual = ESTADOS_CONFIG[viaje.estado] || ESTADOS_CONFIG.programado;
  const IconActual = estadoActual.icon;

  const handleCambioEstado = async () => {
    if (!nuevoEstado) {
      toast.error('Selecciona un nuevo estado');
      return;
    }

    try {
      await cambiarEstadoViaje({
        viajeId: viaje.id,
        nuevoEstado: nuevoEstado as Viaje['estado'],
        observaciones: observaciones || undefined,
        ubicacionActual: ubicacionActual || undefined
      });

      toast.success('Estado actualizado correctamente');
      onViajeUpdate();
      
      // Limpiar formulario
      setNuevoEstado('');
      setObservaciones('');
      setUbicacionActual('');
    } catch (error) {
      console.error('Error cambiando estado:', error);
      toast.error('Error al cambiar el estado del viaje');
    }
  };

  const handleAccionRapida = async (accion: string) => {
    try {
      switch (accion) {
        case 'iniciar':
          await iniciarViaje(viaje.id, ubicacionActual || undefined);
          toast.success('Viaje iniciado');
          break;
        case 'completar':
          await completarViaje(viaje.id, observaciones || 'Viaje completado');
          toast.success('Viaje completado');
          break;
        case 'retraso':
          if (!observaciones) {
            toast.error('Especifica el motivo del retraso');
            return;
          }
          await reportarRetraso(viaje.id, observaciones, tiempoRetraso || undefined);
          toast.success('Retraso reportado');
          break;
        case 'ubicacion':
          if (!ubicacionActual) {
            toast.error('Especifica la ubicación actual');
            return;
          }
          await actualizarUbicacion(viaje.id, 
            { lat: 0, lng: 0 }, // TODO: Obtener coordenadas reales
            ubicacionActual
          );
          toast.success('Ubicación actualizada');
          break;
      }
      onViajeUpdate();
    } catch (error) {
      console.error('Error en acción rápida:', error);
      toast.error('Error al ejecutar la acción');
    }
  };

  const getAccionesDisponibles = () => {
    const acciones = [];
    
    switch (viaje.estado) {
      case 'programado':
        acciones.push({
          key: 'iniciar',
          label: 'Iniciar Viaje',
          icon: Play,
          variant: 'default' as const
        });
        break;
      case 'en_transito':
        acciones.push(
          {
            key: 'completar',
            label: 'Completar',
            icon: CheckCircle,
            variant: 'default' as const
          },
          {
            key: 'retraso',
            label: 'Reportar Retraso',
            icon: AlertTriangle,
            variant: 'outline' as const
          },
          {
            key: 'ubicacion',
            label: 'Actualizar Ubicación',
            icon: MapPin,
            variant: 'outline' as const
          }
        );
        break;
    }
    
    return acciones;
  };

  const calcularTiempoTranscurrido = () => {
    if (!viaje.fecha_inicio_real) return null;
    
    const inicio = new Date(viaje.fecha_inicio_real);
    const ahora = new Date();
    const diferencia = ahora.getTime() - inicio.getTime();
    
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${horas}h ${minutos}m`;
  };

  return (
    <div className="space-y-6">
      {/* Estado Actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <IconActual className="h-6 w-6" />
            Estado Actual del Viaje
            <Badge className={estadoActual.color}>
              {estadoActual.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {estadoActual.description}
          </p>
          
          {/* Información del viaje */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-green-600" />
                <span className="font-medium">Origen:</span>
                <span className="text-sm">{viaje.origen}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-red-600" />
                <span className="font-medium">Destino:</span>
                <span className="text-sm">{viaje.destino}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              {viaje.fecha_inicio_real && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Tiempo transcurrido:</span>
                  <span className="text-sm">{calcularTiempoTranscurrido()}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Inicio programado:</span>
                <span className="text-sm">
                  {new Date(viaje.fecha_inicio_programada).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          {getAccionesDisponibles().length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-3">Acciones Rápidas</h4>
                <div className="flex flex-wrap gap-2">
                  {getAccionesDisponibles().map((accion) => {
                    const IconComponent = accion.icon;
                    return (
                      <Button
                        key={accion.key}
                        variant={accion.variant}
                        size="sm"
                        onClick={() => handleAccionRapida(accion.key)}
                        disabled={isLoading}
                        className="flex items-center gap-2"
                      >
                        <IconComponent className="h-4 w-4" />
                        {accion.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Cambio Manual de Estado */}
      <Card>
        <CardHeader>
          <CardTitle>Cambio Manual de Estado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nuevo-estado">Nuevo Estado</Label>
              <Select value={nuevoEstado} onValueChange={setNuevoEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ESTADOS_CONFIG).map(([key, config]) => (
                    <SelectItem 
                      key={key} 
                      value={key} 
                      disabled={key === viaje.estado}
                    >
                      <div className="flex items-center gap-2">
                        <config.icon className="h-4 w-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="ubicacion-actual">Ubicación Actual</Label>
              <Input
                id="ubicacion-actual"
                value={ubicacionActual}
                onChange={(e) => setUbicacionActual(e.target.value)}
                placeholder="Ej: Km 45 Carretera México-Guadalajara"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Detalles del cambio de estado, motivos, incidencias..."
              rows={3}
            />
          </div>

          {nuevoEstado === 'retrasado' && (
            <div>
              <Label htmlFor="tiempo-retraso">Tiempo de retraso estimado (minutos)</Label>
              <Input
                id="tiempo-retraso"
                type="number"
                value={tiempoRetraso}
                onChange={(e) => setTiempoRetraso(Number(e.target.value))}
                placeholder="60"
                min="0"
              />
            </div>
          )}

          <Button 
            onClick={handleCambioEstado}
            disabled={!nuevoEstado || isLoading}
            className="w-full"
          >
            {isLoading ? 'Actualizando...' : 'Cambiar Estado'}
          </Button>
        </CardContent>
      </Card>

      {/* Alertas y Validaciones */}
      {viaje.estado === 'en_transito' && (
        <Alert>
          <Truck className="h-4 w-4" />
          <AlertDescription>
            Viaje en curso. Asegúrate de mantener actualizada la ubicación y reportar cualquier incidencia.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
