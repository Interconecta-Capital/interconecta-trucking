
import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id?: string;
  nombre: string;
  email: string;
  empresa?: string;
  rfc?: string;
  telefono?: string;
  avatar_url?: string;
  configuracion_calendario?: any;
  timezone?: string;
  plan_type?: string;
  rol?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Usuario {
  id?: string;
  auth_user_id: string;
  email: string;
  nombre: string;
  tenant_id?: string;
  telefono?: string;
  empresa?: string;
  rol?: string;
  rol_especial?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Tenant {
  id: string;
  nombre_empresa: string;
  rfc_empresa: string;
  created_at?: string;
  updated_at?: string;
}

export interface ExtendedUser extends User {
  profile?: UserProfile;
  usuario?: Usuario;
  tenant?: Tenant;
}

// AuthUser is an alias for ExtendedUser for compatibility
export type AuthUser = ExtendedUser;

export interface UserSignUpData {
  nombre: string;
  empresa?: string;
  rfc?: string;
  telefono?: string;
}

export interface AuthError {
  message: string;
  status?: number;
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}
