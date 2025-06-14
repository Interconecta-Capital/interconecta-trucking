
import { useQuery } from '@tanstack/react-query';
import { CatalogosSATRealService } from '@/services/catalogosSATReal';

// Cache global para optimizar rendimiento
const queryCache = new Map();

export function useBuscarProductosServicios(busqueda: string = '', enabled: boolean = true) {
  return useQuery({
    queryKey: ['productos-servicios', busqueda],
    queryFn: () => CatalogosSATRealService.buscarProductosServicios(busqueda),
    enabled: enabled && busqueda.length >= 0,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });
}

export function useBuscarClaveUnidad(busqueda: string = '', enabled: boolean = true) {
  return useQuery({
    queryKey: ['claves-unidad', busqueda],
    queryFn: () => CatalogosSATRealService.buscarClaveUnidad(busqueda),
    enabled: enabled && busqueda.length >= 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useTiposPermiso(busqueda?: string) {
  return useQuery({
    queryKey: ['tipos-permiso', busqueda],
    queryFn: () => CatalogosSATRealService.buscarTiposPermiso(busqueda),
    staleTime: 10 * 60 * 1000, // Los permisos cambian poco
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useConfiguracionesVehiculo(busqueda?: string) {
  return useQuery({
    queryKey: ['configuraciones-vehiculo', busqueda],
    queryFn: () => CatalogosSATRealService.buscarConfiguracionesVehiculo(busqueda),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useFigurasTransporte(busqueda?: string) {
  return useQuery({
    queryKey: ['figuras-transporte', busqueda],
    queryFn: () => CatalogosSATRealService.buscarFigurasTransporte(busqueda),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useSubtiposRemolque(busqueda?: string) {
  return useQuery({
    queryKey: ['subtipos-remolque', busqueda],
    queryFn: () => CatalogosSATRealService.buscarSubtiposRemolque(busqueda),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useBuscarMaterialesPeligrosos(busqueda: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['materiales-peligrosos', busqueda],
    queryFn: () => CatalogosSATRealService.buscarMaterialesPeligrosos(busqueda),
    enabled: enabled && busqueda.length >= 2,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useTiposEmbalaje(busqueda?: string) {
  return useQuery({
    queryKey: ['tipos-embalaje', busqueda],
    queryFn: () => CatalogosSATRealService.buscarTiposEmbalaje(busqueda),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useEstados(busqueda?: string) {
  return useQuery({
    queryKey: ['estados', busqueda],
    queryFn: () => CatalogosSATRealService.buscarEstados(busqueda),
    staleTime: 30 * 60 * 1000, // Los estados cambian muy poco
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// Hook para limpiar cache
export function useCatalogosReal() {
  const clearCache = () => {
    queryCache.clear();
  };

  return {
    clearCache
  };
}

// Exportar hooks de compatibilidad
export const useCatalogos = useCatalogosReal;
export const useBuscarTipoPermiso = useTiposPermiso;
export const useBuscarConfigVehicular = useConfiguracionesVehiculo;
