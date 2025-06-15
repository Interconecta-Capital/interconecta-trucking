
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

  const useEstados = (termino: string = '') => {
    return useQuery({
      queryKey: ['estados', termino],
      queryFn: async () => {
        // Mock implementation - replace with real API call
        const mockEstados = [
          { clave: 'AGU', descripcion: 'Aguascalientes' },
          { clave: 'BCN', descripcion: 'Baja California' },
          { clave: 'BCS', descripcion: 'Baja California Sur' },
          { clave: 'CAM', descripcion: 'Campeche' },
          { clave: 'CHP', descripcion: 'Chiapas' },
        ];
        return termino ? mockEstados.filter(e => 
          e.descripcion.toLowerCase().includes(termino.toLowerCase())
        ) : mockEstados;
      },
      enabled: true,
      staleTime: 30 * 60 * 1000,
    });
  };

  const clearCache = () => {
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
    useEstados,
    clearCache
  };
};

// Export individual hooks for compatibility
export const useBuscarProductosServicios = (termino: string = '', enabled: boolean = true) => {
  return useQuery({
    queryKey: ['productos-servicios', termino],
    queryFn: () => CatalogosSATService.obtenerProductosServicios(termino),
    enabled: enabled && termino.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
};

export const useBuscarClaveUnidad = (termino: string = '', enabled: boolean = true) => {
  return useQuery({
    queryKey: ['unidades', termino],
    queryFn: () => CatalogosSATService.obtenerUnidades(termino),
    enabled: enabled && termino.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
};

export const useBuscarMaterialesPeligrosos = (termino: string = '', enabled: boolean = true) => {
  return useQuery({
    queryKey: ['materiales-peligrosos', termino],
    queryFn: () => CatalogosSATService.obtenerMaterialesPeligrosos(termino),
    enabled: enabled && termino.length >= 2,
    staleTime: 5 * 60 * 1000,
  });
};

export const useConfiguracionesVehiculo = (termino: string = '') => {
  return useQuery({
    queryKey: ['configuraciones-vehiculares', termino],
    queryFn: () => CatalogosSATService.obtenerConfiguracionesVehiculares(),
    staleTime: 30 * 60 * 1000,
  });
};

export const useFigurasTransporte = (termino: string = '') => {
  return useQuery({
    queryKey: ['figuras-transporte', termino],
    queryFn: () => CatalogosSATService.obtenerFigurasTransporte(),
    staleTime: 30 * 60 * 1000,
  });
};

export const useTiposPermiso = (termino: string = '') => {
  return useQuery({
    queryKey: ['tipos-permiso', termino],
    queryFn: () => CatalogosSATService.obtenerTiposPermiso(),
    staleTime: 30 * 60 * 1000,
  });
};

export const useTiposEmbalaje = (termino: string = '') => {
  return useQuery({
    queryKey: ['tipos-embalaje', termino],
    queryFn: () => CatalogosSATService.obtenerTiposEmbalaje(),
    staleTime: 30 * 60 * 1000,
  });
};

export const useSubtiposRemolque = (termino: string = '') => {
  return useQuery({
    queryKey: ['subtipos-remolque', termino],
    queryFn: async () => {
      // Mock implementation
      const mockSubtipos = [
        { clave: 'CTR001', descripcion: 'Remolque carga general' },
        { clave: 'CTR002', descripcion: 'Semirremolque' },
        { clave: 'CTR003', descripcion: 'Dolly' }
      ];
      return termino ? mockSubtipos.filter(s => 
        s.descripcion.toLowerCase().includes(termino.toLowerCase())
      ) : mockSubtipos;
    },
    staleTime: 30 * 60 * 1000,
  });
};
