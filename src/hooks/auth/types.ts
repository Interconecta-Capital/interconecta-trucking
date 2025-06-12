
import { User } from '@supabase/supabase-js';

/**
 * Interfaz del perfil de usuario
 */
export interface UserProfile {
  id: string;
  nombre: string;
  email: string;
  empresa?: string;
  rfc?: string;
  telefono?: string;
  avatar_url?: string;
  configuracion_calendario?: any;
  timezone?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interfaz extendida del usuario que incluye información del tenant, usuario y perfil
 */
export interface AuthUser extends User {
  profile?: UserProfile;
  tenant?: {
    id: string;
    nombre_empresa: string;
    rfc_empresa: string;
  };
  usuario?: {
    id: string;
    nombre: string;
    rol: string;
  };
}

/**
 * Contexto de autenticación que expone todas las funciones y estado
 */
export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<{ needsVerification?: boolean }>;
  signInWithGoogle: () => Promise<void>;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateEmail: (newEmail: string) => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
  hasAccess: (resource: string) => boolean;
  resendConfirmation: (email: string) => Promise<void>;
}

/**
 * Datos del usuario para registro
 */
export interface UserSignUpData {
  nombre: string;
  empresa: string;
  rfc: string;
  telefono?: string;
  isTrial?: boolean;
}
