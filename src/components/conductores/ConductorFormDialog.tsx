
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useConductores } from '@/hooks/useConductores';
import { Plus } from 'lucide-react';

interface ConductorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function ConductorFormDialog({ 
  open, 
  onOpenChange, 
  onSuccess, 
  trigger 
}: ConductorFormDialogProps) {
  const { createConductor } = useConductores();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    rfc: '',
    curp: '',
    num_licencia: '',
    tipo_licencia: '',
    vigencia_licencia: '',
    operador_sct: false,
    residencia_fiscal: 'MEX',
    telefono: '',
    email: '',
    estado: 'disponible'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createConductor(formData);
      onSuccess();
      onOpenChange(false);
      setFormData({
        nombre: '',
        rfc: '',
        curp: '',
        num_licencia: '',
        tipo_licencia: '',
        vigencia_licencia: '',
        operador_sct: false,
        residencia_fiscal: 'MEX',
        telefono: '',
        email: '',
        estado: 'disponible'
      });
    } catch (error) {
      console.error('Error creating conductor:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Conductor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                placeholder="Nombre completo del conductor"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rfc">RFC</Label>
              <Input
                id="rfc"
                value={formData.rfc}
                onChange={(e) => handleChange('rfc', e.target.value)}
                placeholder="RFC del conductor"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="curp">CURP</Label>
              <Input
                id="curp"
                value={formData.curp}
                onChange={(e) => handleChange('curp', e.target.value)}
                placeholder="CURP del conductor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="num_licencia">Número de Licencia</Label>
              <Input
                id="num_licencia"
                value={formData.num_licencia}
                onChange={(e) => handleChange('num_licencia', e.target.value)}
                placeholder="Número de licencia"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipo_licencia">Tipo de Licencia</Label>
              <Select
                value={formData.tipo_licencia}
                onValueChange={(value) => handleChange('tipo_licencia', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A - Motocicletas</SelectItem>
                  <SelectItem value="B">B - Automóviles</SelectItem>
                  <SelectItem value="C">C - Camiones</SelectItem>
                  <SelectItem value="D">D - Autobuses</SelectItem>
                  <SelectItem value="E">E - Tractocamiones</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="vigencia_licencia">Vigencia de Licencia</Label>
              <Input
                id="vigencia_licencia"
                type="date"
                value={formData.vigencia_licencia}
                onChange={(e) => handleChange('vigencia_licencia', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
                placeholder="Número de teléfono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Correo electrónico"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="operador_sct"
              checked={formData.operador_sct}
              onCheckedChange={(checked) => handleChange('operador_sct', checked)}
            />
            <Label htmlFor="operador_sct">
              Operador SCT
            </Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.nombre}
            >
              {isSubmitting ? 'Creando...' : 'Crear Conductor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
