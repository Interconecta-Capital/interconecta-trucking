
import { supabase } from "@/integrations/supabase/client";

export interface CatalogItem {
  id: string;
  clave: string;
  descripcion: string;
  nombre?: string;
  simbolo?: string;
}

export interface CodigoPostalInfo {
  codigo_postal: string;
  estado_clave: string;
  municipio_clave: string;
  localidad_clave?: string;
  estimulo_frontera: boolean;
  estado_descripcion?: string;
}

export interface ColoniaInfo {
  clave_colonia: string;
  descripcion: string;
  codigo_postal: string;
}

export class CatalogosSATService {
  // Buscar productos/servicios de Carta Porte
  static async buscarProductosServicios(busqueda: string, limite = 20): Promise<CatalogItem[]> {
    const { data, error } = await supabase
      .from('cat_clave_prod_serv_cp')
      .select('id, clave_prod_serv as clave, descripcion')
      .or(`clave_prod_serv.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`)
      .limit(limite);

    if (error) throw error;
    return data || [];
  }

  // Buscar claves de unidad
  static async buscarClaveUnidad(busqueda: string, limite = 20): Promise<CatalogItem[]> {
    const { data, error } = await supabase
      .from('cat_clave_unidad')
      .select('id, clave_unidad as clave, nombre, descripcion, simbolo')
      .or(`clave_unidad.ilike.%${busqueda}%,nombre.ilike.%${busqueda}%`)
      .limit(limite);

    if (error) throw error;
    return data || [];
  }

  // Buscar tipos de permiso SCT
  static async buscarTiposPermiso(busqueda?: string): Promise<CatalogItem[]> {
    let query = supabase
      .from('cat_tipo_permiso')
      .select('id, clave_permiso as clave, descripcion')
      .eq('transporte_carga', true);

    if (busqueda) {
      query = query.or(`clave_permiso.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`);
    }

    const { data, error } = await query.limit(20);
    if (error) throw error;
    return data || [];
  }

  // Buscar configuraciones de autotransporte
  static async buscarConfiguracionesVehiculo(busqueda?: string): Promise<CatalogItem[]> {
    let query = supabase
      .from('cat_config_autotransporte')
      .select('id, clave_config as clave, descripcion');

    if (busqueda) {
      query = query.or(`clave_config.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`);
    }

    const { data, error } = await query.limit(20);
    if (error) throw error;
    return data || [];
  }

  // Buscar figuras de transporte
  static async buscarFigurasTransporte(busqueda?: string): Promise<CatalogItem[]> {
    let query = supabase
      .from('cat_figura_transporte')
      .select('id, clave_figura as clave, descripcion');

    if (busqueda) {
      query = query.or(`clave_figura.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`);
    }

    const { data, error } = await query.limit(20);
    if (error) throw error;
    return data || [];
  }

  // Buscar subtipos de remolque
  static async buscarSubtiposRemolque(busqueda?: string): Promise<CatalogItem[]> {
    let query = supabase
      .from('cat_subtipo_remolque')
      .select('id, clave_subtipo as clave, descripcion');

    if (busqueda) {
      query = query.or(`clave_subtipo.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`);
    }

    const { data, error } = await query.limit(20);
    if (error) throw error;
    return data || [];
  }

  // Buscar materiales peligrosos
  static async buscarMaterialesPeligrosos(busqueda: string): Promise<CatalogItem[]> {
    const { data, error } = await supabase
      .from('cat_material_peligroso')
      .select('id, clave_material as clave, descripcion')
      .or(`clave_material.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`)
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  // Buscar información de código postal
  static async buscarCodigoPostal(codigoPostal: string): Promise<CodigoPostalInfo | null> {
    const { data, error } = await supabase
      .from('cat_codigo_postal')
      .select(`
        codigo_postal,
        estado_clave,
        municipio_clave,
        localidad_clave,
        estimulo_frontera
      `)
      .eq('codigo_postal', codigoPostal.padStart(5, '0'))
      .single();

    if (error) {
      console.warn('Código postal no encontrado:', codigoPostal);
      return null;
    }

    // Obtener descripción del estado
    const { data: estadoData } = await supabase
      .from('cat_estado')
      .select('descripcion')
      .eq('clave_estado', data.estado_clave)
      .single();

    return {
      ...data,
      estado_descripcion: estadoData?.descripcion
    };
  }

  // Buscar colonias por código postal
  static async buscarColoniasPorCP(codigoPostal: string): Promise<ColoniaInfo[]> {
    const { data, error } = await supabase
      .from('cat_colonia')
      .select('clave_colonia, descripcion, codigo_postal')
      .eq('codigo_postal', codigoPostal.padStart(5, '0'))
      .order('descripcion');

    if (error) throw error;
    return data || [];
  }

  // Buscar estados
  static async buscarEstados(busqueda?: string): Promise<CatalogItem[]> {
    let query = supabase
      .from('cat_estado')
      .select('id, clave_estado as clave, descripcion');

    if (busqueda) {
      query = query.ilike('descripcion', `%${busqueda}%`);
    }

    const { data, error } = await query.order('descripcion').limit(32);
    if (error) throw error;
    return data || [];
  }

  // Validar si una clave existe en un catálogo específico
  static async validarClave(catalogo: string, clave: string): Promise<boolean> {
    const tablaMap: Record<string, string> = {
      'productos': 'cat_clave_prod_serv_cp',
      'unidades': 'cat_clave_unidad',
      'permisos': 'cat_tipo_permiso',
      'configuraciones': 'cat_config_autotransporte',
      'figuras': 'cat_figura_transporte',
      'remolques': 'cat_subtipo_remolque',
      'materiales': 'cat_material_peligroso'
    };

    const tabla = tablaMap[catalogo];
    if (!tabla) throw new Error(`Catálogo ${catalogo} no válido`);

    const columnaMap: Record<string, string> = {
      'cat_clave_prod_serv_cp': 'clave_prod_serv',
      'cat_clave_unidad': 'clave_unidad',
      'cat_tipo_permiso': 'clave_permiso',
      'cat_config_autotransporte': 'clave_config',
      'cat_figura_transporte': 'clave_figura',
      'cat_subtipo_remolque': 'clave_subtipo',
      'cat_material_peligroso': 'clave_material'
    };

    const columna = columnaMap[tabla];
    
    const { count, error } = await supabase
      .from(tabla)
      .select('id', { count: 'exact', head: true })
      .eq(columna, clave);

    if (error) throw error;
    return (count || 0) > 0;
  }
}
