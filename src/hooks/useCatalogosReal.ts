
import { useQuery } from '@tanstack/react-query';
import { CatalogosSATService } from '@/services/catalogosSAT';

export const useCatalogosReal = () => {
  const useProductosServicios = (termino: string = '') => {
    return useQuery({
      queryKey: ['productos-servicios', termino],
      queryFn: () => CatalogosSATService.obtenerProductosServicios(termino),
      enabled: termino.length >= 2,
      staleTime: 5 * 60 * 1000,
    });
  };

  const useUnidades = (termino: string = '') => {
    return useQuery({
      queryKey: ['unidades', termino],
      queryFn: () => CatalogosSATService.obtenerUnidades(termino),
      enabled: termino.length >= 2,
      staleTime: 5 * 60 * 1000,
    });
  };

  const useMaterialesPeligrosos = (termino: string = '') => {
    return useQuery({
      queryKey: ['materiales-peligrosos', termino],
      queryFn: () => CatalogosSATService.obtenerMaterialesPeligrosos(termino),
      enabled: termino.length >= 2,
      staleTime: 5 * 60 * 1000,
    });
  };

  const useConfiguracionesVehiculares = () => {
    return useQuery({
      queryKey: ['configuraciones-vehiculares'],
      queryFn: () => CatalogosSATService.obtenerConfiguracionesVehiculares(),
      staleTime: 30 * 60 * 1000,
    });
  };

  const useFigurasTransporte = () => {
    return useQuery({
      queryKey: ['figuras-transporte'],
      queryFn: () => CatalogosSATService.obtenerFigurasTransporte(),
      staleTime: 30 * 60 * 1000,
    });
  };

  const useTiposPermiso = () => {
    return useQuery({
      queryKey: ['tipos-permiso'],
      queryFn: () => CatalogosSATService.obtenerTiposPermiso(),
      staleTime: 30 * 60 * 1000,
    });
  };

  const useTiposEmbalaje = () => {
    return useQuery({
      queryKey: ['tipos-embalaje'],
      queryFn: () => CatalogosSATService.obtenerTiposEmbalaje(),
      staleTime: 30 * 60 * 1000,
    });
  };

  const limpiarCache = () => {
    CatalogosSATService.clearCache();
  };

  return {
    useProductosServicios,
    useUnidades,
    useMaterialesPeligrosos,
    useConfiguracionesVehiculares,
    useFigurasTransporte,
    useTiposPermiso,
    useTiposEmbalaje,
    limpiarCache
  };
};
