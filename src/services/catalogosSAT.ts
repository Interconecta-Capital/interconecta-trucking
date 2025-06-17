
import { supabase } from '@/integrations/supabase/client';

// Interfaces para los catálogos SAT
export interface ProductoServicio {
  clave: string;
  descripcion: string;
  incluye_iva?: boolean;
  fecha_inicio_vigencia?: string;
  fecha_fin_vigencia?: string;
}

export interface ClaveUnidad {
  clave: string;
  nombre: string;
  descripcion?: string;
  simbolo?: string;
  fecha_inicio_vigencia?: string;
  fecha_fin_vigencia?: string;
}

export interface MaterialPeligroso {
  clave: string;
  descripcion: string;
  clase_division?: string;
  grupo_embalaje?: string;
  instrucciones_embalaje?: string;
  peligro_secundario?: string;
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

// Cache interno
const cache = new Map<string, any>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutos

export class CatalogosSATService {
  static clearCache() {
    cache.clear();
  }

  private static getCacheKey(tipo: string, termino?: string): string {
    return `${tipo}-${termino || 'all'}`;
  }

  private static isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < CACHE_TTL;
  }

  // Obtener productos y servicios SAT
  static async obtenerProductosServicios(termino: string = ''): Promise<ProductoServicio[]> {
    const cacheKey = this.getCacheKey('productos', termino);
    const cached = cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      let query = supabase
        .from('cat_clave_prod_serv_cp')
        .select('clave_prod_serv, descripcion, incluye_iva, fecha_inicio_vigencia, fecha_fin_vigencia')
        .order('clave_prod_serv');

      if (termino && termino.length >= 2) {
        query = query.or(`clave_prod_serv.ilike.%${termino}%,descripcion.ilike.%${termino}%`);
      }

      const { data, error } = await query.limit(1000);

      if (error) {
        console.error('Error fetching productos servicios:', error);
        return [];
      }

      const result = (data || []).map(item => ({
        clave: item.clave_prod_serv,
        descripcion: item.descripcion,
        incluye_iva: item.incluye_iva,
        fecha_inicio_vigencia: item.fecha_inicio_vigencia,
        fecha_fin_vigencia: item.fecha_fin_vigencia
      }));
      
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error('Error in obtenerProductosServicios:', error);
      return [];
    }
  }

  // Obtener unidades de medida SAT
  static async obtenerUnidades(termino: string = ''): Promise<ClaveUnidad[]> {
    const cacheKey = this.getCacheKey('unidades', termino);
    const cached = cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      let query = supabase
        .from('cat_clave_unidad')
        .select('clave_unidad, nombre, descripcion, simbolo, fecha_inicio_vigencia, fecha_fin_vigencia')
        .order('clave_unidad');

      if (termino && termino.length >= 2) {
        query = query.or(`clave_unidad.ilike.%${termino}%,nombre.ilike.%${termino}%,descripcion.ilike.%${termino}%`);
      }

      const { data, error } = await query.limit(1000);

      if (error) {
        console.error('Error fetching unidades:', error);
        return [];
      }

      const result = (data || []).map(item => ({
        clave: item.clave_unidad,
        nombre: item.nombre,
        descripcion: item.descripcion,
        simbolo: item.simbolo,
        fecha_inicio_vigencia: item.fecha_inicio_vigencia,
        fecha_fin_vigencia: item.fecha_fin_vigencia
      }));
      
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error('Error in obtenerUnidades:', error);
      return [];
    }
  }

  // Obtener materiales peligrosos
  static async obtenerMaterialesPeligrosos(termino: string = ''): Promise<MaterialPeligroso[]> {
    const cacheKey = this.getCacheKey('materiales', termino);
    const cached = cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      let query = supabase
        .from('cat_material_peligroso')
        .select('clave_material, descripcion, clase_division, grupo_embalaje, instrucciones_embalaje, peligro_secundario')
        .order('clave_material');

      if (termino && termino.length >= 2) {
        query = query.or(`clave_material.ilike.%${termino}%,descripcion.ilike.%${termino}%`);
      }

      const { data, error } = await query.limit(500);

      if (error) {
        console.error('Error fetching materiales peligrosos:', error);
        return [];
      }

      const result = (data || []).map(item => ({
        clave: item.clave_material,
        descripcion: item.descripcion,
        clase_division: item.clase_division,
        grupo_embalaje: item.grupo_embalaje,
        instrucciones_embalaje: item.instrucciones_embalaje,
        peligro_secundario: item.peligro_secundario
      }));
      
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error('Error in obtenerMaterialesPeligrosos:', error);
      return [];
    }
  }

  // Obtener configuraciones vehiculares
  static async obtenerConfiguracionesVehiculares(): Promise<ConfiguracionVehicular[]> {
    const cacheKey = this.getCacheKey('configuraciones');
    const cached = cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      const { data, error } = await supabase
        .from('cat_config_autotransporte')
        .select('clave_config, descripcion, remolque, semirremolque')
        .order('clave_config');

      if (error) {
        console.error('Error fetching configuraciones vehiculares:', error);
        return [];
      }

      const result = (data || []).map(item => ({
        clave: item.clave_config,
        descripcion: item.descripcion,
        remolque: item.remolque,
        semirremolque: item.semirremolque
      }));
      
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error('Error in obtenerConfiguracionesVehiculares:', error);
      return [];
    }
  }

  // Obtener figuras de transporte
  static async obtenerFigurasTransporte(): Promise<FiguraTransporte[]> {
    const cacheKey = this.getCacheKey('figuras');
    const cached = cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      const { data, error } = await supabase
        .from('cat_figura_transporte')
        .select('clave_figura, descripcion, persona_fisica, persona_moral')
        .order('clave_figura');

      if (error) {
        console.error('Error fetching figuras transporte:', error);
        return [];
      }

      const result = (data || []).map(item => ({
        clave: item.clave_figura,
        descripcion: item.descripcion,
        persona_fisica: item.persona_fisica,
        persona_moral: item.persona_moral
      }));
      
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error('Error in obtenerFigurasTransporte:', error);
      return [];
    }
  }

  // Obtener tipos de permiso
  static async obtenerTiposPermiso(): Promise<TipoPermiso[]> {
    const cacheKey = this.getCacheKey('permisos');
    const cached = cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      const { data, error } = await supabase
        .from('cat_tipo_permiso')
        .select('clave_permiso, descripcion, transporte_carga, transporte_pasajeros')
        .order('clave_permiso');

      if (error) {
        console.error('Error fetching tipos permiso:', error);
        return [];
      }

      const result = (data || []).map(item => ({
        clave: item.clave_permiso,
        descripcion: item.descripcion,
        transporte_carga: item.transporte_carga,
        transporte_pasajeros: item.transporte_pasajeros
      }));
      
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error('Error in obtenerTiposPermiso:', error);
      return [];
    }
  }

  // Obtener tipos de embalaje
  static async obtenerTiposEmbalaje(): Promise<CatalogoItem[]> {
    const cacheKey = this.getCacheKey('embalajes');
    const cached = cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      const { data, error } = await supabase
        .from('cat_tipo_embalaje')
        .select('clave_embalaje, descripcion')
        .order('clave_embalaje');

      if (error) {
        console.error('Error fetching tipos embalaje:', error);
        return [];
      }

      const result = (data || []).map(item => ({
        clave: item.clave_embalaje,
        descripcion: item.descripcion
      }));
      
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error('Error in obtenerTiposEmbalaje:', error);
      return [];
    }
  }

  // Obtener subtipos de remolque
  static async obtenerSubtiposRemolque(termino: string = ''): Promise<CatalogoItem[]> {
    const cacheKey = this.getCacheKey('remolques', termino);
    const cached = cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      let query = supabase
        .from('cat_subtipo_remolque')
        .select('clave_subtipo, descripcion')
        .order('clave_subtipo');

      if (termino && termino.length >= 2) {
        query = query.or(`clave_subtipo.ilike.%${termino}%,descripcion.ilike.%${termino}%`);
      }

      const { data, error } = await query.limit(200);

      if (error) {
        console.error('Error fetching subtipos remolque:', error);
        return [];
      }

      const result = (data || []).map(item => ({
        clave: item.clave_subtipo,
        descripcion: item.descripcion
      }));
      
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error('Error in obtenerSubtiposRemolque:', error);
      return [];
    }
  }

  // Obtener estados
  static async obtenerEstados(termino: string = ''): Promise<CatalogoItem[]> {
    const cacheKey = this.getCacheKey('estados', termino);
    const cached = cache.get(cacheKey);
    
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }

    try {
      let query = supabase
        .from('cat_estado')
        .select('clave_estado, descripcion')
        .order('descripcion');

      if (termino && termino.length >= 1) {
        query = query.or(`clave_estado.ilike.%${termino}%,descripcion.ilike.%${termino}%`);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Error fetching estados:', error);
        return [];
      }

      const result = (data || []).map(item => ({
        clave: item.clave_estado,
        descripcion: item.descripcion
      }));
      
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    } catch (error) {
      console.error('Error in obtenerEstados:', error);
      return [];
    }
  }
}
