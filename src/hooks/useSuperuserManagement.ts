
import { useState } from 'react';
import { useSimpleAuth } from './useSimpleAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserData {
  id: string;
  email: string;
  nombre: string;
  empresa?: string;
  rfc?: string;
  telefono?: string;
  rol: string;
  rol_especial?: string;
  activo: boolean;
  created_at: string;
}

export const useSuperuserManagement = () => {
  const { user } = useSimpleAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);

  const getAllUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error('Error getting users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: {
    email: string;
    password: string;
    nombre: string;
    empresa?: string;
    rfc?: string;
    telefono?: string;
    rol: string;
  }) => {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: userData,
        email_confirm: true
      });

      if (error) throw error;

      toast.success('Usuario creado exitosamente');
      getAllUsers(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Error al crear usuario');
      return false;
    }
  };

  const updateUserRole = async (userId: string, rol: string, isSuperuser: boolean = false) => {
    try {
      const updateData: any = { rol };
      if (isSuperuser) {
        updateData.rol_especial = 'superuser';
      } else {
        updateData.rol_especial = null;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;

      toast.success('Rol actualizado exitosamente');
      getAllUsers(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Error al actualizar rol');
      return false;
    }
  };

  const deactivateUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ activo: false })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Usuario desactivado exitosamente');
      getAllUsers(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast.error('Error al desactivar usuario');
      return false;
    }
  };

  const activateUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ activo: true })
        .eq('id', userId);

      if (error) throw error;

      toast.success('Usuario activado exitosamente');
      getAllUsers(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error activating user:', error);
      toast.error('Error al activar usuario');
      return false;
    }
  };

  return {
    users,
    loading,
    getAllUsers,
    createUser,
    updateUserRole,
    deactivateUser,
    activateUser
  };
};
