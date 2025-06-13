
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface UserData {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  rol_especial?: string;
  created_at: string;
  activo: boolean;
}

export const useSuperuserManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserData[]>([]);

  // Get all users (superuser only)
  const getAllUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar usuarios');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new user
  const createUser = useCallback(async (userData: {
    email: string;
    password: string;
    nombre: string;
    empresa?: string;
    rfc?: string;
    telefono?: string;
    rol?: string;
  }) => {
    try {
      // First create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          nombre: userData.nombre,
          empresa: userData.empresa,
          rfc: userData.rfc,
          telefono: userData.telefono
        }
      });

      if (authError) throw authError;

      // Then create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          nombre: userData.nombre,
          email: userData.email,
          empresa: userData.empresa,
          rfc: userData.rfc,
          telefono: userData.telefono
        });

      if (profileError) throw profileError;

      // Create usuario record
      const { error: usuarioError } = await supabase
        .from('usuarios')
        .insert({
          auth_user_id: authData.user.id,
          email: userData.email,
          nombre: userData.nombre,
          rol: userData.rol || 'usuario',
          tenant_id: user?.usuario?.tenant_id || '00000000-0000-0000-0000-000000000000'
        });

      if (usuarioError) throw usuarioError;

      toast.success('Usuario creado exitosamente');
      await getAllUsers(); // Refresh list
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error('Error al crear usuario');
      return false;
    }
  }, [user?.usuario?.tenant_id, getAllUsers]);

  // Update user role
  const updateUserRole = useCallback(async (userId: string, newRole: string, isSpecial = false) => {
    try {
      const updateData: any = { rol: newRole };
      if (isSpecial) {
        updateData.rol_especial = 'superuser';
      } else {
        updateData.rol_especial = null;
      }

      const { error } = await supabase
        .from('usuarios')
        .update(updateData)
        .eq('auth_user_id', userId);

      if (error) throw error;

      toast.success('Rol actualizado exitosamente');
      await getAllUsers(); // Refresh list
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Error al actualizar rol');
      return false;
    }
  }, [getAllUsers]);

  // Deactivate user
  const deactivateUser = useCallback(async (userId: string) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ activo: false })
        .eq('auth_user_id', userId);

      if (error) throw error;

      toast.success('Usuario desactivado exitosamente');
      await getAllUsers(); // Refresh list
      return true;
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast.error('Error al desactivar usuario');
      return false;
    }
  }, [getAllUsers]);

  // Activate user
  const activateUser = useCallback(async (userId: string) => {
    try {
      const { error } = await supabase
        .from('usuarios')
        .update({ activo: true })
        .eq('auth_user_id', userId);

      if (error) throw error;

      toast.success('Usuario activado exitosamente');
      await getAllUsers(); // Refresh list
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
