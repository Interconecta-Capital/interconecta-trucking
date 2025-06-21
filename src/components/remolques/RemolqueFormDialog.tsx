
import { useState } from 'react';
import { ResponsiveDialog, ResponsiveDialogContent, ResponsiveDialogDescription, ResponsiveDialogHeader, ResponsiveDialogTitle } from '@/components/ui/responsive-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRemolques } from '@/hooks/useRemolques';
import { useStableAuth } from '@/hooks/useStableAuth';
import { toast } from 'sonner';
import { Wrench } from 'lucide-react';

interface Remolque {
  id: string;
  placa: string;
  tipo_remolque?: string;
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
  const { crearRemolque, actualizarRemolque } = useRemolques(user?.id);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    placa: remolque?.placa || '',
    tipo_remolque: remolque?.tipo_remolque || '',
    estado: remolque?.estado || 'disponible'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.placa.trim()) {
      toast.error('La placa es obligatoria');
      return;
    }

    try {
      setLoading(true);
      
      if (remolque) {
        await actualizarRemolque(remolque.id, formData);
        toast.success('Remolque actualizado exitosamente');
      } else {
        await crearRemolque(formData);
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
      placa: remolque?.placa || '',
      tipo_remolque: remolque?.tipo_remolque || '',
      estado: remolque?.estado || 'disponible'
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="placa">Placa *</Label>
            <Input
              id="placa"
              value={formData.placa}
              onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
              placeholder="Ej: ABC123"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo_remolque">Tipo de Remolque</Label>
            <Select 
              value={formData.tipo_remolque} 
              onValueChange={(value) => setFormData({ ...formData, tipo_remolque: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CTR001">Semirremolque</SelectItem>
                <SelectItem value="CTR002">Remolque</SelectItem>
                <SelectItem value="CTR003">Dolly</SelectItem>
                <SelectItem value="CTR004">Chasis porta contenedor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select 
              value={formData.estado} 
              onValueChange={(value) => setFormData({ ...formData, estado: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disponible">Disponible</SelectItem>
                <SelectItem value="vinculado">Vinculado</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="fuera_servicio">Fuera de Servicio</SelectItem>
              </SelectContent>
            </Select>
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
