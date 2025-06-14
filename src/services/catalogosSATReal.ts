
import { supabase } from '@/integrations/supabase/client';

export interface CatalogItem {
  value: string;
  label: string;
  descripcion?: string;
  id?: string;
  clave?: string;
  nombre?: string;
}

export interface CodigoPostalInfo {
  codigo_postal: string;
  estado_clave: string;
  estado_descripcion: string;
  municipio_clave: string;
  municipio_descripcion: string;
  localidad_clave: string;
  localidad_descripcion: string;
}

export interface ColoniaInfo {
  colonia: string;
  codigo_postal: string;
  estado: string;
  municipio: string;
  localidad: string;
}

// Cache para optimizar rendimiento
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

function getCacheKey(table: string, query: string = ''): string {
  return `${table}_${query}`;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

function getCache(key: string): any | null {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(key);
  return null;
}

export class CatalogosSATRealService {
  // Validar formato de código postal
  static validarFormatoCodigoPostal(codigo: string): boolean {
    return /^\d{5}$/.test(codigo);
  }

  // Buscar productos y servicios desde la base de datos
  static async buscarProductosServicios(busqueda: string = ''): Promise<CatalogItem[]> {
    const cacheKey = getCacheKey('productos', busqueda);
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
      let query = supabase
        .from('cat_clave_prod_serv_cp')
        .select('clave_prod_serv, descripcion')
        .order('clave_prod_serv');

      if (busqueda) {
        query = query.or(`clave_prod_serv.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        console.error('Error fetching productos:', error);
        return [];
      }

      const result = (data || []).map(item => ({
        value: item.clave_prod_serv,
        label: `${item.clave_prod_serv} - ${item.descripcion}`,
        descripcion: item.descripcion,
        clave: item.clave_prod_serv
      }));

      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error in buscarProductosServicios:', error);
      return [];
    }
  }

  // Buscar claves de unidad desde la base de datos
  static async buscarClaveUnidad(busqueda: string = ''): Promise<CatalogItem[]> {
    const cacheKey = getCacheKey('unidades', busqueda);
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
      let query = supabase
        .from('cat_clave_unidad')
        .select('clave_unidad, nombre, descripcion, simbolo')
        .order('clave_unidad');

      if (busqueda) {
        query = query.or(`clave_unidad.ilike.%${busqueda}%,nombre.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        console.error('Error fetching unidades:', error);
        return [];
      }

      const result = (data || []).map(item => ({
        value: item.clave_unidad,
        label: `${item.clave_unidad} - ${item.nombre}`,
        descripcion: item.descripcion,
        clave: item.clave_unidad,
        nombre: item.nombre
      }));

      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error in buscarClaveUnidad:', error);
      return [];
    }
  }

  // Buscar tipos de permiso desde la base de datos
  static async buscarTiposPermiso(busqueda?: string): Promise<CatalogItem[]> {
    const cacheKey = getCacheKey('permisos', busqueda || '');
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
      let query = supabase
        .from('cat_tipo_permiso')
        .select('clave_permiso, descripcion')
        .eq('transporte_carga', true)
        .order('clave_permiso');

      if (busqueda) {
        query = query.or(`clave_permiso.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Error fetching permisos:', error);
        return [];
      }

      const result = (data || []).map(item => ({
        value: item.clave_permiso,
        label: `${item.clave_permiso} - ${item.descripcion}`,
        descripcion: item.descripcion,
        clave: item.clave_permiso
      }));

      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error in buscarTiposPermiso:', error);
      return [];
    }
  }

  // Buscar configuraciones de vehículo desde la base de datos
  static async buscarConfiguracionesVehiculo(busqueda?: string): Promise<CatalogItem[]> {
    const cacheKey = getCacheKey('configuraciones', busqueda || '');
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
      let query = supabase
        .from('cat_config_autotransporte')
        .select('clave_config, descripcion')
        .order('clave_config');

      if (busqueda) {
        query = query.or(`clave_config.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Error fetching configuraciones:', error);
        return [];
      }

      const result = (data || []).map(item => ({
        value: item.clave_config,
        label: `${item.clave_config} - ${item.descripcion}`,
        descripcion: item.descripcion,
        clave: item.clave_config
      }));

      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error in buscarConfiguracionesVehiculo:', error);
      return [];
    }
  }

  // Buscar figuras de transporte desde la base de datos
  static async buscarFigurasTransporte(busqueda?: string): Promise<CatalogItem[]> {
    const cacheKey = getCacheKey('figuras', busqueda || '');
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
      let query = supabase
        .from('cat_figura_transporte')
        .select('clave_figura, descripcion')
        .order('clave_figura');

      if (busqueda) {
        query = query.or(`clave_figura.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Error fetching figuras:', error);
        return [];
      }

      const result = (data || []).map(item => ({
        value: item.clave_figura,
        label: `${item.clave_figura} - ${item.descripcion}`,
        descripcion: item.descripcion,
        clave: item.clave_figura
      }));

      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error in buscarFigurasTransporte:', error);
      return [];
    }
  }

  // Buscar subtipos de remolque desde la base de datos
  static async buscarSubtiposRemolque(busqueda?: string): Promise<CatalogItem[]> {
    const cacheKey = getCacheKey('remolques', busqueda || '');
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
      let query = supabase
        .from('cat_subtipo_remolque')
        .select('clave_subtipo, descripcion')
        .order('clave_subtipo');

      if (busqueda) {
        query = query.or(`clave_subtipo.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Error fetching remolques:', error);
        return [];
      }

      const result = (data || []).map(item => ({
        value: item.clave_subtipo,
        label: `${item.clave_subtipo} - ${item.descripcion}`,
        descripcion: item.descripcion,
        clave: item.clave_subtipo
      }));

      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error in buscarSubtiposRemolque:', error);
      return [];
    }
  }

  // Buscar materiales peligrosos desde la base de datos
  static async buscarMaterialesPeligrosos(busqueda: string): Promise<CatalogItem[]> {
    if (!busqueda || busqueda.length < 2) return [];

    const cacheKey = getCacheKey('materiales', busqueda);
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('cat_material_peligroso')
        .select('clave_material, descripcion')
        .or(`clave_material.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`)
        .order('clave_material')
        .limit(50);

      if (error) {
        console.error('Error fetching materiales peligrosos:', error);
        return [];
      }

      const result = (data || []).map(item => ({
        value: item.clave_material,
        label: `${item.clave_material} - ${item.descripcion}`,
        descripcion: item.descripcion,
        clave: item.clave_material
      }));

      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error in buscarMaterialesPeligrosos:', error);
      return [];
    }
  }

  // Buscar tipos de embalaje desde la base de datos
  static async buscarTiposEmbalaje(busqueda?: string): Promise<CatalogItem[]> {
    const cacheKey = getCacheKey('embalajes', busqueda || '');
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
      let query = supabase
        .from('cat_tipo_embalaje')
        .select('clave_embalaje, descripcion')
        .order('clave_embalaje');

      if (busqueda) {
        query = query.or(`clave_embalaje.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Error fetching embalajes:', error);
        return [];
      }

      const result = (data || []).map(item => ({
        value: item.clave_embalaje,
        label: `${item.clave_embalaje} - ${item.descripcion}`,
        descripcion: item.descripcion,
        clave: item.clave_embalaje
      }));

      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error in buscarTiposEmbalaje:', error);
      return [];
    }
  }

  // Buscar estados desde la base de datos
  static async buscarEstados(busqueda?: string): Promise<CatalogItem[]> {
    const cacheKey = getCacheKey('estados', busqueda || '');
    const cached = getCache(cacheKey);
    if (cached) return cached;

    try {
      let query = supabase
        .from('cat_estado')
        .select('clave_estado, descripcion')
        .eq('pais_clave', 'MEX')
        .order('descripcion');

      if (busqueda) {
        query = query.or(`clave_estado.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Error fetching estados:', error);
        return [];
      }

      const result = (data || []).map(item => ({
        value: item.clave_estado,
        label: `${item.clave_estado} - ${item.descripcion}`,
        descripcion: item.descripcion,
        clave: item.clave_estado
      }));

      setCache(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error in buscarEstados:', error);
      return [];
    }
  }

  // Limpiar cache
  static clearCache(): void {
    cache.clear();
  }
}
