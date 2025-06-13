
import { supabase } from '@/integrations/supabase/client';

export interface DireccionCompleta {
  codigoPostal: string;
  estado: string;
  municipio: string;
  localidad?: string;
  colonias: Array<{
    nombre: string;
    tipo: string;
  }>;
  fuente: 'database_nacional' | 'api_externa';
}

interface SugerenciaCP {
  codigo_postal: string;
  ubicacion: string;
}

class CodigosPostalesServiceOptimizado {
  private cache = new Map<string, DireccionCompleta>();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutos

  private async consultarAPIExterna(
    codigoPostal: string
  ): Promise<DireccionCompleta | null> {
    try {
      console.log('[CP_SERVICE_OPT] Consultando API externa para:', codigoPostal);
      
      // Llamar a la función de edge que maneja las APIs externas
      const { data, error } = await supabase.functions.invoke('codigo-postal-mexico', {
        body: { codigoPostal }
      });

      if (!error && data && !data.error && data.fuente === 'api_externa') {
        return {
          codigoPostal: data.codigoPostal,
          estado: data.estado,
          municipio: data.municipio,
          localidad: data.localidad || data.ciudad,
          colonias: data.colonias || [],
          fuente: 'api_externa'
        };
      }
    } catch (error) {
      console.error('[CP_SERVICE_OPT] Error consultando API externa:', error);
    }
    return null;
  }

  private async consultarBaseDatos(codigoPostal: string): Promise<DireccionCompleta | null> {
    try {
      console.log('[CP_SERVICE_OPT] Consultando base de datos para:', codigoPostal);
      
      const { data, error } = await supabase.functions.invoke('codigo-postal-mexico', {
        body: { codigoPostal }
      });

      if (!error && data && !data.error && data.fuente === 'database_nacional') {
        return {
          codigoPostal: data.codigoPostal,
          estado: data.estado,
          municipio: data.municipio,
          localidad: data.localidad || data.ciudad,
          colonias: data.colonias || [],
          fuente: 'database_nacional'
        };
      }
    } catch (error) {
      console.error('[CP_SERVICE_OPT] Error consultando base de datos:', error);
    }
    return null;
  }

  async buscarDireccionPorCP(codigoPostal: string): Promise<{
    data: DireccionCompleta | null;
    error?: string;
    sugerencias?: SugerenciaCP[];
  }> {
    // Validar formato
    if (!this.validarFormatoCP(codigoPostal)) {
      return { 
        data: null, 
        error: 'Formato de código postal inválido' 
      };
    }

    // Verificar cache
    const cached = this.cache.get(codigoPostal);
    if (cached) {
      console.log('[CP_SERVICE_OPT] Usando cache para:', codigoPostal);
      return { data: cached };
    }

    // Llamar a la función de edge que maneja toda la lógica
    try {
      const { data, error } = await supabase.functions.invoke('codigo-postal-mexico', {
        body: { codigoPostal }
      });

      if (!error && data && !data.error) {
        const direccionCompleta: DireccionCompleta = {
          codigoPostal: data.codigoPostal,
          estado: data.estado,
          municipio: data.municipio,
          localidad: data.localidad || data.ciudad,
          colonias: data.colonias || [],
          fuente: data.fuente
        };

        console.log(`[CP_SERVICE_OPT] Encontrado desde ${data.fuente}:`, direccionCompleta);
        this.cache.set(codigoPostal, direccionCompleta);
        this.limpiarCacheAntiguo();
        return { data: direccionCompleta };
      }

      // Si hay error pero con sugerencias
      if (data?.sugerencias) {
        return {
          data: null,
          error: data.error || `Código postal ${codigoPostal} no encontrado`,
          sugerencias: data.sugerencias
        };
      }

      return {
        data: null,
        error: data?.error || 'Código postal no encontrado'
      };

    } catch (error) {
      console.error('[CP_SERVICE_OPT] Error general:', error);
      return {
        data: null,
        error: 'Error al consultar código postal'
      };
    }
  }

  private validarFormatoCP(cp: string): boolean {
    return /^\d{5}$/.test(cp?.trim() || '');
  }

  private limpiarCacheAntiguo(): void {
    // Mantener máximo 100 entradas en cache
    if (this.cache.size > 100) {
      const entries = Array.from(this.cache.entries());
      // Eliminar las primeras 20 entradas (más antiguas)
      for (let i = 0; i < 20; i++) {
        this.cache.delete(entries[i][0]);
      }
    }
  }

  limpiarCache(): void {
    this.cache.clear();
  }

  obtenerDelCache(codigoPostal: string): DireccionCompleta | null {
    return this.cache.get(codigoPostal) || null;
  }
}

export const codigosPostalesService = new CodigosPostalesServiceOptimizado();
