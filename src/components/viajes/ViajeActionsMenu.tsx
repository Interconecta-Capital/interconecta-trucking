
import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  MoreHorizontal,
  Edit,
  UserCheck,
  PlayCircle,
  CheckCircle,
  XCircle,
  Trash2,
  Navigation,
  FileText,
  Download
} from 'lucide-react';
import { ViajeCompleto } from '@/hooks/useViajesCompletos';
import { toast } from 'sonner';

interface ViajeActionsMenuProps {
  viaje: ViajeCompleto;
  onCambiarEstado: (viajeId: string, nuevoEstado: string, observaciones?: string) => void;
  onAsignarRecursos: (viajeId: string, conductorId?: string, vehiculoId?: string) => void;
  onEliminarViaje: (viajeId: string) => void;
  onVerTracking: (viaje: ViajeCompleto) => void;
}

export const ViajeActionsMenu = ({ 
  viaje, 
  onCambiarEstado, 
  onAsignarRecursos, 
  onEliminarViaje,
  onVerTracking 
}: ViajeActionsMenuProps) => {
  const [showObservacionesDialog, setShowObservacionesDialog] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [accionPendiente, setAccionPendiente] = useState<string | null>(null);
  const [showAsignarDialog, setShowAsignarDialog] = useState(false);
  const [conductorId, setConductorId] = useState(viaje.conductor_id || '');
  const [vehiculoId, setVehiculoId] = useState(viaje.vehiculo_id || '');

  const handleCambiarEstadoConObservaciones = (nuevoEstado: string) => {
    setAccionPendiente(nuevoEstado);
    setShowObservacionesDialog(true);
  };

  const confirmarCambioEstado = () => {
    if (accionPendiente) {
      onCambiarEstado(viaje.id, accionPendiente, observaciones || undefined);
      setShowObservacionesDialog(false);
      setObservaciones('');
      setAccionPendiente(null);
    }
  };

  const handleAsignarRecursos = () => {
    onAsignarRecursos(viaje.id, conductorId || undefined, vehiculoId || undefined);
    setShowAsignarDialog(false);
  };

  const handleGenerarDocumento = (tipo: 'xml' | 'pdf' | 'hoja-ruta') => {
    // TODO: Implementar generación real de documentos
    toast.info(`Generando ${tipo.toUpperCase()}...`);
    
    // Simular descarga
    setTimeout(() => {
      const filename = `${viaje.carta_porte_id}_${tipo}.${tipo === 'pdf' || tipo === 'hoja-ruta' ? 'pdf' : 'xml'}`;
      toast.success(`${tipo.toUpperCase()} generado: ${filename}`);
    }, 2000);
  };

  const getEstadoLabel = (estado: string) => {
    const labels = {
      'programado': 'Programado',
      'en_transito': 'En Tránsito', 
      'completado': 'Completado',
      'cancelado': 'Cancelado',
      'retrasado': 'Retrasado'
    };
    return labels[estado as keyof typeof labels] || estado;
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* Tracking y visualización */}
          <DropdownMenuItem onClick={() => onVerTracking(viaje)}>
            <Navigation className="h-4 w-4 mr-2" />
            Ver Tracking en Tiempo Real
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => {}}>
            <Edit className="h-4 w-4 mr-2" />
            Editar Detalles del Viaje
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Asignación de recursos */}
          <DropdownMenuItem onClick={() => setShowAsignarDialog(true)}>
            <UserCheck className="h-4 w-4 mr-2" />
            Asignar/Cambiar Recursos
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Cambios de estado */}
          {viaje.estado === 'programado' && (
            <DropdownMenuItem onClick={() => handleCambiarEstadoConObservaciones('en_transito')}>
              <PlayCircle className="h-4 w-4 mr-2" />
              Iniciar Viaje
            </DropdownMenuItem>
          )}
          
          {viaje.estado === 'en_transito' && (
            <DropdownMenuItem onClick={() => handleCambiarEstadoConObservaciones('completado')}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Completar Viaje
            </DropdownMenuItem>
          )}

          {['programado', 'en_transito'].includes(viaje.estado) && (
            <DropdownMenuItem onClick={() => handleCambiarEstadoConObservaciones('retrasado')}>
              <XCircle className="h-4 w-4 mr-2" />
              Reportar Retraso
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          {/* Generación de documentos */}
          <DropdownMenuItem onClick={() => handleGenerarDocumento('xml')}>
            <FileText className="h-4 w-4 mr-2" />
            Generar XML SAT
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleGenerarDocumento('pdf')}>
            <FileText className="h-4 w-4 mr-2" />
            Generar PDF Carta Porte
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={() => handleGenerarDocumento('hoja-ruta')}>
            <Download className="h-4 w-4 mr-2" />
            Generar Hoja de Ruta
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* Acciones destructivas */}
          <DropdownMenuItem 
            onClick={() => handleCambiarEstadoConObservaciones('cancelado')}
            className="text-orange-600"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Cancelar Viaje
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => onEliminarViaje(viaje.id)}
            className="text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar Viaje
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog para observaciones */}
      <Dialog open={showObservacionesDialog} onOpenChange={setShowObservacionesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Cambiar estado a: {accionPendiente ? getEstadoLabel(accionPendiente) : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="observaciones">Observaciones (opcional)</Label>
              <Textarea
                id="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Ingrese observaciones sobre este cambio de estado..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowObservacionesDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={confirmarCambioEstado}>
                Confirmar Cambio
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para asignar recursos */}
      <Dialog open={showAsignarDialog} onOpenChange={setShowAsignarDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Asignar Recursos al Viaje</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="conductor">ID del Conductor</Label>
              <Input
                id="conductor"
                value={conductorId}
                onChange={(e) => setConductorId(e.target.value)}
                placeholder="Ingrese ID del conductor"
              />
              {viaje.conductor && (
                <p className="text-sm text-gray-600 mt-1">
                  Actual: {viaje.conductor.nombre}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="vehiculo">ID del Vehículo</Label>
              <Input
                id="vehiculo"
                value={vehiculoId}
                onChange={(e) => setVehiculoId(e.target.value)}
                placeholder="Ingrese ID del vehículo"
              />
              {viaje.vehiculo && (
                <p className="text-sm text-gray-600 mt-1">
                  Actual: {viaje.vehiculo.placa} - {viaje.vehiculo.marca} {viaje.vehiculo.modelo}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAsignarDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAsignarRecursos}>
                Asignar Recursos
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
