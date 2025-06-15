
import { useQuery } from '@tanstack/react-query';
import { CatalogosSATService } from '@/services/catalogosSAT';

export function useBuscarProductosServicios(termino: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['productos-servicios', termino],
    queryFn: () => CatalogosSATService.buscarProductosServicios(termino),
    enabled: enabled && termino.length >= 1,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
}

export function useBuscarClaveUnidad(termino: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['claves-unidad', termino],
    queryFn: () => CatalogosSATService.buscarClaveUnidad(termino),
    enabled: enabled && termino.length >= 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useBuscarMaterialesPeligrosos(termino: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['materiales-peligrosos', termino],
    queryFn: () => CatalogosSATService.buscarMaterialesPeligrosos(termino),
    enabled: enabled && termino.length >= 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useConfiguracionesVehiculo(termino?: string) {
  return useQuery({
    queryKey: ['configuraciones-vehiculo'],
    queryFn: () => CatalogosSATService.obtenerConfiguracionesVehiculares(),
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 1 hora
  });
}

export function useFigurasTransporte(termino?: string) {
  return useQuery({
    queryKey: ['figuras-transporte'],
    queryFn: () => CatalogosSATService.obtenerFigurasTransporte(),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

export function useTiposPermiso(termino?: string) {
  return useQuery({
    queryKey: ['tipos-permiso'],
    queryFn: () => CatalogosSATService.obtenerTiposPermiso(),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

export function useTiposEmbalaje(termino?: string) {
  return useQuery({
    queryKey: ['tipos-embalaje'],
    queryFn: () => CatalogosSATService.obtenerTiposEmbalaje(),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

export function useSubtiposRemolque(termino?: string) {
  return useQuery({
    queryKey: ['subtipos-remolque'],
    queryFn: async () => {
      try {
        const { data, error } = await import('@/integrations/supabase/client').then(m => 
          m.supabase
            .from('cat_subtipo_remolque')
            .select('clave_subtipo as clave, descripcion')
            .order('clave_subtipo')
        );
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error obteniendo subtipos de remolque:', error);
        return [];
      }
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

export function useEstados(termino?: string) {
  return useQuery({
    queryKey: ['estados'],
    queryFn: () => CatalogosSATService.obtenerEstados(),
    staleTime: 60 * 60 * 1000, // 1 hora
    gcTime: 2 * 60 * 60 * 1000, // 2 horas
  });
}

export function useCatalogosReal() {
  const clearCache = () => {
    CatalogosSATService.limpiarCache();
  };

  return {
    clearCache,
  };
}
