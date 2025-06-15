
import { supabase } from '@/integrations/supabase/client';

// Interfaces para los catálogos SAT
export interface ProductoServicio {
  clave: string;
  descripcion: string;
  incluye_iva?: boolean;
}

export interface ClaveUnidad {
  clave: string;
  nombre: string;
  descripcion?: string;
  simbolo?: string;
}

export interface MaterialPeligroso {
  clave: string;
  descripcion: string;
  clase_division?: string;
  grupo_embalaje?: string;
}

export interface ConfiguracionVehicular {
  clave: string;
  descripcion: string;
  remolque?: boolean;
  semirremolque?: boolean;
}

export interface FiguraTransporte {
  clave: string;
  descripcion: string;
  persona_fisica?: boolean;
  persona_moral?: boolean;
}

export interface TipoPermiso {
  clave: string;
  descripcion: string;
  transporte_carga?: boolean;
  transporte_pasajeros?: boolean;
}

export interface CatalogoItem {
  clave: string;
  descripcion: string;
}

// Cache en memoria para mejorar rendimiento
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

export const CatalogosSATService = {
  // Productos y Servicios
  async obtenerProductosServicios(termino: string = ''): Promise<ProductoServicio[]> {
    const cacheKey = `productos-${termino}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('cat_clave_prod_serv_cp')
        .select('clave_prod_serv as clave, descripcion, incluye_iva')
        .ilike('descripcion', `%${termino}%`)
        .limit(50);

      if (error) throw error;
      
      const result = data || [];
      setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error obteniendo productos/servicios:', error);
      return [];
    }
  },

  // Unidades de Medida
  async obtenerUnidades(termino: string = ''): Promise<ClaveUnidad[]> {
    const cacheKey = `unidades-${termino}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('cat_clave_unidad')
        .select('clave_unidad as clave, nombre, descripcion, simbolo')
        .or(`nombre.ilike.%${termino}%,descripcion.ilike.%${termino}%`)
        .limit(50);

      if (error) throw error;
      
      const result = data || [];
      setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error obteniendo unidades:', error);
      return [];
    }
  },

  // Materiales Peligrosos
  async obtenerMaterialesPeligrosos(termino: string = ''): Promise<MaterialPeligroso[]> {
    const cacheKey = `materiales-${termino}`;
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('cat_material_peligroso')
        .select('clave_material as clave, descripcion, clase_division, grupo_embalaje')
        .ilike('descripcion', `%${termino}%`)
        .limit(50);

      if (error) throw error;
      
      const result = data || [];
      setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error obteniendo materiales peligrosos:', error);
      return [];
    }
  },

  // Configuraciones Vehiculares
  async obtenerConfiguracionesVehiculares(): Promise<ConfiguracionVehicular[]> {
    const cacheKey = 'configuraciones-vehiculares';
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('cat_config_autotransporte')
        .select('clave_config as clave, descripcion, remolque, semirremolque');

      if (error) throw error;
      
      const result = data || [];
      setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error obteniendo configuraciones vehiculares:', error);
      return [];
    }
  },

  // Figuras de Transporte
  async obtenerFigurasTransporte(): Promise<FiguraTransporte[]> {
    const cacheKey = 'figuras-transporte';
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('cat_figura_transporte')
        .select('clave_figura as clave, descripcion, persona_fisica, persona_moral');

      if (error) throw error;
      
      const result = data || [];
      setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error obteniendo figuras de transporte:', error);
      return [];
    }
  },

  // Tipos de Permiso
  async obtenerTiposPermiso(): Promise<TipoPermiso[]> {
    const cacheKey = 'tipos-permiso';
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('cat_tipo_permiso')
        .select('clave_permiso as clave, descripcion, transporte_carga, transporte_pasajeros');

      if (error) throw error;
      
      const result = data || [];
      setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error obteniendo tipos de permiso:', error);
      return [];
    }
  },

  // Tipos de Embalaje
  async obtenerTiposEmbalaje(): Promise<CatalogoItem[]> {
    const cacheKey = 'tipos-embalaje';
    const cached = getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('cat_tipo_embalaje')
        .select('clave_embalaje as clave, descripcion');

      if (error) throw error;
      
      const result = data || [];
      setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error obteniendo tipos de embalaje:', error);
      return [];
    }
  },

  // Utilidades
  clearCache: () => {
    cache.clear();
  }
};
