
import { useQuery } from "@tanstack/react-query";
import { CatalogosSATService, CatalogItem, CodigoPostalInfo, ColoniaInfo } from "@/services/catalogosSAT";

// Hook para buscar productos/servicios con opciones iniciales
export const useBuscarProductosServicios = (busqueda: string, enabled = true) => {
  return useQuery({
    queryKey: ['catalogos', 'productos', busqueda],
    queryFn: async () => {
      if (busqueda.length === 0) {
        // Cargar productos más comunes inicialmente
        return CatalogosSATService.buscarProductosServicios('transporte');
      }
      return CatalogosSATService.buscarProductosServicios(busqueda);
    },
    enabled: enabled && (busqueda.length >= 2 || busqueda.length === 0),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar claves de unidad con opciones iniciales
export const useBuscarClaveUnidad = (busqueda: string, enabled = true) => {
  return useQuery({
    queryKey: ['catalogos', 'unidades', busqueda],
    queryFn: async () => {
      if (busqueda.length === 0) {
        // Cargar unidades más comunes inicialmente
        return CatalogosSATService.buscarClaveUnidad('');
      }
      return CatalogosSATService.buscarClaveUnidad(busqueda);
    },
    enabled: enabled && (busqueda.length >= 1 || busqueda.length === 0),
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para obtener tipos de permiso
export const useTiposPermiso = (busqueda?: string) => {
  return useQuery({
    queryKey: ['catalogos', 'permisos', busqueda],
    queryFn: () => CatalogosSATService.buscarTiposPermiso(busqueda),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para obtener configuraciones de vehículo
export const useConfiguracionesVehiculo = (busqueda?: string) => {
  return useQuery({
    queryKey: ['catalogos', 'configuraciones', busqueda],
    queryFn: () => CatalogosSATService.buscarConfiguracionesVehiculo(busqueda),
    staleTime: 10 * 60 * 1000,
  });
};

// Hook para obtener figuras de transporte
export const useFigurasTransporte = (busqueda?: string) => {
  return useQuery({
    queryKey: ['catalogos', 'figuras', busqueda],
    queryFn: () => CatalogosSATService.buscarFigurasTransporte(busqueda),
    staleTime: 10 * 60 * 1000,
  });
};

// Hook para obtener subtipos de remolque
export const useSubtiposRemolque = (busqueda?: string) => {
  return useQuery({
    queryKey: ['catalogos', 'remolques', busqueda],
    queryFn: () => CatalogosSATService.buscarSubtiposRemolque(busqueda),
    staleTime: 10 * 60 * 1000,
  });
};

// Hook para buscar materiales peligrosos
export const useBuscarMaterialesPeligrosos = (busqueda: string, enabled = true) => {
  return useQuery({
    queryKey: ['catalogos', 'materiales', busqueda],
    queryFn: () => CatalogosSATService.buscarMaterialesPeligrosos(busqueda),
    enabled: enabled && busqueda.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para información de código postal con validación mejorada y mejor manejo de errores
export const useCodigoPostal = (codigoPostal: string, enabled = true) => {
  return useQuery({
    queryKey: ['catalogos', 'codigoPostal', codigoPostal],
    queryFn: async () => {
      console.log('Buscando código postal:', codigoPostal);
      const result = await CatalogosSATService.buscarCodigoPostal(codigoPostal);
      console.log('Resultado código postal:', result);
      return result;
    },
    enabled: enabled && CatalogosSATService.validarFormatoCodigoPostal(codigoPostal),
    staleTime: 30 * 60 * 1000, // 30 minutos
    retry: 1, // Reducir reintentos para evitar spam de logs
    retryDelay: 500,
    // No considerar como error cuando no se encuentra el CP
    throwOnError: false,
  });
};

// Hook para colonias por código postal con mejor manejo de errores
export const useColoniasPorCP = (codigoPostal: string, enabled = true) => {
  return useQuery({
    queryKey: ['catalogos', 'colonias', codigoPostal],
    queryFn: () => CatalogosSATService.buscarColoniasPorCP(codigoPostal),
    enabled: enabled && CatalogosSATService.validarFormatoCodigoPostal(codigoPostal),
    staleTime: 30 * 60 * 1000,
    retry: 1,
    retryDelay: 500,
    throwOnError: false,
  });
};

// Hook para estados
export const useEstados = (busqueda?: string) => {
  return useQuery({
    queryKey: ['catalogos', 'estados', busqueda],
    queryFn: () => CatalogosSATService.buscarEstados(busqueda),
    staleTime: 60 * 60 * 1000, // 1 hora
  });
};

// Hook para validar claves
export const useValidarClave = (catalogo: string, clave: string, enabled = true) => {
  return useQuery({
    queryKey: ['catalogos', 'validar', catalogo, clave],
    queryFn: () => CatalogosSATService.validarClave(catalogo, clave),
    enabled: enabled && clave.length > 0,
    staleTime: 10 * 60 * 1000,
    throwOnError: false,
  });
};
