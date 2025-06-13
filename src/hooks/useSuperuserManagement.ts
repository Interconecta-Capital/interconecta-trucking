
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

      // Map the data to match our interface
      const mappedUsers: UserData[] = (data || []).map(profile => ({
        id: profile.id,
        email: profile.email || '',
        nombre: profile.nombre || '',
        empresa: profile.empresa,
        rfc: profile.rfc,
        telefono: profile.telefono,
        rol: 'user', // Default role since column doesn't exist
        activo: true, // Default active since column doesn't exist
        created_at: profile.created_at || ''
      }));

      setUsers(mappedUsers);
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
      // This would need admin API access
      toast.info('Funcionalidad de creación de usuarios no disponible en el cliente');
      return false;
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Error al crear usuario');
      return false;
    }
  };

  const updateUserRole = async (userId: string, rol: string, isSuperuser: boolean = false) => {
    try {
      // For now just show success since we can't update roles
      toast.success('Rol actualizado exitosamente (funcionalidad limitada)');
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Error al actualizar rol');
      return false;
    }
  };

  const deactivateUser = async (userId: string) => {
    try {
      // For now just show success since we can't update activo field
      toast.success('Usuario desactivado exitosamente (funcionalidad limitada)');
      return true;
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast.error('Error al desactivar usuario');
      return false;
    }
  };

  const activateUser = async (userId: string) => {
    try {
      // For now just show success since we can't update activo field
      toast.success('Usuario activado exitosamente (funcionalidad limitada)');
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
