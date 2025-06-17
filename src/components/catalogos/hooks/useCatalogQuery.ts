
import { useMemo } from 'react';
import { 
  useBuscarProductosServicios,
  useBuscarClaveUnidad,
  useTiposPermiso,
  useConfiguracionesVehiculo,
  useFigurasTransporte,
  useRemolques,
  useBuscarMaterialesPeligrosos,
  useTiposEmbalaje,
  useEstados
} from '@/hooks/useCatalogosReal';

export function useCatalogQuery(tipo: string, searchTerm: string, enabled: boolean) {
  // Para productos y unidades que requieren búsqueda con término
  const productosQuery = useBuscarProductosServicios(searchTerm, tipo === 'productos' && enabled);
  const unidadesQuery = useBuscarClaveUnidad(searchTerm, tipo === 'unidades' && enabled);
  
  // Para materiales peligrosos que requieren mínimo 2 caracteres
  const materialesQuery = useBuscarMaterialesPeligrosos(searchTerm, tipo === 'materiales_peligrosos' && enabled);
  
  // Para catálogos que pueden usar término de búsqueda opcional
  const remolquesQuery = useRemolques(searchTerm, tipo === 'remolques' && enabled);
  const estadosQuery = useEstados(searchTerm, tipo === 'estados' && enabled);
  
  // Para catálogos estáticos que no requieren término de búsqueda
  const permisosQuery = useTiposPermiso(tipo === 'tipos_permiso' && enabled);
  const configuracionesQuery = useConfiguracionesVehiculo(tipo === 'configuraciones_vehiculares' && enabled);
  const figurasQuery = useFigurasTransporte(tipo === 'figuras_transporte' && enabled);
  const embalajesQuery = useTiposEmbalaje(tipo === 'embalajes' && enabled);

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
