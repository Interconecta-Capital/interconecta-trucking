
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserSignUpData } from './types';

/**
 * Maneja la creación de usuarios OAuth nuevos
 * Crea un tenant básico y registra al usuario en la tabla usuarios
 */
export const handleOAuthUser = async (oauthUser: User) => {
  try {
    // Verificar si el usuario ya existe en nuestra tabla
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_user_id', oauthUser.id)
      .single();

    if (!existingUser) {
      // Es un usuario OAuth nuevo, necesita completar información
      const email = oauthUser.email || '';
      const name = oauthUser.user_metadata?.full_name || 
                  oauthUser.user_metadata?.name || 
                  email.split('@')[0];
      
      // Crear tenant básico
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          nombre_empresa: `${name} - Empresa`,
          rfc_empresa: 'TEMP000000000', // Temporal, el usuario deberá actualizarlo
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Crear usuario en la tabla usuarios
      const { error: usuarioError } = await supabase
        .from('usuarios')
        .insert({
          auth_user_id: oauthUser.id,
          email: email,
          nombre: name,
          tenant_id: tenant.id,
          rol: 'admin',
        });

      if (usuarioError) throw usuarioError;
    }
  } catch (error) {
    console.error('Error handling OAuth user:', error);
  }
};

/**
 * Crea el tenant y usuario después de un registro exitoso
 */
export const createTenantAndUser = async (
  userId: string, 
  email: string, 
  userData: UserSignUpData
) => {
  try {
    // Crear tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        nombre_empresa: userData.empresa || `${userData.nombre} - Empresa`,
        rfc_empresa: userData.rfc || 'TEMP000000000',
      })
      .select()
      .single();

    if (tenantError) throw tenantError;

    // Crear usuario en la tabla usuarios
    const { error: usuarioError } = await supabase
      .from('usuarios')
      .insert({
        auth_user_id: userId,
        email: email,
        nombre: userData.nombre,
        tenant_id: tenant.id,
        telefono: userData.telefono,
        empresa: userData.empresa,
        rol: 'admin',
      });

    if (usuarioError) throw usuarioError;
  } catch (dbError) {
    console.error('Error creating tenant/user:', dbError);
    throw dbError;
  }
};

/**
 * Verifica permisos de acceso basado en el rol del usuario
 */
export const checkUserAccess = (userRole: string | undefined, resource: string): boolean => {
  if (!userRole) return false;
  
  // Lógica de permisos básica
  if (userRole === 'admin') return true;
  if (userRole === 'usuario' && resource !== 'admin') return true;
  
  return false;
};

/**
 * Obtiene la URL de redirección actual
 */
export const getRedirectUrl = (path: string = '/dashboard'): string => {
  return `${window.location.origin}${path}`;
};
