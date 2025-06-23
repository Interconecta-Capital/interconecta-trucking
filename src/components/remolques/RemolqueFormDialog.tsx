
import { useState } from 'react';
import { ResponsiveDialog, ResponsiveDialogContent, ResponsiveDialogDescription, ResponsiveDialogHeader, ResponsiveDialogTitle } from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRemolques } from '@/hooks/useRemolques';
import { useStableVehiculos } from '@/hooks/useStableVehiculos';
import { useCatalogosHibrido } from '@/hooks/useCatalogosHibrido';
import { useStableAuth } from '@/hooks/useStableAuth';
import { toast } from 'sonner';
import { Wrench } from 'lucide-react';

interface Remolque {
  id: string;
  alias?: string;
  placa: string;
  subtipo_remolque?: string;
  anio?: number;
  num_serie?: string;
  aseguradora?: string;
  poliza_seguro?: string;
  estado: string;
  vehiculo_asignado_id?: string;
}

interface RemolqueFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remolque?: Remolque;
  onSuccess?: () => void;
}

export function RemolqueFormDialog({ open, onOpenChange, remolque, onSuccess }: RemolqueFormDialogProps) {
  const { user } = useStableAuth();
  const { remolques, crearRemolque, actualizarRemolque } = useRemolques(user?.id);
  const { vehiculos } = useStableVehiculos(user?.id);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    alias: remolque?.alias || '',
    placa: remolque?.placa || '',
    subtipo_remolque: remolque?.subtipo_remolque || '',
    anio: remolque?.anio ? String(remolque.anio) : '',
    num_serie: remolque?.num_serie || '',
    aseguradora: remolque?.aseguradora || '',
    poliza_seguro: remolque?.poliza_seguro || '',
    estado: remolque?.estado || 'disponible',
    vehiculo_asignado_id: remolque?.vehiculo_asignado_id || ''
  });

  const [subtipoSearch, setSubtipoSearch] = useState('');
  const subtiposQuery = useCatalogosHibrido('remolques', subtipoSearch);

  const vehiculosDisponibles = vehiculos.filter(v => {
    const asignados = remolques.filter(r => r.vehiculo_asignado_id === v.id).length;
    if (asignados === 0) return true;
    if (v.config_vehicular === 'T3S2R4' && asignados < 2) return true;
    return remolque?.vehiculo_asignado_id === v.id;
  });

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value } as any;
      if (field === 'vehiculo_asignado_id') {
        updated.estado = value ? 'asignado' : 'disponible';
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.placa.trim()) {
      toast.error('La placa es obligatoria');
      return;
    }

    try {
      setLoading(true);
      
      const dataToSave = {
        ...formData,
        anio: formData.anio ? parseInt(formData.anio) : undefined,
      };

      if (remolque) {
        await actualizarRemolque(remolque.id, dataToSave);
        toast.success('Remolque actualizado exitosamente');
      } else {
        await crearRemolque(dataToSave);
        toast.success('Remolque creado exitosamente');
      }
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar remolque');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      alias: remolque?.alias || '',
      placa: remolque?.placa || '',
      subtipo_remolque: remolque?.subtipo_remolque || '',
      anio: remolque?.anio ? String(remolque.anio) : '',
      num_serie: remolque?.num_serie || '',
      aseguradora: remolque?.aseguradora || '',
      poliza_seguro: remolque?.poliza_seguro || '',
      estado: remolque?.estado || 'disponible',
      vehiculo_asignado_id: remolque?.vehiculo_asignado_id || ''
    });
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            {remolque ? 'Editar Remolque' : 'Nuevo Remolque'}
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {remolque ? 'Modifica los datos del remolque' : 'Ingresa los datos del nuevo remolque'}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sección 1 */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-700">Datos de Identificación</h3>
            <div className="space-y-2">
              <Label htmlFor="alias">Alias</Label>
              <Input
                id="alias"
                value={formData.alias}
                onChange={(e) => handleFieldChange('alias', e.target.value)}
                placeholder="Caja Seca #12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="placa">Placa *</Label>
              <Input
                id="placa"
                value={formData.placa}
                onChange={(e) => handleFieldChange('placa', e.target.value.toUpperCase())}
                placeholder="Ej: ABC123"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Subtipo de Remolque *</Label>
              <Select
                value={formData.subtipo_remolque}
                onValueChange={(value) => handleFieldChange('subtipo_remolque', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Buscar subtipo..." />
                </SelectTrigger>
                <SelectContent>
                  {subtiposQuery.data?.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="anio">Año/Modelo</Label>
                <Input
                  id="anio"
                  type="number"
                  value={formData.anio}
                  onChange={(e) => handleFieldChange('anio', e.target.value)}
                  placeholder="2023"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="num_serie">Número de Serie (VIN)</Label>
                <Input
                  id="num_serie"
                  value={formData.num_serie}
                  onChange={(e) => handleFieldChange('num_serie', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Sección 2 */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-700">Documentación y Seguros</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aseguradora">Aseguradora</Label>
                <Input
                  id="aseguradora"
                  value={formData.aseguradora}
                  onChange={(e) => handleFieldChange('aseguradora', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="poliza">Número de Póliza</Label>
                <Input
                  id="poliza"
                  value={formData.poliza_seguro}
                  onChange={(e) => handleFieldChange('poliza_seguro', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Sección 3 */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-gray-700">Asignación y Estado</h3>
            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => handleFieldChange('estado', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disponible">Disponible</SelectItem>
                  <SelectItem value="en_mantenimiento">En Mantenimiento</SelectItem>
                  <SelectItem value="asignado">Asignado</SelectItem>
                  <SelectItem value="fuera_servicio">Fuera de Servicio</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehiculo">Asignado a</Label>
              <Select
                value={formData.vehiculo_asignado_id}
                onValueChange={(value) => handleFieldChange('vehiculo_asignado_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Buscar por placa o alias..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin asignar</SelectItem>
                  {vehiculosDisponibles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.placa} - {v.marca} {v.modelo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Guardando...' : remolque ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
