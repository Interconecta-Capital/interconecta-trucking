
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionHeader } from '@/components/ui/section-header';
import { ValidationIndicator } from '@/components/forms/ValidationIndicator';
import { useConductores } from '@/hooks/useConductores';
import { toast } from 'sonner';
import { User, IdCard, Phone, Mail, CreditCard, Calendar } from 'lucide-react';

interface ConductorFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ConductorFormModal({ open, onOpenChange }: ConductorFormModalProps) {
  const [loading, setLoading] = useState(false);
  const { createConductor } = useConductores();
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await createConductor(data);
      toast.success('Conductor creado exitosamente');
      reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al crear conductor: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6">
          <SectionHeader
            title="Nuevo Conductor"
            description="Registra un nuevo conductor en el sistema"
            icon={User}
            className="border-0 pb-0"
          />
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-blue-interconecta" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre completo *</Label>
                <Input
                  id="nombre"
                  {...register('nombre', { required: 'El nombre es requerido' })}
                  placeholder="Nombre completo del conductor"
                  className={errors.nombre ? 'border-red-300' : ''}
                />
                {errors.nombre && (
                  <ValidationIndicator status="invalid" message={errors.nombre.message as string} />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  {...register('telefono')}
                  placeholder="Teléfono de contacto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="Email del conductor"
                />
              </div>
            </CardContent>
          </Card>

          {/* Documentos Fiscales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <IdCard className="h-5 w-5 text-blue-interconecta" />
                Documentos Fiscales
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rfc">RFC</Label>
                <Input
                  id="rfc"
                  {...register('rfc')}
                  placeholder="RFC del conductor"
                  className="uppercase"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="curp">CURP</Label>
                <Input
                  id="curp"
                  {...register('curp')}
                  placeholder="CURP del conductor"
                  className="uppercase"
                />
              </div>
            </CardContent>
          </Card>

          {/* Información de Licencia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CreditCard className="h-5 w-5 text-blue-interconecta" />
                Licencia de Conducir
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="num_licencia">Número de Licencia</Label>
                <Input
                  id="num_licencia"
                  {...register('num_licencia')}
                  placeholder="Número de licencia"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_licencia">Tipo de Licencia</Label>
                <Select onValueChange={(value) => setValue('tipo_licencia', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Tipo A - Motocicletas</SelectItem>
                    <SelectItem value="B">Tipo B - Automóviles</SelectItem>
                    <SelectItem value="C">Tipo C - Camiones hasta 3.5 ton</SelectItem>
                    <SelectItem value="D">Tipo D - Camiones pesados</SelectItem>
                    <SelectItem value="E">Tipo E - Articulados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vigencia_licencia">Vigencia de Licencia</Label>
                <Input
                  id="vigencia_licencia"
                  type="date"
                  {...register('vigencia_licencia')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-20">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? 'Guardando...' : 'Guardar Conductor'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
