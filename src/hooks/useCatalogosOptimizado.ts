import { useQuery, QueryClient } from '@tanstack/react-query';
import { CatalogosSATService } from '@/services/catalogosSAT';
import { useEffect } from 'react';

const STALE_TIME_SHORT = 15 * 60 * 1000; // 15 minutes (optimizado de 5)
const STALE_TIME_LONG = 60 * 60 * 1000; // 60 minutes (optimizado de 30)
const CACHE_TIME = 24 * 60 * 60 * 1000; // 24 hours

// Catálogos que se precargan automáticamente
const CATALOGOS_PRECARGA = [
  'configuraciones-vehiculares',
  'figuras-transporte',
  'tipos-permiso',
  'tipos-embalaje',
];

/**
 * Guarda catálogo en localStorage
 */
const saveCatalogToLocalStorage = (key: string, data: any) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`catalog_${key}`, JSON.stringify(cacheData));
  } catch (error) {
    console.warn('Error guardando catálogo en localStorage:', error);
  }
};

/**
 * Recupera catálogo de localStorage si está vigente
 */
const getCatalogFromLocalStorage = (key: string, maxAge: number): any | null => {
  try {
    const cached = localStorage.getItem(`catalog_${key}`);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    if (age > maxAge) {
      localStorage.removeItem(`catalog_${key}`);
      return null;
    }

    return data;
  } catch (error) {
    console.warn('Error recuperando catálogo de localStorage:', error);
    return null;
  }
};

/**
 * Hook optimizado para productos y servicios con caché
 */
export const useBuscarProductosServicios = (termino: string = '', enabled: boolean = true) => {
  const query = useQuery({
    queryKey: ['productos-servicios', termino],
    queryFn: async () => {
      // Intentar recuperar de localStorage primero
      const cached = getCatalogFromLocalStorage(`productos-servicios-${termino}`, STALE_TIME_SHORT);
      if (cached) {
        console.log('📦 Productos/Servicios desde localStorage');
        return cached;
      }

      const data = await CatalogosSATService.obtenerProductosServicios(termino);
      
      // Guardar en localStorage
      if (data && data.length > 0) {
        saveCatalogToLocalStorage(`productos-servicios-${termino}`, data);
      }
      
      return data;
    },
    enabled: enabled,
    staleTime: STALE_TIME_SHORT,
    gcTime: CACHE_TIME,
  });

  return query;
};

/**
 * Hook optimizado para unidades con caché
 */
export const useBuscarClaveUnidad = (termino: string = '', enabled: boolean = true) => {
  return useQuery({
    queryKey: ['unidades', termino],
    queryFn: async () => {
      const cached = getCatalogFromLocalStorage(`unidades-${termino}`, STALE_TIME_SHORT);
      if (cached) {
        console.log('📦 Unidades desde localStorage');
        return cached;
      }

      const data = await CatalogosSATService.obtenerUnidades(termino);
      if (data && data.length > 0) {
        saveCatalogToLocalStorage(`unidades-${termino}`, data);
      }
      return data;
    },
    enabled: enabled,
    staleTime: STALE_TIME_SHORT,
    gcTime: CACHE_TIME,
  });
};

/**
 * Hook optimizado para materiales peligrosos
 */
export const useBuscarMaterialesPeligrosos = (termino: string = '', enabled: boolean = true) => {
  return useQuery({
    queryKey: ['materiales-peligrosos', termino],
    queryFn: async () => {
      const cached = getCatalogFromLocalStorage(`materiales-peligrosos-${termino}`, STALE_TIME_LONG);
      if (cached) {
        console.log('📦 Materiales Peligrosos desde localStorage');
        return cached;
      }

      const data = await CatalogosSATService.obtenerMaterialesPeligrosos(termino);
      if (data && data.length > 0) {
        saveCatalogToLocalStorage(`materiales-peligrosos-${termino}`, data);
      }
      return data;
    },
    enabled: enabled && termino.length >= 2,
    staleTime: STALE_TIME_LONG,
    gcTime: CACHE_TIME,
  });
};

/**
 * Hook con precarga para configuraciones vehiculares
 */
export const useConfiguracionesVehiculo = (enabled: boolean = true) => {
  const query = useQuery({
    queryKey: ['configuraciones-vehiculares'],
    queryFn: async () => {
      const cached = getCatalogFromLocalStorage('configuraciones-vehiculares', STALE_TIME_LONG);
      if (cached) {
        console.log('📦 Configuraciones Vehiculares desde localStorage');
        return cached;
      }

      const data = await CatalogosSATService.obtenerConfiguracionesVehiculares();
      saveCatalogToLocalStorage('configuraciones-vehiculares', data);
      return data;
    },
    enabled: enabled,
    staleTime: STALE_TIME_LONG,
    gcTime: CACHE_TIME,
  });

  return query;
};

