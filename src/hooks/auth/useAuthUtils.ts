
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserSignUpData } from './types';

/**
 * Maneja la creación de usuarios OAuth nuevos
 * Primero espera a que el trigger handle_new_user procese el usuario
 * Si falla, crea manualmente el tenant y usuario como fallback
 */
export const handleOAuthUser = async (oauthUser: User) => {
  try {
    console.log('[OAuth] Procesando usuario OAuth:', oauthUser.id);
    
    // Paso 1: Esperar 2 segundos para que el trigger se ejecute
    console.log('[OAuth] Esperando que el trigger handle_new_user procese el usuario...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Paso 2: Verificar si el usuario ya existe en nuestra tabla
    const { data: existingUser, error: checkError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('auth_user_id', oauthUser.id)
      .single();

    if (existingUser) {
      console.log('[OAuth] Usuario ya existe en la base de datos (creado por trigger)');
      return;
    }
    
    // Si hay error pero no es "not found", loguearlo
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[OAuth] Error verificando usuario:', checkError);
    }

    // Paso 3: Si no existe, el trigger falló - crear manualmente como fallback
    console.warn('[OAuth] Trigger falló o no se ejecutó - creando usuario manualmente');
    
    const email = oauthUser.email || '';
    const name = oauthUser.user_metadata?.full_name || 
                oauthUser.user_metadata?.name || 
                email.split('@')[0];
    
    // Crear tenant básico
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        nombre_empresa: `${name} - Empresa`,
        rfc_empresa: 'XAXX010101000', // RFC genérico temporal
      })
      .select()
      .single();

    if (tenantError) {
      console.error('[OAuth] Error creando tenant:', tenantError);
      throw tenantError;
    }

    console.log('[OAuth] Tenant creado:', tenant.id);

    // Crear perfil
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: oauthUser.id,
        nombre: name,
        email: email,
        trial_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      });

    if (profileError) {
      console.error('[OAuth] Error creando perfil:', profileError);
    }

    // Crear usuario en la tabla usuarios (sin telefono/empresa)
    const { error: usuarioError } = await supabase
      .from('usuarios')
      .insert({
        auth_user_id: oauthUser.id,
        email: email,
        nombre: name,
        tenant_id: tenant.id,
        rol: 'admin',
      });

    if (usuarioError) {
      console.error('[OAuth] Error creando usuario:', usuarioError);
      throw usuarioError;
    }

    console.log('[OAuth] Usuario creado exitosamente como fallback');
  } catch (error) {
    console.error('[OAuth] Error crítico manejando usuario OAuth:', error);
    throw error;
  }
};

/**
 * Crea el tenant y usuario (LEGACY - solo para fallback)
 * Ya no se usa en flujo normal, el trigger handle_new_user lo maneja
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
        nombre_empresa: userData.empresa,
        rfc_empresa: userData.rfc,
      })
      .select()
      .single();

    if (tenantError) throw tenantError;

    // Crear usuario en la tabla usuarios (SIN telefono/empresa)
    const { error: usuarioError } = await supabase
      .from('usuarios')
      .insert({
        auth_user_id: userId,
        email: email,
        nombre: userData.nombre,
        tenant_id: tenant.id,
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
