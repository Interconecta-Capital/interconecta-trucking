
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { useEstadosInteligentes } from '@/hooks/useEstadosInteligentes';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface EstadoSelectorProps {
  entidadTipo: 'vehiculo' | 'conductor' | 'socio';
  entidadId: string;
  estadoActual: string;
  onEstadoChange: () => void;
}

interface EstadoConfig {
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ESTADOS_CONFIG: Record<string, Record<string, EstadoConfig>> = {
  vehiculo: {
    disponible: { label: 'Disponible', color: 'bg-green-500', icon: CheckCircle },
    en_viaje: { label: 'En Viaje', color: 'bg-blue-500', icon: Clock },
    mantenimiento: { label: 'Mantenimiento', color: 'bg-orange-500', icon: AlertCircle },
    revision: { label: 'Revisión', color: 'bg-yellow-500', icon: Clock },
    fuera_servicio: { label: 'Fuera de Servicio', color: 'bg-red-500', icon: XCircle }
  },
  conductor: {
    disponible: { label: 'Disponible', color: 'bg-green-500', icon: CheckCircle },
    en_viaje: { label: 'En Viaje', color: 'bg-blue-500', icon: Clock },
    descanso: { label: 'Descanso', color: 'bg-gray-500', icon: Clock },
    vacaciones: { label: 'Vacaciones', color: 'bg-purple-500', icon: Clock },
    baja_temporal: { label: 'Baja Temporal', color: 'bg-orange-500', icon: AlertCircle },
    fuera_servicio: { label: 'Fuera de Servicio', color: 'bg-red-500', icon: XCircle }
  },
  socio: {
    activo: { label: 'Activo', color: 'bg-green-500', icon: CheckCircle },
    inactivo: { label: 'Inactivo', color: 'bg-gray-500', icon: Clock },
    bloqueado: { label: 'Bloqueado', color: 'bg-red-500', icon: XCircle },
    revision: { label: 'En Revisión', color: 'bg-yellow-500', icon: AlertCircle }
  }
};

export const EstadoSelector = ({ entidadTipo, entidadId, estadoActual, onEstadoChange }: EstadoSelectorProps) => {
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [motivo, setMotivo] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const { cambiarEstado, isLoading } = useEstadosInteligentes();

  const estados = ESTADOS_CONFIG[entidadTipo];
  const estadoConfig = estados[estadoActual] || { label: estadoActual, color: 'bg-gray-500', icon: AlertCircle };
  const IconComponent = estadoConfig.icon;

  const handleCambiarEstado = async () => {
    if (!nuevoEstado) return;

    const exito = await cambiarEstado(
      entidadTipo,
      entidadId,
      nuevoEstado,
      motivo || undefined,
      observaciones || undefined
    );

    if (exito) {
      setNuevoEstado('');
      setMotivo('');
      setObservaciones('');
      onEstadoChange();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IconComponent className="h-5 w-5" />
          Estado Actual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado actual */}
        <div className="flex items-center gap-2">
          <Badge className={`${estadoConfig.color} text-white`}>
            {estadoConfig.label}
          </Badge>
        </div>

        {/* Cambiar estado */}
        <div className="space-y-3 p-4 border rounded-lg">
          <h4 className="font-medium">Cambiar Estado</h4>
          
          <div>
            <Label htmlFor="nuevo-estado">Nuevo Estado</Label>
            <Select value={nuevoEstado} onValueChange={setNuevoEstado}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(estados).map(([key, config]) => (
                  <SelectItem key={key} value={key} disabled={key === estadoActual}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="motivo">Motivo</Label>
            <Select value={motivo} onValueChange={setMotivo}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar motivo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="programacion">Programación</SelectItem>
                <SelectItem value="emergencia">Emergencia</SelectItem>
                <SelectItem value="mantenimiento_preventivo">Mantenimiento Preventivo</SelectItem>
                <SelectItem value="mantenimiento_correctivo">Mantenimiento Correctivo</SelectItem>
                <SelectItem value="revision_programada">Revisión Programada</SelectItem>
                <SelectItem value="decision_administrativa">Decisión Administrativa</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Detalles adicionales..."
              rows={3}
            />
          </div>

          <Button
            onClick={handleCambiarEstado}
            disabled={!nuevoEstado || isLoading}
            className="w-full"
          >
            {isLoading ? 'Cambiando...' : 'Cambiar Estado'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
