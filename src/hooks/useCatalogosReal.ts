
import { useQuery } from '@tanstack/react-query';
import { CatalogosSATService } from '@/services/catalogosSAT';

const STALE_TIME_SHORT = 5 * 60 * 1000; // 5 minutes
const STALE_TIME_LONG = 30 * 60 * 1000; // 30 minutes

export const useBuscarProductosServicios = (termino: string = '', enabled: boolean = true) => {
  return useQuery({
    queryKey: ['productos-servicios', termino],
    queryFn: () => CatalogosSATService.obtenerProductosServicios(termino),
    enabled: enabled && termino.length >= 2,
    staleTime: STALE_TIME_SHORT,
  });
};

export const useBuscarClaveUnidad = (termino: string = '', enabled: boolean = true) => {
  return useQuery({
    queryKey: ['unidades', termino],
    queryFn: () => CatalogosSATService.obtenerUnidades(termino),
    enabled: enabled && termino.length >= 2,
    staleTime: STALE_TIME_SHORT,
  });
};

export const useBuscarMaterialesPeligrosos = (termino: string = '', enabled: boolean = true) => {
  return useQuery({
    queryKey: ['materiales-peligrosos', termino],
    queryFn: () => CatalogosSATService.obtenerMaterialesPeligrosos(termino),
    enabled: enabled && termino.length >= 2,
    staleTime: STALE_TIME_SHORT,
  });
};

export const useConfiguracionesVehiculo = () => {
  return useQuery({
    queryKey: ['configuraciones-vehiculares'],
    queryFn: CatalogosSATService.obtenerConfiguracionesVehiculares,
    staleTime: STALE_TIME_LONG,
  });
};

export const useFigurasTransporte = () => {
  return useQuery({
    queryKey: ['figuras-transporte'],
    queryFn: CatalogosSATService.obtenerFigurasTransporte,
    staleTime: STALE_TIME_LONG,
  });
};

export const useTiposPermiso = () => {
  return useQuery({
    queryKey: ['tipos-permiso'],
    queryFn: CatalogosSATService.obtenerTiposPermiso,
    staleTime: STALE_TIME_LONG,
  });
};

export const useTiposEmbalaje = () => {
  return useQuery({
    queryKey: ['tipos-embalaje'],
    queryFn: CatalogosSATService.obtenerTiposEmbalaje,
    staleTime: STALE_TIME_LONG,
  });
};

export const useRemolques = (termino: string = '') => {
  return useQuery({
    queryKey: ['remolques', termino],
    queryFn: () => CatalogosSATService.obtenerSubtiposRemolque(termino),
    staleTime: STALE_TIME_LONG,
  });
};

export const useEstados = (termino: string = '') => {
  return useQuery({
    queryKey: ['estados', termino],
    queryFn: () => CatalogosSATService.obtenerEstados(termino),
    enabled: true,
    staleTime: STALE_TIME_LONG,
  });
};
