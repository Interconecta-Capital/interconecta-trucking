
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useEstadosInteligentes } from '@/hooks/useEstadosInteligentes';
import { Calendar, Clock, DollarSign } from 'lucide-react';

interface ProgramarModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entidadTipo: 'vehiculo' | 'conductor';
  entidadId: string;
  onSuccess: () => void;
}

const TIPOS_PROGRAMACION = {
  vehiculo: [
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'revision', label: 'Revisión Técnica' },
    { value: 'verificacion', label: 'Verificación Vehicular' },
    { value: 'seguro', label: 'Renovación de Seguro' }
  ],
  conductor: [
    { value: 'revision', label: 'Revisión Médica' },
    { value: 'licencia', label: 'Renovación de Licencia' },
    { value: 'mantenimiento', label: 'Capacitación' }
  ]
};

export const ProgramarModal = ({ open, onOpenChange, entidadTipo, entidadId, onSuccess }: ProgramarModalProps) => {
  const [formData, setFormData] = useState({
    tipo_programacion: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    sin_fecha_fin: false,
    observaciones: '',
    costo: '',
    proveedor: ''
  });

  const { crearProgramacion, isLoading } = useEstadosInteligentes();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tipo_programacion || !formData.descripcion || !formData.fecha_inicio) {
      return;
    }

    const programacion = {
      entidad_tipo: entidadTipo,
      entidad_id: entidadId,
      tipo_programacion: formData.tipo_programacion as any,
      descripcion: formData.descripcion,
      fecha_inicio: formData.fecha_inicio,
      fecha_fin: formData.sin_fecha_fin ? null : formData.fecha_fin || null,
      sin_fecha_fin: formData.sin_fecha_fin,
      estado: 'programado' as const,
      observaciones: formData.observaciones || null,
      costo: formData.costo ? parseFloat(formData.costo) : null,
      proveedor: formData.proveedor || null
    };

    const resultado = await crearProgramacion(programacion);
    
    if (resultado) {
      setFormData({
        tipo_programacion: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: '',
        sin_fecha_fin: false,
        observaciones: '',
        costo: '',
        proveedor: ''
      });
      onOpenChange(false);
      onSuccess();
    }
  };

  const tiposProgramacion = TIPOS_PROGRAMACION[entidadTipo];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Programar {entidadTipo === 'vehiculo' ? 'Vehículo' : 'Conductor'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipo">Tipo de Programación</Label>
              <Select 
                value={formData.tipo_programacion} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_programacion: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {tiposProgramacion.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="fecha-inicio">Fecha de Inicio</Label>
              <Input
                id="fecha-inicio"
                type="date"
                value={formData.fecha_inicio}
                onChange={(e) => setFormData(prev => ({ ...prev, fecha_inicio: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Ej: Cambio de aceite y filtros"
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sin-fecha-fin"
                checked={formData.sin_fecha_fin}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, sin_fecha_fin: checked as boolean, fecha_fin: '' }))
                }
              />
              <Label htmlFor="sin-fecha-fin" className="text-sm">
                Sin fecha de fin definida (mantenimiento indefinido)
              </Label>
            </div>

            {!formData.sin_fecha_fin && (
              <div>
                <Label htmlFor="fecha-fin">Fecha de Fin Estimada</Label>
                <Input
                  id="fecha-fin"
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) => setFormData(prev => ({ ...prev, fecha_fin: e.target.value }))}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="costo">Costo Estimado</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="costo"
                  type="number"
                  step="0.01"
                  value={formData.costo}
                  onChange={(e) => setFormData(prev => ({ ...prev, costo: e.target.value }))}
                  placeholder="0.00"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="proveedor">Proveedor/Taller</Label>
              <Input
                id="proveedor"
                value={formData.proveedor}
                onChange={(e) => setFormData(prev => ({ ...prev, proveedor: e.target.value }))}
                placeholder="Nombre del proveedor"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
              placeholder="Notas adicionales..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              <Clock className="h-4 w-4 mr-2" />
              {isLoading ? 'Programando...' : 'Programar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
