
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { toast } from 'sonner';
import { RFCValidator } from '@/utils/rfcValidation';

const completeProfileSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
  rfc: z.string().min(12, 'El RFC debe tener al menos 12 caracteres').max(13, 'El RFC debe tener máximo 13 caracteres'),
  telefono: z.string().min(10, 'El teléfono debe tener al menos 10 dígitos'),
  empresa: z.string().min(1, 'El nombre de la empresa es requerido'),
});

type CompleteProfileData = z.infer<typeof completeProfileSchema>;

export function CompleteProfileModal() {
  const { user, updateProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<CompleteProfileData>({
    resolver: zodResolver(completeProfileSchema),
  });

  const watchedRFC = watch('rfc');

  // Verificar si el usuario necesita completar su perfil
  useEffect(() => {
    if (user && user.profile) {
      const needsCompletion = 
        !user.profile.rfc || 
        !user.profile.telefono || 
        !user.profile.empresa ||
        !user.profile.nombre;
      
      if (needsCompletion) {
        setIsOpen(true);
        // Pre-llenar con datos disponibles
        if (user.profile.nombre) setValue('nombre', user.profile.nombre);
        if (user.email) {
          // Extraer nombre del email si no hay nombre
          if (!user.profile.nombre) {
            const emailName = user.email.split('@')[0].replace(/[._]/g, ' ');
            setValue('nombre', emailName);
          }
        }
        if (user.profile.rfc) setValue('rfc', user.profile.rfc);
        if (user.profile.telefono) setValue('telefono', user.profile.telefono);
        if (user.profile.empresa) setValue('empresa', user.profile.empresa);
      }
    }
  }, [user, setValue]);

  // Validar RFC en tiempo real
  useEffect(() => {
    if (watchedRFC && watchedRFC.length >= 12) {
      const validation = RFCValidator.validarRFC(watchedRFC);
      if (!validation.esValido) {
        toast.error(`RFC inválido: ${validation.errores.join(', ')}`);
      }
    }
  }, [watchedRFC]);

  const onSubmit = async (data: CompleteProfileData) => {
    setIsLoading(true);
    try {
      // Validar RFC antes de enviar
      const rfcValidation = RFCValidator.validarRFC(data.rfc);
      if (!rfcValidation.esValido) {
        toast.error(`RFC inválido: ${rfcValidation.errores.join(', ')}`);
        return;
      }

      await updateProfile({
        nombre: data.nombre,
        rfc: data.rfc.toUpperCase(),
        telefono: data.telefono,
        empresa: data.empresa,
      });

      toast.success('Perfil completado exitosamente');
      setIsOpen(false);
    } catch (error: any) {
      toast.error('Error al completar perfil: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Completa tu perfil</DialogTitle>
          <DialogDescription>
            Para continuar usando la plataforma, necesitamos que completes la siguiente información.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input
              id="nombre"
              {...register('nombre')}
              placeholder="Tu nombre completo"
            />
            {errors.nombre && (
              <p className="text-sm text-red-600">{errors.nombre.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="empresa">Empresa *</Label>
            <Input
              id="empresa"
              {...register('empresa')}
              placeholder="Nombre de tu empresa"
            />
            {errors.empresa && (
              <p className="text-sm text-red-600">{errors.empresa.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="rfc">RFC *</Label>
            <Input
              id="rfc"
              {...register('rfc')}
              placeholder="RFC de la empresa"
              onChange={(e) => {
                const value = e.target.value.toUpperCase();
                e.target.value = value;
                register('rfc').onChange(e);
              }}
            />
            {errors.rfc && (
              <p className="text-sm text-red-600">{errors.rfc.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono *</Label>
            <Input
              id="telefono"
              {...register('telefono')}
              placeholder="Número de teléfono"
              type="tel"
            />
            {errors.telefono && (
              <p className="text-sm text-red-600">{errors.telefono.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Guardando...' : 'Completar perfil'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
