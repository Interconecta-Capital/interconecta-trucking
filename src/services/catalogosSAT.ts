
import { supabase } from '@/integrations/supabase/client';
import { getCatalogoEstatico } from '@/data/catalogosSATEstaticos';

interface CatalogoSATResponse {
  success: boolean;
  data: CatalogoSATItem[];
  error?: string;
}

interface CatalogoSATItem {
  clave: string;
  descripcion: string;
}

export class CatalogosSATService {
  // Cache en memoria para reducir llamadas
  private static cache = new Map<string, CatalogoSATItem[]>();
  private static cacheExpiry = new Map<string, number>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  private static isExpired(cacheKey: string): boolean {
    const expiry = this.cacheExpiry.get(cacheKey);
    return !expiry || Date.now() > expiry;
  }

  private static setCache(key: string, data: CatalogoSATItem[]): void {
    this.cache.set(key, data);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
  }

  // *** CORRECCIÓN: Obtener claves de productos específicos del catálogo CP ***
  static async getProductosServicios(search?: string): Promise<CatalogoSATResponse> {
    const cacheKey = `productos-${search || 'all'}`;
    
    try {
      // Verificar cache primero
      if (!this.isExpired(cacheKey) && this.cache.has(cacheKey)) {
        return {
          success: true,
          data: this.cache.get(cacheKey) || []
        };
      }

      // Intentar obtener datos de Supabase
      const { data, error } = await supabase
        .from('cat_clave_prod_serv_cp')
        .select('clave_prod_serv as clave, descripcion')
        .limit(100);

      if (error) {
        console.warn('Error obteniendo catálogo de productos CP desde Supabase:', error);
        return this.getFallbackData('productos', search);
      }

      const formattedData = (data || []).map(item => ({
        clave: item.clave,
        descripcion: item.descripcion
      }));

      this.setCache(cacheKey, formattedData);

      return {
        success: true,
        data: formattedData
      };
    } catch (error) {
      console.error('Error en getProductosServicios:', error);
      return this.getFallbackData('productos', search);
    }
  }

  // Obtener unidades de medida
  static async getUnidadesMedida(search?: string): Promise<CatalogoSATResponse> {
    const cacheKey = `unidades-${search || 'all'}`;
    
    try {
      if (!this.isExpired(cacheKey) && this.cache.has(cacheKey)) {
        return {
          success: true,
          data: this.cache.get(cacheKey) || []
        };
      }

      const { data, error } = await supabase
        .from('cat_clave_unidad')
        .select('clave_unidad as clave, descripcion')
        .limit(100);

      if (error) {
        console.warn('Error obteniendo catálogo de unidades desde Supabase:', error);
        return this.getFallbackData('unidades', search);
      }

      const formattedData = (data || []).map(item => ({
        clave: item.clave,
        descripcion: item.descripcion
      }));

      this.setCache(cacheKey, formattedData);

      return {
        success: true,
        data: formattedData
      };
    } catch (error) {
      console.error('Error en getUnidadesMedida:', error);
      return this.getFallbackData('unidades', search);
    }
  }

  // *** CORRECCIÓN: Obtener regímenes aduaneros (usar datos estáticos mientras se configura la base) ***
  static async getRegimenesAduaneros(search?: string): Promise<CatalogoSATResponse> {
    try {
      // Usar datos estáticos por ahora
      const staticData = getCatalogoEstatico('regimenes_aduaneros');
      
      let filteredData = staticData;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredData = staticData.filter(item => 
          item.label.toLowerCase().includes(searchLower) ||
          item.descripcion.toLowerCase().includes(searchLower)
        );
      }

      return {
        success: true,
        data: filteredData.map(item => ({
          clave: item.clave,
          descripcion: item.descripcion
        }))
      };
    } catch (error) {
      console.error('Error en getRegimenesAduaneros:', error);
      return this.getFallbackData('regimenes_aduaneros', search);
    }
  }

  // Función de respaldo usando datos estáticos
  private static getFallbackData(tipo: string, search?: string): CatalogoSATResponse {
    console.log(`Usando datos estáticos para ${tipo}`);
    
    try {
      const staticData = getCatalogoEstatico(tipo);
      
      let filteredData = staticData;
      if (search) {
        const searchLower = search.toLowerCase();
        filteredData = staticData.filter(item => 
          item.label.toLowerCase().includes(searchLower) ||
          item.descripcion.toLowerCase().includes(searchLower)
        );
      }

      return {
        success: true,
        data: filteredData.map(item => ({
          clave: item.clave,
          descripcion: item.descripcion
        }))
      };
    } catch (error) {
      console.error(`Error obteniendo datos estáticos para ${tipo}:`, error);
      return {
        success: false,
        data: [],
        error: `Error obteniendo datos para ${tipo}`
      };
    }
  }

  // *** VALIDACIONES MEJORADAS: Usar catálogos específicos CP ***
  static async existeProductoServicio(clave: string): Promise<boolean> {
    try {
      const result = await this.getProductosServicios();
      return result.data.some(item => item.clave === clave);
    } catch (error) {
      console.error('Error validando producto/servicio:', error);
      return false;
    }
  }

  static async existeUnidad(clave: string): Promise<boolean> {
    try {
      const result = await this.getUnidadesMedida();
      return result.data.some(item => item.clave === clave);
    } catch (error) {
      console.error('Error validando unidad:', error);
      return false;
    }
  }

  static async existeRegimenAduanero(clave: string): Promise<boolean> {
    try {
      const result = await this.getRegimenesAduaneros();
      return result.data.some(item => item.clave === clave);
    } catch (error) {
      console.error('Error validando régimen aduanero:', error);
      return false;
    }
  }

  // Buscar por descripción
  static async buscarPorDescripcion(tipo: string, descripcion: string): Promise<CatalogoSATItem[]> {
    try {
      let result: CatalogoSATResponse;
      
      switch (tipo) {
        case 'productos':
          result = await this.getProductosServicios(descripcion);
          break;
        case 'unidades':
          result = await this.getUnidadesMedida(descripcion);
          break;
        case 'regimenes_aduaneros':
          result = await this.getRegimenesAduaneros(descripcion);
          break;
        default:
          return [];
      }

      return result.data;
    } catch (error) {
      console.error(`Error buscando en catálogo ${tipo}:`, error);
      return [];
    }
  }

  // Obtener descripción por clave
  static async getDescripcionPorClave(tipo: string, clave: string): Promise<string> {
    try {
      const items = await this.buscarPorDescripcion(tipo, '');
      const item = items.find(i => i.clave === clave);
      return item?.descripcion || '';
    } catch (error) {
      console.error(`Error obteniendo descripción para ${tipo} ${clave}:`, error);
      return '';
    }
  }

  // Limpiar cache (útil para pruebas o actualizaciones forzadas)
  static clearCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }
}
