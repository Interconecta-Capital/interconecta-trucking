
import { useMemo } from 'react';
import { 
  useBuscarProductosServicios,
  useBuscarClaveUnidad,
  useBuscarMaterialesPeligrosos,
  useConfiguracionesVehiculo,
  useFigurasTransporte,
  useTiposPermiso,
  useTiposEmbalaje
} from './useCatalogosReal';
import {
  adaptProductosServicios,
  adaptClaveUnidad,
  adaptMaterialesPeligrosos,
  adaptConfiguracionesVehiculares,
  adaptFigurasTransporte,
  adaptTiposPermiso,
  adaptCatalogItems,
  CatalogItem
} from '@/utils/catalogAdapters';

export const useBuscarProductosServiciosAdaptados = (termino: string, enabled: boolean = true) => {
  const { data: productos = [], isLoading, error } = useBuscarProductosServicios(termino, enabled);
  
  const adaptedData = useMemo(() => {
    return adaptProductosServicios(productos);
  }, [productos]);

  return { data: adaptedData, isLoading, error };
};

export const useBuscarClaveUnidadAdaptados = (termino: string, enabled: boolean = true) => {
  const { data: unidades = [], isLoading, error } = useBuscarClaveUnidad(termino, enabled);
  
  const adaptedData = useMemo(() => {
    return adaptClaveUnidad(unidades);
  }, [unidades]);

  return { data: adaptedData, isLoading, error };
};

export const useBuscarMaterialesPeligrososAdaptados = (termino: string, enabled: boolean = true) => {
  const { data: materiales = [], isLoading, error } = useBuscarMaterialesPeligrosos(termino, enabled);
  
  const adaptedData = useMemo(() => {
    return adaptMaterialesPeligrosos(materiales);
  }, [materiales]);

  return { data: adaptedData, isLoading, error };
};

export const useConfiguracionesVehiculoAdaptados = () => {
  const { data: configuraciones = [], isLoading, error } = useConfiguracionesVehiculo();
  
  const adaptedData = useMemo(() => {
    return adaptConfiguracionesVehiculares(configuraciones);
  }, [configuraciones]);

  return { data: adaptedData, isLoading, error };
};

export const useFigurasTransporteAdaptados = () => {
  const { data: figuras = [], isLoading, error } = useFigurasTransporte();
  
  const adaptedData = useMemo(() => {
    return adaptFigurasTransporte(figuras);
  }, [figuras]);

  return { data: adaptedData, isLoading, error };
};

export const useTiposPermisoAdaptados = () => {
  const { data: tipos = [], isLoading, error } = useTiposPermiso();
  
  const adaptedData = useMemo(() => {
    return adaptTiposPermiso(tipos);
  }, [tipos]);

  return { data: adaptedData, isLoading, error };
};

export const useTiposEmbalajeAdaptados = () => {
  const { data: tipos = [], isLoading, error } = useTiposEmbalaje();
  
  const adaptedData = useMemo(() => {
    return adaptCatalogItems(tipos);
  }, [tipos]);

  return { data: adaptedData, isLoading, error };
};
