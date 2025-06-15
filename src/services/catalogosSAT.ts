
import { supabase } from '@/integrations/supabase/client';

export interface CatalogoItem {
  clave: string;
  descripcion: string;
  fecha_inicio_vigencia?: string;
  fecha_fin_vigencia?: string;
}

export interface ProductoServicio extends CatalogoItem {
  incluye_iva?: boolean;
}

export interface ClaveUnidad extends CatalogoItem {
  nombre: string;
  simbolo?: string;
}

export interface MaterialPeligroso extends CatalogoItem {
  clase_division?: string;
  grupo_embalaje?: string;
}

export interface ConfiguracionVehicular extends CatalogoItem {
  remolque?: boolean;
  semirremolque?: boolean;
}

export interface FiguraTransporte extends CatalogoItem {
  persona_fisica?: boolean;
  persona_moral?: boolean;
}

export interface TipoPermiso extends CatalogoItem {
  transporte_carga?: boolean;
  transporte_pasajeros?: boolean;
}

export class CatalogosSATService {
  // Cache simple en memoria
  private static cache = new Map<string, { data: any[], timestamp: number }>();
  private static CACHE_TTL = 10 * 60 * 1000; // 10 minutos

  private static isValidCache(key: string): boolean {
    const cached = this.cache.get(key);
    return cached ? (Date.now() - cached.timestamp) < this.CACHE_TTL : false;
  }

  private static setCache(key: string, data: any[]): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private static getCache(key: string): any[] | null {
    const cached = this.cache.get(key);
    return cached ? cached.data : null;
  }

  static async buscarProductosServicios(termino: string): Promise<ProductoServicio[]> {
    const cacheKey = `productos_${termino}`;
    
    if (this.isValidCache(cacheKey)) {
      return this.getCache(cacheKey) || [];
    }

    try {
      const { data, error } = await supabase
        .from('cat_clave_prod_serv_cp')
        .select('clave_prod_serv as clave, descripcion, incluye_iva')
        .or(`clave_prod_serv.ilike.%${termino}%,descripcion.ilike.%${termino}%`)
        .order('clave_prod_serv')
        .limit(20);

      if (error) throw error;

      const result = data || [];
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error buscando productos/servicios:', error);
      return [];
    }
  }

  static async buscarClaveUnidad(termino: string): Promise<ClaveUnidad[]> {
    const cacheKey = `unidades_${termino}`;
    
    if (this.isValidCache(cacheKey)) {
      return this.getCache(cacheKey) || [];
    }

    try {
      const { data, error } = await supabase
        .from('cat_clave_unidad')
        .select('clave_unidad as clave, nombre, descripcion, simbolo')
        .or(`clave_unidad.ilike.%${termino}%,nombre.ilike.%${termino}%,descripcion.ilike.%${termino}%`)
        .order('clave_unidad')
        .limit(20);

      if (error) throw error;

      const result = data || [];
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error buscando claves de unidad:', error);
      return [];
    }
  }

  static async buscarMaterialesPeligrosos(termino: string): Promise<MaterialPeligroso[]> {
    if (!termino || termino.length < 2) return [];
    
    const cacheKey = `materiales_${termino}`;
    
    if (this.isValidCache(cacheKey)) {
      return this.getCache(cacheKey) || [];
    }

    try {
      const { data, error } = await supabase
        .from('cat_material_peligroso')
        .select('clave_material as clave, descripcion, clase_division, grupo_embalaje')
        .or(`clave_material.ilike.%${termino}%,descripcion.ilike.%${termino}%`)
        .order('clave_material')
        .limit(15);

      if (error) throw error;

      const result = data || [];
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error buscando materiales peligrosos:', error);
      return [];
    }
  }

  static async obtenerConfiguracionesVehiculares(): Promise<ConfiguracionVehicular[]> {
    const cacheKey = 'configuraciones_vehiculares';
    
    if (this.isValidCache(cacheKey)) {
      return this.getCache(cacheKey) || [];
    }

    try {
      const { data, error } = await supabase
        .from('cat_config_autotransporte')
        .select('clave_config as clave, descripcion, remolque, semirremolque')
        .order('clave_config');

      if (error) throw error;

      const result = data || [];
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error obteniendo configuraciones vehiculares:', error);
      return [];
    }
  }

  static async obtenerFigurasTransporte(): Promise<FiguraTransporte[]> {
    const cacheKey = 'figuras_transporte';
    
    if (this.isValidCache(cacheKey)) {
      return this.getCache(cacheKey) || [];
    }

    try {
      const { data, error } = await supabase
        .from('cat_figura_transporte')
        .select('clave_figura as clave, descripcion, persona_fisica, persona_moral')
        .order('clave_figura');

      if (error) throw error;

      const result = data || [];
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error obteniendo figuras de transporte:', error);
      return [];
    }
  }

  static async obtenerTiposPermiso(): Promise<TipoPermiso[]> {
    const cacheKey = 'tipos_permiso';
    
    if (this.isValidCache(cacheKey)) {
      return this.getCache(cacheKey) || [];
    }

    try {
      const { data, error } = await supabase
        .from('cat_tipo_permiso')
        .select('clave_permiso as clave, descripcion, transporte_carga, transporte_pasajeros')
        .order('clave_permiso');

      if (error) throw error;

      const result = data || [];
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error obteniendo tipos de permiso:', error);
      return [];
    }
  }

  static async obtenerTiposEmbalaje(): Promise<CatalogoItem[]> {
    const cacheKey = 'tipos_embalaje';
    
    if (this.isValidCache(cacheKey)) {
      return this.getCache(cacheKey) || [];
    }

    try {
      const { data, error } = await supabase
        .from('cat_tipo_embalaje')
        .select('clave_embalaje as clave, descripcion')
        .order('clave_embalaje');

      if (error) throw error;

      const result = data || [];
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error obteniendo tipos de embalaje:', error);
      return [];
    }
  }

  static async obtenerEstados(): Promise<CatalogoItem[]> {
    const cacheKey = 'estados';
    
    if (this.isValidCache(cacheKey)) {
      return this.getCache(cacheKey) || [];
    }

    try {
      const { data, error } = await supabase
        .from('cat_estado')
        .select('clave_estado as clave, descripcion')
        .order('descripcion');

      if (error) throw error;

      const result = data || [];
      this.setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error obteniendo estados:', error);
      return [];
    }
  }

  static limpiarCache(): void {
    this.cache.clear();
  }
}
