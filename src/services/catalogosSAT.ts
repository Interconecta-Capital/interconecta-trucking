
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
      .select('id, clave_prod_serv, descripcion')
      .or(`clave_prod_serv.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`)
      .limit(limite);

    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      clave: item.clave_prod_serv,
      descripcion: item.descripcion
    }));
  }

  // Buscar claves de unidad
  static async buscarClaveUnidad(busqueda: string, limite = 20): Promise<CatalogItem[]> {
    const { data, error } = await supabase
      .from('cat_clave_unidad')
      .select('id, clave_unidad, nombre, descripcion, simbolo')
      .or(`clave_unidad.ilike.%${busqueda}%,nombre.ilike.%${busqueda}%`)
      .limit(limite);

    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      clave: item.clave_unidad,
      descripcion: item.descripcion || '',
      nombre: item.nombre,
      simbolo: item.simbolo || undefined
    }));
  }

  // Buscar tipos de permiso SCT
  static async buscarTiposPermiso(busqueda?: string): Promise<CatalogItem[]> {
    let query = supabase
      .from('cat_tipo_permiso')
      .select('id, clave_permiso, descripcion')
      .eq('transporte_carga', true);

    if (busqueda) {
      query = query.or(`clave_permiso.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`);
    }

    const { data, error } = await query.limit(20);
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      clave: item.clave_permiso,
      descripcion: item.descripcion
    }));
  }

  // Buscar configuraciones de autotransporte
  static async buscarConfiguracionesVehiculo(busqueda?: string): Promise<CatalogItem[]> {
    let query = supabase
      .from('cat_config_autotransporte')
      .select('id, clave_config, descripcion');

    if (busqueda) {
      query = query.or(`clave_config.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`);
    }

    const { data, error } = await query.limit(20);
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      clave: item.clave_config,
      descripcion: item.descripcion
    }));
  }

  // Buscar figuras de transporte
  static async buscarFigurasTransporte(busqueda?: string): Promise<CatalogItem[]> {
    let query = supabase
      .from('cat_figura_transporte')
      .select('id, clave_figura, descripcion');

    if (busqueda) {
      query = query.or(`clave_figura.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`);
    }

    const { data, error } = await query.limit(20);
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      clave: item.clave_figura,
      descripcion: item.descripcion
    }));
  }

  // Buscar subtipos de remolque
  static async buscarSubtiposRemolque(busqueda?: string): Promise<CatalogItem[]> {
    let query = supabase
      .from('cat_subtipo_remolque')
      .select('id, clave_subtipo, descripcion');

    if (busqueda) {
      query = query.or(`clave_subtipo.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`);
    }

    const { data, error } = await query.limit(20);
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      clave: item.clave_subtipo,
      descripcion: item.descripcion
    }));
  }

  // Buscar materiales peligrosos
  static async buscarMaterialesPeligrosos(busqueda: string): Promise<CatalogItem[]> {
    const { data, error } = await supabase
      .from('cat_material_peligroso')
      .select('id, clave_material, descripcion')
      .or(`clave_material.ilike.%${busqueda}%,descripcion.ilike.%${busqueda}%`)
      .limit(20);

    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      clave: item.clave_material,
      descripcion: item.descripcion
    }));
  }

  // Buscar información de código postal con mejor manejo de errores
  static async buscarCodigoPostal(codigoPostal: string): Promise<CodigoPostalInfo | null> {
    try {
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
        console.log('Código postal no encontrado en catálogos:', codigoPostal);
        return null;
      }

      // Obtener descripción del estado solo si encontramos el código postal
      const { data: estadoData } = await supabase
        .from('cat_estado')
        .select('descripcion')
        .eq('clave_estado', data.estado_clave)
        .single();

      return {
        ...data,
        estado_descripcion: estadoData?.descripcion || `Estado ${data.estado_clave}`
      };
    } catch (error) {
      console.log('Error buscando código postal:', error);
      return null;
    }
  }

  // Buscar colonias por código postal con mejor manejo de errores
  static async buscarColoniasPorCP(codigoPostal: string): Promise<ColoniaInfo[]> {
    try {
      const { data, error } = await supabase
        .from('cat_colonia')
        .select('clave_colonia, descripcion, codigo_postal')
        .eq('codigo_postal', codigoPostal.padStart(5, '0'))
        .order('descripcion');

      if (error) {
        console.log('No se encontraron colonias para CP:', codigoPostal);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.log('Error buscando colonias:', error);
      return [];
    }
  }

  // Buscar estados
  static async buscarEstados(busqueda?: string): Promise<CatalogItem[]> {
    let query = supabase
      .from('cat_estado')
      .select('id, clave_estado, descripcion');

    if (busqueda) {
      query = query.ilike('descripcion', `%${busqueda}%`);
    }

    const { data, error } = await query.order('descripcion').limit(32);
    if (error) throw error;
    
    return (data || []).map(item => ({
      id: item.id,
      clave: item.clave_estado,
      descripcion: item.descripcion
    }));
  }

  // Validar si una clave existe en un catálogo específico
  static async validarClave(catalogo: string, clave: string): Promise<boolean> {
    const tablaMap: Record<string, { tabla: string; columna: string }> = {
      'productos': { tabla: 'cat_clave_prod_serv_cp', columna: 'clave_prod_serv' },
      'unidades': { tabla: 'cat_clave_unidad', columna: 'clave_unidad' },
      'permisos': { tabla: 'cat_tipo_permiso', columna: 'clave_permiso' },
      'configuraciones': { tabla: 'cat_config_autotransporte', columna: 'clave_config' },
      'figuras': { tabla: 'cat_figura_transporte', columna: 'clave_figura' },
      'remolques': { tabla: 'cat_subtipo_remolque', columna: 'clave_subtipo' },
      'materiales': { tabla: 'cat_material_peligroso', columna: 'clave_material' }
    };

    const config = tablaMap[catalogo];
    if (!config) throw new Error(`Catálogo ${catalogo} no válido`);

    try {
      // Use type assertion for the table name since we know it exists
      const { count, error } = await (supabase as any)
        .from(config.tabla)
        .select('id', { count: 'exact', head: true })
        .eq(config.columna, clave);

      if (error) throw error;
      return (count || 0) > 0;
    } catch (error) {
      console.log(`Error validating ${catalogo} clave ${clave}:`, error);
      return false;
    }
  }

  // Función helper para validar si un código postal es válido (formato)
  static validarFormatoCodigoPostal(codigoPostal: string): boolean {
    return /^\d{5}$/.test(codigoPostal?.trim() || '');
  }

  // Función helper para limpiar código postal
  static limpiarCodigoPostal(codigoPostal: string): string {
    return codigoPostal?.replace(/\D/g, '').slice(0, 5) || '';
  }
}
