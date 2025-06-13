
import { buscarCodigoPostalLocal, validarFormatoCP } from '@/data/codigosPostalesMexico';
import { supabase } from '@/integrations/supabase/client';

export interface DireccionCompleta {
  codigoPostal: string;
  estado: string;
  municipio: string;
  localidad?: string;
  colonias: string[];
  fuente?: 'local' | 'api_interna' | 'legacy_api';
}

class CodigosPostalesService {
  private cache = new Map<string, DireccionCompleta>();

  async buscarDireccionPorCP(codigoPostal: string): Promise<DireccionCompleta | null> {
    // Validar formato
    if (!validarFormatoCP(codigoPostal)) {
      console.warn('[CP_SERVICE] Formato inválido:', codigoPostal);
      return null;
    }

    // Verificar cache
    if (this.cache.has(codigoPostal)) {
      console.log('[CP_SERVICE] Usando cache para:', codigoPostal);
      return this.cache.get(codigoPostal)!;
    }

    try {
      // 1. Primero intentar datos locales (más rápido)
      const datosLocales = buscarCodigoPostalLocal(codigoPostal);
      if (datosLocales) {
        console.log('[CP_SERVICE] Encontrado en datos locales:', codigoPostal);
        
        const resultado: DireccionCompleta = {
          codigoPostal,
          estado: datosLocales.estado,
          municipio: datosLocales.municipio,
          localidad: datosLocales.localidad,
          colonias: datosLocales.colonias,
          fuente: 'local'
        };

        this.cache.set(codigoPostal, resultado);
        return resultado;
      }

      // 2. Si no está local, usar API interna (Edge Function)
      console.log('[CP_SERVICE] Consultando API interna para:', codigoPostal);
      
      const { data, error } = await supabase.functions.invoke('codigo-postal', {
        body: { codigoPostal }
      });

      if (!error && data && !data.error) {
        const resultado: DireccionCompleta = {
          codigoPostal: data.codigoPostal,
          estado: data.estado,
          municipio: data.municipio,
          localidad: data.localidad,
          colonias: data.colonias,
          fuente: 'api_interna'
        };

        this.cache.set(codigoPostal, resultado);
        return resultado;
      }

      // 3. Fallback a API legacy (con manejo de CORS)
      console.log('[CP_SERVICE] APIs anteriores fallaron, intentando legacy...');
      return await this.buscarLegacyAPI(codigoPostal);

    } catch (error) {
      console.error('[CP_SERVICE] Error en búsqueda:', error);
      return null;
    }
  }

  private async buscarLegacyAPI(codigoPostal: string): Promise<DireccionCompleta | null> {
    try {
      // Intentar API legacy solo como último recurso
      const response = await fetch(`https://api-sepomex.hckdrk.mx/query/info_cp/${codigoPostal}`);
      
      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (data.error || !data.response || data.response.length === 0) {
        return null;
      }

      const primeraRespuesta = data.response[0];
      const colonias = [...new Set(data.response.map((item: any) => item.d_asenta))].sort();

      const resultado: DireccionCompleta = {
        codigoPostal,
        estado: primeraRespuesta.d_estado,
        municipio: primeraRespuesta.d_mnp,
        localidad: primeraRespuesta.d_ciudad,
        colonias,
        fuente: 'legacy_api'
      };

      this.cache.set(codigoPostal, resultado);
      return resultado;

    } catch (error) {
      console.error('[CP_SERVICE] Error en API legacy:', error);
      return null;
    }
  }

  // Mantener métodos existentes para compatibilidad
  limpiarCache(): void {
    this.cache.clear();
  }

  obtenerDelCache(codigoPostal: string): DireccionCompleta | null {
    return this.cache.get(codigoPostal) || null;
  }
}

export const codigosPostalesService = new CodigosPostalesService();
