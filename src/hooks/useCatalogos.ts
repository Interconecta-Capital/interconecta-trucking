
import { useQuery } from "@tanstack/react-query";
import { CatalogosSATService, CatalogItem, CodigoPostalInfo, ColoniaInfo } from "@/services/catalogosSAT";

// Hook para buscar productos/servicios
export const useBuscarProductosServicios = (busqueda: string, enabled = true) => {
  return useQuery({
    queryKey: ['catalogos', 'productos', busqueda],
    queryFn: () => CatalogosSATService.buscarProductosServicios(busqueda),
    enabled: enabled && busqueda.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para buscar claves de unidad
export const useBuscarClaveUnidad = (busqueda: string, enabled = true) => {
  return useQuery({
    queryKey: ['catalogos', 'unidades', busqueda],
    queryFn: () => CatalogosSATService.buscarClaveUnidad(busqueda),
    enabled: enabled && busqueda.length >= 1,
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

// Hook para información de código postal
export const useCodigoPostal = (codigoPostal: string, enabled = true) => {
  return useQuery({
    queryKey: ['catalogos', 'codigoPostal', codigoPostal],
    queryFn: () => CatalogosSATService.buscarCodigoPostal(codigoPostal),
    enabled: enabled && codigoPostal.length === 5,
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
};

// Hook para colonias por código postal
export const useColoniasPorCP = (codigoPostal: string, enabled = true) => {
  return useQuery({
    queryKey: ['catalogos', 'colonias', codigoPostal],
    queryFn: () => CatalogosSATService.buscarColoniasPorCP(codigoPostal),
    enabled: enabled && codigoPostal.length === 5,
    staleTime: 30 * 60 * 1000,
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
  });
};
