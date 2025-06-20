
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  nombre: string;
  empresa?: string;
  rol: string;
  rol_especial?: string;
  activo: boolean;
  created_at: string;
}

interface CreateUserData {
  email: string;
  password: string;
  nombre: string;
  empresa?: string;
  rfc?: string;
  telefono?: string;
  rol: string;
}

export const useSuperuserManagement = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  const getAllUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, nombre, empresa, plan_type, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedUsers: User[] = data.map(user => ({
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        empresa: user.empresa,
        rol: user.plan_type === 'superuser' ? 'admin' : 'usuario',
        rol_especial: user.plan_type === 'superuser' ? 'superuser' : undefined,
        activo: true,
        created_at: user.created_at
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (userData: CreateUserData): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-superuser', {
        body: {
          email: userData.email,
          password: userData.password,
          nombre: userData.nombre,
          empresa: userData.empresa || 'Sistema'
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Usuario creado exitosamente');
        await getAllUsers(); // Refresh list
        return true;
      } else {
        toast.error(data?.error || 'Error al crear usuario');
        return false;
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Error al crear usuario');
      return false;
    } finally {
      setLoading(false);
    }
  }, [getAllUsers]);

  const updateUserRole = useCallback(async (userId: string, newRole: string, isSuperuser: boolean): Promise<boolean> => {
    try {
      if (isSuperuser) {
        const { data, error } = await supabase.functions.invoke('convert-to-superuser', {
          body: { email: userId } // Necesitamos el email, no el ID
        });

        if (error) throw error;
        
        if (data?.success) {
          toast.success('Usuario convertido a superusuario');
          await getAllUsers();
          return true;
        }
      } else {
        const { error } = await supabase
          .from('profiles')
          .update({ plan_type: newRole === 'admin' ? 'paid' : 'trial' })
          .eq('id', userId);

        if (error) throw error;
        
        toast.success('Rol actualizado exitosamente');
        await getAllUsers();
        return true;
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Error al actualizar rol');
      return false;
    }
    return false;
  }, [getAllUsers]);

  const deactivateUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      // Crear bloqueo
      const { error } = await supabase
        .from('bloqueos_usuario')
        .insert({
          user_id: userId,
          motivo: 'desactivado_admin',
          mensaje_bloqueo: 'Usuario desactivado por administrador',
          activo: true
        });

      if (error) throw error;
      
      toast.success('Usuario desactivado');
      await getAllUsers();
      return true;
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast.error('Error al desactivar usuario');
      return false;
    }
  }, [getAllUsers]);

  const activateUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      // Remover bloqueos
      const { error } = await supabase
        .from('bloqueos_usuario')
        .update({ activo: false })
        .eq('user_id', userId);

      if (error) throw error;
      
      toast.success('Usuario activado');
      await getAllUsers();
      return true;
    } catch (error) {
      console.error('Error activating user:', error);
      toast.error('Error al activar usuario');
      return false;
    }
  }, [getAllUsers]);

  return {
    loading,
    users,
    getAllUsers,
    createUser,
    updateUserRole,
    deactivateUser,
    activateUser
  };
};
