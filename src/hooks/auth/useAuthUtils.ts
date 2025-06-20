
import { supabase } from '@/integrations/supabase/client';
import { UserSignUpData } from './types';

/**
 * Obtener URL de redirección para auth
 */
export const getRedirectUrl = (path?: string) => {
  const baseUrl = window.location.origin;
  return `${baseUrl}${path || '/dashboard'}`;
};

/**
 * Crear tenant y usuario después del registro
 */
export const createTenantAndUser = async (
  userId: string, 
  email: string, 
  userData: UserSignUpData
) => {
  try {
    // Crear entrada en profiles (ya debe existir por el trigger)
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        nombre: userData.nombre,
        email: email,
        empresa: userData.empresa,
        rfc: userData.rfc,
        telefono: userData.telefono,
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    }

    // Crear entrada en usuarios si no existe
    const { error: usuarioError } = await supabase
      .from('usuarios')
      .upsert({
        auth_user_id: userId,
        nombre: userData.nombre,
        email: email,
        tenant_id: userId, // Usar user_id como tenant_id por simplicidad
      });

    if (usuarioError) {
      console.error('Error creating usuario:', usuarioError);
    }

  } catch (error) {
    console.error('Error in createTenantAndUser:', error);
  }
};
