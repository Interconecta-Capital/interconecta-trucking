/**
 * ✅ ISO 27001 A.10.1 - Public Keys Configuration
 * 
 * IMPORTANTE: Estas claves son PÚBLICAS y se exponen al navegador.
 * Nunca coloques secretos privados aquí (API secrets, private keys, tokens de servidor).
 * 
 * Para secretos privados:
 * - Edge Functions: Usar Supabase Edge Functions Secrets (Deno.env.get)
 * - Database Functions: Usar Supabase Vault (get_secret)
 */

const getMapboxToken = (): string => {
  return import.meta.env.VITE_MAPBOX_TOKEN || '';
};

const getHereApiKey = (): string => {
  return import.meta.env.VITE_HERE_API_KEY || '';
};

export const PUBLIC_CONFIG = {
  /**
   * Supabase Client Configuration
   * Estas credenciales son públicas y permiten acceso anónimo controlado por RLS
   */
  supabase: {
    url: 'https://qulhweffinppyjpfkknh.supabase.co' as const,
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1bGh3ZWZmaW5wcHlqcGZra25oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MTg3ODEsImV4cCI6MjA2NTE5NDc4MX0.7MwqHsoSSdlzizarradrdMGUHG9QuXyIGFXd0imNrMM' as const,
    projectId: 'qulhweffinppyjpfkknh' as const
  },
  
  /**
   * Mapbox Public Token
   * Token público para Mapbox GL JS (cliente-side)
   * Documentación: https://docs.mapbox.com/help/getting-started/access-tokens/
   */
  mapbox: {
    get token(): string {
      return getMapboxToken();
    },
    isConfigured(): boolean {
      const token = getMapboxToken();
      return token.length > 0 && token !== 'your-mapbox-token-here';
    }
  },
  
  /**
   * HERE Maps API Key (Public)
   * Usado para ruteo comercial de camiones
   * Documentación: https://developer.here.com/documentation/
   */
  here: {
    get apiKey(): string {
      return getHereApiKey();
    },
    isConfigured(): boolean {
      return getHereApiKey().length > 0;
    }
  }
};

/**
 * Tipo para autocompletado en el IDE
 */
export type PublicConfig = typeof PUBLIC_CONFIG;
