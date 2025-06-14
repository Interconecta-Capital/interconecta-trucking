
import { useMemo } from 'react';
import { 
  useBuscarProductosServicios,
  useBuscarClaveUnidad,
  useTiposPermiso,
  useConfiguracionesVehiculo,
  useFigurasTransporte,
  useSubtiposRemolque,
  useBuscarMaterialesPeligrosos,
  useTiposEmbalaje,
  useEstados
} from '@/hooks/useCatalogosReal';

export function useCatalogQuery(tipo: string, searchTerm: string, enabled: boolean) {
  const productosQuery = useBuscarProductosServicios(searchTerm, tipo === 'productos' && enabled);
  const unidadesQuery = useBuscarClaveUnidad(searchTerm, tipo === 'unidades' && enabled);
  const permisosQuery = useTiposPermiso(searchTerm);
  const configuracionesQuery = useConfiguracionesVehiculo(searchTerm);
  const figurasQuery = useFigurasTransporte(searchTerm);
  const remolquesQuery = useSubtiposRemolque(searchTerm);
  const materialesQuery = useBuscarMaterialesPeligrosos(searchTerm, tipo === 'materiales_peligrosos' && enabled);
  const embalajesQuery = useTiposEmbalaje(searchTerm);
  const estadosQuery = useEstados(searchTerm);

  return useMemo(() => {
    switch (tipo) {
      case 'productos': return productosQuery;
      case 'unidades': return unidadesQuery;
      case 'tipos_permiso': return permisosQuery;
      case 'configuraciones_vehiculares': return configuracionesQuery;
      case 'figuras_transporte': return figurasQuery;
      case 'remolques': return remolquesQuery;
      case 'materiales_peligrosos': return materialesQuery;
      case 'embalajes': return embalajesQuery;
      case 'estados': return estadosQuery;
      default: return { data: [], isLoading: false, error: null, refetch: () => {} };
    }
  }, [tipo, productosQuery, unidadesQuery, permisosQuery, configuracionesQuery, figurasQuery, remolquesQuery, materialesQuery, embalajesQuery, estadosQuery]);
}
