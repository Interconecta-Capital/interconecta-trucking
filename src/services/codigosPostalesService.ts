
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
      console.log('[CP_SERVICE_OPT] Consultando SEPOMEX API para:', codigoPostal);
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
      console.error('[CP_SERVICE_OPT] Error SEPOMEX API:', e);
    }
    return null;
  }

  private async consultarBaseDatos(codigoPostal: string): Promise<DireccionCompleta | null> {
    try {
      console.log('[CP_SERVICE_OPT] Consultando base de datos para:', codigoPostal);
      
      const { data, error } = await supabase.functions.invoke('codigo-postal-mexico', {
        body: { codigoPostal }
      });

      if (!error && data && !data.error) {
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

    // PASO 1: Intentar SEPOMEX API primero
    const sepomexResult = await this.consultarSepomex(codigoPostal);
    if (sepomexResult) {
      console.log('[CP_SERVICE_OPT] Encontrado en SEPOMEX API');
      this.cache.set(codigoPostal, sepomexResult);
      this.limpiarCacheAntiguo();
      return { data: sepomexResult };
    }

    // PASO 2: Fallback a base de datos local
    const dbResult = await this.consultarBaseDatos(codigoPostal);
    if (dbResult) {
      console.log('[CP_SERVICE_OPT] Encontrado en base de datos local');
      this.cache.set(codigoPostal, dbResult);
      this.limpiarCacheAntiguo();
      return { data: dbResult };
    }

    // PASO 3: Generar sugerencias si no se encuentra
    try {
      console.log('[CP_SERVICE_OPT] No encontrado, generando sugerencias');
      const { data } = await supabase.functions.invoke('codigo-postal-mexico', {
        body: { codigoPostal }
      });

      if (data?.sugerencias) {
        return {
          data: null,
          error: `Código postal ${codigoPostal} no encontrado`,
          sugerencias: data.sugerencias
        };
      }
    } catch (error) {
      console.error('[CP_SERVICE_OPT] Error obteniendo sugerencias:', error);
    }

    return {
      data: null,
      error: 'Código postal no encontrado'
    };
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
