
import { useState, useEffect } from 'react';
import { ResponsiveDialog, ResponsiveDialogContent, ResponsiveDialogDescription, ResponsiveDialogHeader, ResponsiveDialogTitle } from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStableVehiculos } from '@/hooks/useStableVehiculos';
import { useRemolques } from '@/hooks/useRemolques';
import { useStableAuth } from '@/hooks/useStableAuth';
import { toast } from 'sonner';
import { Link } from 'lucide-react';

interface Remolque {
  id: string;
  placa: string;
  autotransporte_id?: string;
}

interface VinculacionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  remolque: Remolque | null;
  onSuccess?: () => void;
}

export function VinculacionDialog({ open, onOpenChange, remolque, onSuccess }: VinculacionDialogProps) {
  const { user } = useStableAuth();
  const { vehiculos } = useStableVehiculos(user?.id);
  const { actualizarRemolque } = useRemolques();
  const [loading, setLoading] = useState(false);
  const [selectedVehiculo, setSelectedVehiculo] = useState('');

  useEffect(() => {
    if (remolque?.autotransporte_id) {
      setSelectedVehiculo(remolque.autotransporte_id);
    } else {
      setSelectedVehiculo('sin_vincular');
    }
  }, [remolque]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remolque) return;

    try {
      setLoading(true);
      
      const updateData = {
        autotransporte_id: selectedVehiculo === 'sin_vincular' ? undefined : selectedVehiculo,
        estado: selectedVehiculo === 'sin_vincular' ? 'disponible' : 'vinculado'
      };
      
      await actualizarRemolque({ 
        id: remolque.id, 
        data: updateData
      });
      
      toast.success(selectedVehiculo === 'sin_vincular' ? 'Remolque desvinculado exitosamente' : 'Remolque vinculado exitosamente');
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Error al actualizar vinculación');
    } finally {
      setLoading(false);
    }
  };

  const vehiculosDisponibles = vehiculos.filter(v => v.activo && v.estado === 'disponible');

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Vincular Remolque a Vehículo
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {remolque && `Gestiona la vinculación del remolque ${remolque.placa}`}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehiculo">Vehículo</Label>
            <Select value={selectedVehiculo} onValueChange={setSelectedVehiculo}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un vehículo o deja vacío para desvincular" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sin_vincular">Sin vincular</SelectItem>
                {vehiculosDisponibles.map((vehiculo) => (
                  <SelectItem key={vehiculo.id} value={vehiculo.id}>
                    {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
              {loading ? 'Guardando...' : 'Actualizar Vinculación'}
            </Button>
          </div>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
