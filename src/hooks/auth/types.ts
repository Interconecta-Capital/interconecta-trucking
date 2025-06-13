
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

export interface ExtendedUser extends User {
  profile?: UserProfile;
  usuario?: UserProfile;
  tenant?: any;
}

export interface AuthError {
  message: string;
  status?: number;
}
