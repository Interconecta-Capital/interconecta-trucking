
import { useQuery } from "@tanstack/react-query";
import { CatalogosSATRealService, CatalogItem, CodigoPostalInfo, ColoniaInfo } from "@/services/catalogosSATReal";

// Hook para buscar productos/servicios
export const useBuscarProductosServicios = (busqueda: string = '', enabled = true) => {
  return useQuery({
    queryKey: ['catalogos-real', 'productos', busqueda],
    queryFn: () => CatalogosSATRealService.buscarProductosServicios(busqueda),
    enabled: enabled,
    staleTime: 5 * 60 * 1000,
    placeholderData: [],
  });
};

// Hook para buscar claves de unidad
export const useBuscarClaveUnidad = (busqueda: string = '', enabled = true) => {
  return useQuery({
    queryKey: ['catalogos-real', 'unidades', busqueda],
    queryFn: () => CatalogosSATRealService.buscarClaveUnidad(busqueda),
    enabled: enabled,
    staleTime: 5 * 60 * 1000,
    placeholderData: [],
  });
};

// Hook para obtener tipos de permiso
export const useTiposPermiso = (busqueda?: string) => {
  return useQuery({
    queryKey: ['catalogos-real', 'permisos', busqueda],
    queryFn: () => CatalogosSATRealService.buscarTiposPermiso(busqueda),
    staleTime: 10 * 60 * 1000,
    placeholderData: [],
  });
};

// Hook para obtener configuraciones de vehículo
export const useConfiguracionesVehiculo = (busqueda?: string) => {
  return useQuery({
    queryKey: ['catalogos-real', 'configuraciones', busqueda],
    queryFn: () => CatalogosSATRealService.buscarConfiguracionesVehiculo(busqueda),
    staleTime: 10 * 60 * 1000,
    placeholderData: [],
  });
};

// Hook para obtener figuras de transporte
export const useFigurasTransporte = (busqueda?: string) => {
  return useQuery({
    queryKey: ['catalogos-real', 'figuras', busqueda],
    queryFn: () => CatalogosSATRealService.buscarFigurasTransporte(busqueda),
    staleTime: 10 * 60 * 1000,
    placeholderData: [],
  });
};

// Hook para obtener subtipos de remolque
export const useSubtiposRemolque = (busqueda?: string) => {
  return useQuery({
    queryKey: ['catalogos-real', 'remolques', busqueda],
    queryFn: () => CatalogosSATRealService.buscarSubtiposRemolque(busqueda),
    staleTime: 10 * 60 * 1000,
    placeholderData: [],
  });
};

// Hook para buscar materiales peligrosos
export const useBuscarMaterialesPeligrosos = (busqueda: string, enabled = true) => {
  return useQuery({
    queryKey: ['catalogos-real', 'materiales', busqueda],
    queryFn: () => CatalogosSATRealService.buscarMaterialesPeligrosos(busqueda),
    enabled: enabled && busqueda.length >= 2,
    staleTime: 5 * 60 * 1000,
    placeholderData: [],
  });
};

// Hook para tipos de embalaje
export const useTiposEmbalaje = (busqueda?: string) => {
  return useQuery({
    queryKey: ['catalogos-real', 'embalajes', busqueda],
    queryFn: () => CatalogosSATRealService.buscarTiposEmbalaje(busqueda),
    staleTime: 10 * 60 * 1000,
    placeholderData: [],
  });
};

// Hook para información de código postal
export const useCodigoPostal = (codigoPostal: string, enabled = true) => {
  return useQuery({
    queryKey: ['catalogos-real', 'codigoPostal', codigoPostal],
    queryFn: () => CatalogosSATRealService.buscarCodigoPostal(codigoPostal),
    enabled: enabled && CatalogosSATRealService.validarFormatoCodigoPostal(codigoPostal),
    staleTime: 30 * 60 * 1000,
    retry: 1,
    retryDelay: 500,
    throwOnError: false,
  });
};

// Hook para colonias por código postal
export const useColoniasPorCP = (codigoPostal: string, enabled = true) => {
  return useQuery({
    queryKey: ['catalogos-real', 'colonias', codigoPostal],
    queryFn: () => CatalogosSATRealService.buscarColoniasPorCP(codigoPostal),
    enabled: enabled && CatalogosSATRealService.validarFormatoCodigoPostal(codigoPostal),
    staleTime: 30 * 60 * 1000,
    retry: 1,
    retryDelay: 500,
    throwOnError: false,
  });
};

// Hook para estados
export const useEstados = (busqueda?: string) => {
  return useQuery({
    queryKey: ['catalogos-real', 'estados', busqueda],
    queryFn: () => CatalogosSATRealService.buscarEstados(busqueda),
    staleTime: 60 * 60 * 1000,
    placeholderData: [],
  });
};

// Hook para validar claves
export const useValidarClave = (catalogo: string, clave: string, enabled = true) => {
  return useQuery({
    queryKey: ['catalogos-real', 'validar', catalogo, clave],
    queryFn: () => CatalogosSATRealService.validarClave(catalogo, clave),
    enabled: enabled && clave.length > 0,
    staleTime: 10 * 60 * 1000,
    throwOnError: false,
  });
};

// Hook principal que agrupa todas las funciones de catálogos reales
export const useCatalogosReal = () => {
  return {
    buscarCodigoPostal: async (codigo: string) => {
      return await CatalogosSATRealService.buscarCodigoPostal(codigo);
    },
    buscarColoniasPorCP: async (codigo: string) => {
      return await CatalogosSATRealService.buscarColoniasPorCP(codigo);
    },
    obtenerUnidades: async (busqueda?: string) => {
      return await CatalogosSATRealService.buscarClaveUnidad(busqueda);
    },
    obtenerProductosServicios: async (busqueda?: string) => {
      return await CatalogosSATRealService.buscarProductosServicios(busqueda);
    },
    obtenerTiposEmbalaje: async (busqueda?: string) => {
      return await CatalogosSATRealService.buscarTiposEmbalaje(busqueda);
    },
    obtenerMaterialesPeligrosos: async (busqueda?: string) => {
      return await CatalogosSATRealService.buscarMaterialesPeligrosos(busqueda || '');
    },
    obtenerFigurasTransporte: async (busqueda?: string) => {
      return await CatalogosSATRealService.buscarFigurasTransporte(busqueda);
    },
    obtenerTiposPermiso: async (busqueda?: string) => {
      return await CatalogosSATRealService.buscarTiposPermiso(busqueda);
    },
    obtenerConfiguracionesVehiculares: async (busqueda?: string) => {
      return await CatalogosSATRealService.buscarConfiguracionesVehiculo(busqueda);
    },
    clearCache: () => {
      CatalogosSATRealService.clearCache();
    }
  };
};