/**
 * Hook con precarga para figuras transporte
 */
export const useFigurasTransporte = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['figuras-transporte'],
    queryFn: async () => {
      const cached = getCatalogFromLocalStorage('figuras-transporte', STALE_TIME_LONG);
      if (cached) {
        console.log('📦 Figuras Transporte desde localStorage');
        return cached;
      }

      const data = await CatalogosSATService.obtenerFigurasTransporte();
      saveCatalogToLocalStorage('figuras-transporte', data);
      return data;
    },
    enabled: enabled,
    staleTime: STALE_TIME_LONG,
    gcTime: CACHE_TIME,
  });
};

/**
 * Hook con precarga para tipos de permiso
 */
export const useTiposPermiso = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['tipos-permiso'],
    queryFn: async () => {
      const cached = getCatalogFromLocalStorage('tipos-permiso', STALE_TIME_LONG);
      if (cached) {
        console.log('📦 Tipos Permiso desde localStorage');
        return cached;
      }

      const data = await CatalogosSATService.obtenerTiposPermiso();
      saveCatalogToLocalStorage('tipos-permiso', data);
      return data;
    },
    enabled: enabled,
    staleTime: STALE_TIME_LONG,
    gcTime: CACHE_TIME,
  });
};

/**
 * Hook con precarga para tipos de embalaje
 */
export const useTiposEmbalaje = (enabled: boolean = true) => {
  return useQuery({
    queryKey: ['tipos-embalaje'],
    queryFn: async () => {
      const cached = getCatalogFromLocalStorage('tipos-embalaje', STALE_TIME_LONG);
      if (cached) {
        console.log('📦 Tipos Embalaje desde localStorage');
        return cached;
      }

      const data = await CatalogosSATService.obtenerTiposEmbalaje();
      saveCatalogToLocalStorage('tipos-embalaje', data);
      return data;
    },
    enabled: enabled,
    staleTime: STALE_TIME_LONG,
    gcTime: CACHE_TIME,
  });
};

/**
 * Hook para remolques
 */
export const useRemolques = (termino: string = '', enabled: boolean = true) => {
  return useQuery({
    queryKey: ['remolques', termino],
    queryFn: async () => {
      const cached = getCatalogFromLocalStorage(`remolques-${termino}`, STALE_TIME_LONG);
      if (cached) {
        console.log('📦 Remolques desde localStorage');
        return cached;
      }

      const data = await CatalogosSATService.obtenerSubtiposRemolque(termino);
      if (data && data.length > 0) {
        saveCatalogToLocalStorage(`remolques-${termino}`, data);
      }
      return data;
    },
    enabled: enabled,
    staleTime: STALE_TIME_LONG,
    gcTime: CACHE_TIME,
  });
};

/**
 * Hook para estados
 */
export const useEstados = (termino: string = '', enabled: boolean = true) => {
  return useQuery({
    queryKey: ['estados', termino],
    queryFn: async () => {
      const cached = getCatalogFromLocalStorage(`estados-${termino}`, STALE_TIME_LONG);
      if (cached) {
        console.log('📦 Estados desde localStorage');
        return cached;
      }

      const data = await CatalogosSATService.obtenerEstados(termino);
      if (data && data.length > 0) {
        saveCatalogToLocalStorage(`estados-${termino}`, data);
      }
      return data;
    },
    enabled: enabled,
    staleTime: STALE_TIME_LONG,
    gcTime: CACHE_TIME,
  });
};

/**
 * Hook para precargar catálogos frecuentes al iniciar la app
 */
export const usePrecargaCatalogos = () => {
  const configuraciones = useConfiguracionesVehiculo(true);
  const figuras = useFigurasTransporte(true);
  const permisos = useTiposPermiso(true);
  const embalajes = useTiposEmbalaje(true);

  useEffect(() => {
    if (configuraciones.data && figuras.data && permisos.data && embalajes.data) {
      console.log('✅ Catálogos SAT precargados correctamente');
    }
  }, [configuraciones.data, figuras.data, permisos.data, embalajes.data]);

  return {
    isLoading: configuraciones.isLoading || figuras.isLoading || permisos.isLoading || embalajes.isLoading,
    isError: configuraciones.isError || figuras.isError || permisos.isError || embalajes.isError,
  };
};

/**
 * Función para limpiar caché de catálogos
 */
export const clearCatalogCache = () => {
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('catalog_')) {
      localStorage.removeItem(key);
    }
  });
  console.log('🗑️ Caché de catálogos limpiado');
};
