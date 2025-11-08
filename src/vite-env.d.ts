/// <reference types="vite/client" />
/// <reference path="./types/google-maps.d.ts" />

/**
 * Environment variables disponibles en desarrollo
 * En producción, usar PUBLIC_CONFIG en src/config/publicKeys.ts
 */
interface ImportMetaEnv {
  // Solo para desarrollo local - NO son secretos
  readonly VITE_MAPBOX_TOKEN?: string;
  readonly VITE_HERE_API_KEY?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  
  // Deprecated - Usar PUBLIC_CONFIG.supabase en su lugar
  /** @deprecated Use PUBLIC_CONFIG.supabase.url */
  readonly VITE_SUPABASE_URL?: string;
  /** @deprecated Use PUBLIC_CONFIG.supabase.anonKey */
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
