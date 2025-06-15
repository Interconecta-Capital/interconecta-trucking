
import { useMemo } from 'react';
import { useCatalogQuery } from './useCatalogQuery';
import * as catalogAdapters from '@/utils/catalogAdapters';

export function useAdaptedCatalogQuery(tipo: string, searchTerm: string, enabled: boolean) {
  const queryResult = useCatalogQuery(tipo, searchTerm, enabled);
  
  const adaptedData = useMemo(() => {
    if (!queryResult.data) return [];
    
    switch (tipo) {
      case 'productos':
        return catalogAdapters.adaptProductosServicios(queryResult.data as any);
      case 'unidades':
        return catalogAdapters.adaptClaveUnidad(queryResult.data as any);
      case 'materiales_peligrosos':
        return catalogAdapters.adaptMaterialesPeligrosos(queryResult.data as any);
      case 'configuraciones_vehiculares':
        return catalogAdapters.adaptConfiguracionesVehiculares(queryResult.data as any);
      case 'figuras_transporte':
        return catalogAdapters.adaptFigurasTransporte(queryResult.data as any);
      case 'tipos_permiso':
        return catalogAdapters.adaptTiposPermiso(queryResult.data as any);
      case 'embalajes':
      case 'remolques':
      case 'estados':
        return catalogAdapters.adaptCatalogItems(queryResult.data as any);
      default:
        return [];
    }
  }, [tipo, queryResult.data]);

  return { ...queryResult, data: adaptedData };
}
