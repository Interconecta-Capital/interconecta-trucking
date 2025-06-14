
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CatalogosSATReal } from '@/services/catalogosSATReal';

export const useCatalogosReal = () => {
  const clearCache = () => {
    console.log('Cache cleared');
  };

  return {
    clearCache,
    obtenerUnidades: async () => CatalogosSATReal.obtenerUnidades(),
    obtenerProductosServicios: async () => CatalogosSATReal.obtenerProductosServicios(),
    obtenerTiposEmbalaje: async () => CatalogosSATReal.obtenerTiposEmbalaje(),
    obtenerMaterialesPeligrosos: async () => CatalogosSATReal.obtenerMaterialesPeligrosos(),
    obtenerFigurasTransporte: async () => CatalogosSATReal.obtenerFigurasTransporte(),
    obtenerTiposPermiso: async () => CatalogosSATReal.obtenerTiposPermiso(),
    obtenerConfiguracionesVehiculares: async () => CatalogosSATReal.obtenerConfiguracionesVehiculares(),
  };
};

export const useBuscarProductosServicios = (searchTerm: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['productos-servicios', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      return CatalogosSATReal.obtenerProductosServicios();
    },
    enabled: enabled && searchTerm.length > 0,
  });
};

export const useBuscarClaveUnidad = (searchTerm: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['claves-unidad', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      return CatalogosSATReal.obtenerUnidades();
    },
    enabled: enabled && searchTerm.length > 0,
  });
};

export const useTiposPermiso = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['tipos-permiso', searchTerm],
    queryFn: () => CatalogosSATReal.obtenerTiposPermiso(),
  });
};

export const useConfiguracionesVehiculo = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['configuraciones-vehiculo', searchTerm],
    queryFn: () => CatalogosSATReal.obtenerConfiguracionesVehiculares(),
  });
};

export const useFigurasTransporte = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['figuras-transporte', searchTerm],
    queryFn: () => CatalogosSATReal.obtenerFigurasTransporte(),
  });
};

export const useSubtiposRemolque = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['subtipos-remolque', searchTerm],
    queryFn: async () => {
      return [];
    },
  });
};

export const useBuscarMaterialesPeligrosos = (searchTerm: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['materiales-peligrosos', searchTerm],
    queryFn: () => CatalogosSATReal.obtenerMaterialesPeligrosos(),
    enabled: enabled && searchTerm.length >= 2,
  });
};

export const useTiposEmbalaje = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['tipos-embalaje', searchTerm],
    queryFn: () => CatalogosSATReal.obtenerTiposEmbalaje(),
  });
};

export const useEstados = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['estados', searchTerm],
    queryFn: async () => {
      return [];
    },
  });
};

export const useCodigoPostal = () => {
  return {
    loading: false,
    error: null,
    buscarCodigo: async (codigo: string) => {
      return null;
    }
  };
};

export const useColoniasPorCP = () => {
  return {
    loading: false,
    colonias: [],
    buscarColonias: async (cp: string) => {
      return [];
    }
  };
};
