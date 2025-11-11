
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SocioDocumentosFields } from '@/components/socios/forms/SocioDocumentosFields';
import { toast } from 'sonner';
import { Plus, Building } from 'lucide-react';

const socioSchema = z.object({
  nombre_razon_social: z.string().min(1, 'El nombre o razón social es requerido'),
  rfc: z.string().min(1, 'El RFC es requerido').max(13, 'RFC inválido'),
  tipo_persona: z.enum(['fisica', 'moral'], {
    required_error: 'Selecciona el tipo de persona',
  }),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
});

type SocioFormData = z.infer<typeof socioSchema>;

interface SocioFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SocioFormData) => Promise<void>;
  socio?: any;
  loading?: boolean;
}

export function SocioFormModal({ open, onOpenChange, onSubmit, socio, loading }: SocioFormModalProps) {
  const form = useForm<SocioFormData>({
    resolver: zodResolver(socioSchema),
    defaultValues: socio ? {
      nombre_razon_social: socio.nombre_razon_social || '',
      rfc: socio.rfc || '',
      tipo_persona: socio.tipo_persona || 'moral',
      telefono: socio.telefono || '',
      email: socio.email || '',
    } : {
      nombre_razon_social: '',
      rfc: '',
      tipo_persona: 'moral',
      telefono: '',
      email: '',
    },
  });

  const handleSubmit = async (data: SocioFormData) => {
    try {
      await onSubmit(data);
      form.reset();
    } catch (error) {
      toast.error('Error al guardar el socio');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {socio ? 'Editar Socio' : 'Nuevo Socio'}
          </DialogTitle>
          <DialogDescription>
            {socio ? 'Modifica los datos del socio' : 'Ingresa los datos del nuevo socio comercial'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="datos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="datos">Datos Básicos</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
          </TabsList>

          <TabsContent value="datos">
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="nombre_razon_social">Nombre / Razón Social *</Label>
            <Input
              id="nombre_razon_social"
              {...form.register('nombre_razon_social')}
              placeholder="Nombre completo o razón social"
            />
            {form.formState.errors.nombre_razon_social && (
              <p className="text-sm text-red-500">{form.formState.errors.nombre_razon_social.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rfc">RFC *</Label>
              <Input
                id="rfc"
                {...form.register('rfc')}
                placeholder="RFC del socio"
                className="uppercase"
                onChange={(e) => {
                  form.setValue('rfc', e.target.value.toUpperCase());
                }}
              />
              {form.formState.errors.rfc && (
                <p className="text-sm text-red-500">{form.formState.errors.rfc.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_persona">Tipo de Persona *</Label>
              <Select 
                value={form.watch('tipo_persona')} 
                onValueChange={(value: 'fisica' | 'moral') => form.setValue('tipo_persona', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fisica">Persona Física</SelectItem>
                  <SelectItem value="moral">Persona Moral</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.tipo_persona && (
                <p className="text-sm text-red-500">{form.formState.errors.tipo_persona.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                {...form.register('telefono')}
                placeholder="Número de teléfono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register('email')}
                placeholder="correo@ejemplo.com"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Guardando...' : (socio ? 'Actualizar' : 'Crear Socio')}
            </Button>
          </div>
        </form>
      </TabsContent>

      <TabsContent value="documentos" className="mt-4">
        <SocioDocumentosFields 
          socioId={socio?.id}
          tipoPersona={form.watch('tipo_persona')}
          onDocumentosChange={(docs) => console.log('Documentos actualizados:', docs)}
        />
      </TabsContent>
    </Tabs>
      </DialogContent>
    </Dialog>
  );
}
