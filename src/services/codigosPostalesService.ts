
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
  fuente: 'database_nacional' | 'sepomex_api';
}

interface SugerenciaCP {
  codigo_postal: string;
  ubicacion: string;
}

class CodigosPostalesServiceOptimizado {
  private cache = new Map<string, DireccionCompleta>();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutos

  private async consultarSepomex(
    codigoPostal: string
  ): Promise<DireccionCompleta | null> {
    try {
      console.log('[CP_SERVICE_OPT] Consultando SEPOMEX para:', codigoPostal);
      const response = await fetch(
        `https://api-sepomex.hckdrk.mx/query/info_cp/${codigoPostal}`
      );
      if (!response.ok) return null;
      const data = await response.json();
      if (!data.error && data.response) {
        const colonias = (data.response.asentamiento || []).map((a: any) => ({
          nombre: a.d_asenta,
          tipo: a.d_tipo_asenta
        }));
        return {
          codigoPostal: data.response.cp,
          estado: data.response.estado,
          municipio: data.response.municipio,
          localidad: data.response.ciudad || data.response.municipio,
          colonias,
          fuente: 'sepomex_api'
        };
      }
    } catch (e) {
      console.error('[CP_SERVICE_OPT] Error SEPOMEX:', e);
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

    try {
      console.log('[CP_SERVICE_OPT] Consultando edge function para:', codigoPostal);
      
      // Usar edge function optimizada como fuente principal
      const { data, error } = await supabase.functions.invoke('codigo-postal-mexico', {
        body: { codigoPostal }
      });

      if (!error && data && !data.error) {
        const resultado: DireccionCompleta = {
          codigoPostal: data.codigoPostal,
          estado: data.estado,
          municipio: data.municipio,
          localidad: data.localidad || data.ciudad,
          colonias: data.colonias || [],
          fuente: 'database_nacional'
        };

        // Guardar en cache
        this.cache.set(codigoPostal, resultado);
        
        // Limpiar cache antiguo
        this.limpiarCacheAntiguo();

        return { data: resultado };
      }

      // Si hay error con sugerencias
      if (data?.error && data?.sugerencias) {
        return {
          data: null,
          error: data.error,
          sugerencias: data.sugerencias
        };
      }

      // Fallback a la API de SEPOMEX si no se encuentra en la base
      const sepomex = await this.consultarSepomex(codigoPostal);
      if (sepomex) {
        this.cache.set(codigoPostal, sepomex);
        this.limpiarCacheAntiguo();
        return { data: sepomex };
      }

      return {
        data: null,
        error: data?.error || 'Código postal no encontrado'
      };

    } catch (error) {
      console.error('[CP_SERVICE_OPT] Error:', error);
      const sepomex = await this.consultarSepomex(codigoPostal);
      if (sepomex) {
        this.cache.set(codigoPostal, sepomex);
        this.limpiarCacheAntiguo();
        return { data: sepomex };
      }
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
