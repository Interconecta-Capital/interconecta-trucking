
import { supabase } from '@/integrations/supabase/client';

export interface AutocompleteResult {
  suggestions: string[];
  confidence: number;
  context?: any;
}

export interface AddressSuggestion {
  fullAddress: string;
  street: string;
  colonia: string;
  municipio: string;
  estado: string;
  codigoPostal: string;
  confidence: number;
}

export interface MercanciaSuggestion {
  descripcion: string;
  claveProdServ: string;
  claveUnidad: string;
  confidence: number;
  esMatPeligroso?: boolean;
  fraccionArancelaria?: string;
}

export interface ConductorSuggestion {
  nombre: string;
  rfc: string;
  licencia: string;
  confidence: number;
  vigenciaLicencia?: string;
}

export class GeminiAutocompleteService {
  private cache = new Map<string, { result: any; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(tipo: string, input: string, context?: any): string {
    return `${tipo}-${input}-${JSON.stringify(context)}`;
  }

  private getFromCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.result;
    }
    this.cache.delete(key);
    return null;
  }

  private setCache(key: string, result: any): void {
    this.cache.set(key, { result, timestamp: Date.now() });
  }

  async autocompletarDireccion(input: string, context?: any): Promise<AddressSuggestion[]> {
    if (input.length < 3) return [];

    const cacheKey = this.getCacheKey('direccion', input, context);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log('[GeminiAutocomplete] Autocompletando dirección:', input);
      
      const { data, error } = await supabase.functions.invoke('gemini-assistant', {
        body: {
          operation: 'autocomplete_address',
          input,
          context: {
            ...context,
            pais: 'México',
            tipo: 'direccion_carta_porte'
          }
        },
      });

      if (error) throw error;

      const suggestions: AddressSuggestion[] = data?.suggestions || [];
      this.setCache(cacheKey, suggestions);
      
      return suggestions;
    } catch (error) {
      console.error('[GeminiAutocomplete] Error autocompletando dirección:', error);
      return [];
    }
  }

  async autocompletarMercancia(input: string, context?: any): Promise<MercanciaSuggestion[]> {
    if (input.length < 3) return [];

    const cacheKey = this.getCacheKey('mercancia', input, context);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log('[GeminiAutocomplete] Autocompletando mercancía:', input);
      
      const { data, error } = await supabase.functions.invoke('gemini-assistant', {
        body: {
          operation: 'autocomplete_mercancia',
          input,
          context: {
            ...context,
            catalogo: 'sat_mexico',
            version_carta_porte: context?.version || '3.1'
          }
        },
      });

      if (error) throw error;

      const suggestions: MercanciaSuggestion[] = data?.suggestions || [];
      this.setCache(cacheKey, suggestions);
      
      return suggestions;
    } catch (error) {
      console.error('[GeminiAutocomplete] Error autocompletando mercancía:', error);
      return [];
    }
  }

  async autocompletarVehiculo(input: string, context?: any): Promise<any[]> {
    if (input.length < 2) return [];

    const cacheKey = this.getCacheKey('vehiculo', input, context);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log('[GeminiAutocomplete] Autocompletando vehículo:', input);
      
      const { data, error } = await supabase.functions.invoke('gemini-assistant', {
        body: {
          operation: 'autocomplete_vehiculo',
          input,
          context: {
            ...context,
            mercado: 'mexico',
            tipo: 'autotransporte'
          }
        },
      });

      if (error) throw error;

      const suggestions = data?.suggestions || [];
      this.setCache(cacheKey, suggestions);
      
      return suggestions;
    } catch (error) {
      console.error('[GeminiAutocomplete] Error autocompletando vehículo:', error);
      return [];
    }
  }

  async autocompletarConductor(input: string, context?: any): Promise<ConductorSuggestion[]> {
    if (input.length < 2) return [];

    const cacheKey = this.getCacheKey('conductor', input, context);
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      console.log('[GeminiAutocomplete] Autocompletando conductor:', input);
      
      const { data, error } = await supabase.functions.invoke('gemini-assistant', {
        body: {
          operation: 'autocomplete_conductor',
          input,
          context: {
            ...context,
            tipo: 'figura_transporte',
            pais: 'mexico'
          }
        },
      });

      if (error) throw error;

      const suggestions: ConductorSuggestion[] = data?.suggestions || [];
      this.setCache(cacheKey, suggestions);
      
      return suggestions;
    } catch (error) {
      console.error('[GeminiAutocomplete] Error autocompletando conductor:', error);
      return [];
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const geminiAutocompleteService = new GeminiAutocompleteService();
