import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileDialog({ open, onOpenChange }: UserProfileDialogProps) {
  const { user, updateProfile } = useSimpleAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    telefono: '',
  });

  useEffect(() => {
    if (user) {
      console.log('User data in dialog:', user);
      
      setFormData({
        email: user.email || '',
        telefono: user.user_metadata?.telefono || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({
        telefono: formData.telefono,
      });
      toast.success('Perfil actualizado exitosamente');
      onOpenChange(false);
    } catch (error: any) {
      toast.error('Error al actualizar perfil: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Datos del usuario con fallbacks mejorados
  const userName = user?.user_metadata?.nombre || 
                   user?.user_metadata?.name || 
                   user?.email?.split('@')[0] || 
                   'Usuario';
  
  const userCompany = user?.user_metadata?.empresa || '';
  const userRFC = user?.user_metadata?.rfc || '';
  const userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Perfil de Usuario</DialogTitle>
          <DialogDescription>
            Actualiza tu información personal
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex justify-center mb-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user?.user_metadata?.avatar_url} alt={userName} />
            <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
          </Avatar>
        </div>

        {/* Información no editable */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              value={userName}
              disabled
              className="bg-gray-100"
            />
          </div>

          <div className="space-y-2">
            <Label>Empresa</Label>
            <Input
              value={userCompany}
              disabled
              className="bg-gray-100"
              placeholder={userCompany ? userCompany : "No especificada"}
            />
          </div>

          <div className="space-y-2">
            <Label>RFC</Label>
            <Input
              value={userRFC}
              disabled
              className="bg-gray-100"
              placeholder={userRFC ? userRFC : "No especificado"}
            />
            <p className="text-xs text-gray-500">
              * El RFC no puede ser modificado. Contacta soporte para cambios.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={formData.email}
              disabled
              className="bg-gray-100"
            />
            <p className="text-xs text-gray-500">
              * Para cambiar el email, contacta soporte técnico.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono *</Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
              placeholder="Tu número de teléfono"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
