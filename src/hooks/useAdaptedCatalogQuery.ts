
import { useMemo } from 'react';
import { useCatalogQuery } from '@/components/catalogos/hooks/useCatalogQuery';

interface CatalogItem {
  value: string;
  label: string;
  descripcion?: string;
  id?: string;
  clave?: string;
}

export function useAdaptedCatalogQuery(tipo: string, searchTerm: string, enabled: boolean = true) {
  // Para catálogos estáticos, siempre habilitar la consulta independientemente del término de búsqueda
  const staticCatalogs = ['embalajes', 'configuraciones_vehiculares', 'figuras_transporte', 'tipos_permiso', 'remolques', 'estados'];
  const isStaticCatalog = staticCatalogs.includes(tipo);
  
  // Lógica mejorada de habilitación
  const queryEnabled = useMemo(() => {
    if (!enabled) return false;
    
    // Para catálogos estáticos, siempre cargar
    if (isStaticCatalog) return true;
    
    // Para productos, siempre habilitar (pueden ser muchos)
    if (tipo === 'productos') return true;
    
    // Para unidades, siempre habilitar
    if (tipo === 'unidades') return true;
    
    // Para materiales peligrosos, requerir al menos 2 caracteres
    if (tipo === 'materiales_peligrosos') {
      return searchTerm.length >= 2;
    }
    
    return true;
  }, [enabled, tipo, searchTerm, isStaticCatalog]);
  
  // Para catálogos estáticos, usar búsqueda vacía para obtener todos los resultados
  const effectiveSearchTerm = isStaticCatalog ? '' : searchTerm;
  
  const queryResult = useCatalogQuery(tipo, effectiveSearchTerm, queryEnabled);
  
  const adaptedData = useMemo(() => {
    if (!queryResult.data || !Array.isArray(queryResult.data)) {
      return [];
    }

    return queryResult.data.map((item: any): CatalogItem => {
      // Mapeo específico por tipo de catálogo
      switch (tipo) {
        case 'productos':
          return {
            value: item.clave || item.clave_prod_serv || '',
            label: `${item.clave || item.clave_prod_serv || ''} - ${item.descripcion || ''}`,
            descripcion: item.descripcion || '',
            clave: item.clave || item.clave_prod_serv || ''
          };
        
        case 'unidades':
          return {
            value: item.clave || item.clave_unidad || '',
            label: `${item.clave || item.clave_unidad || ''} - ${item.nombre || item.descripcion || ''}`,
            descripcion: item.nombre || item.descripcion || '',
            clave: item.clave || item.clave_unidad || ''
          };
        
        case 'materiales_peligrosos':
          return {
            value: item.clave || item.clave_material || '',
            label: `${item.clave || item.clave_material || ''} - ${item.descripcion || ''}`,
            descripcion: item.descripcion || '',
            clave: item.clave || item.clave_material || ''
          };
        
        case 'embalajes':
          return {
            value: item.clave || item.clave_embalaje || '',
            label: `${item.clave || item.clave_embalaje || ''} - ${item.descripcion || ''}`,
            descripcion: item.descripcion || '',
            clave: item.clave || item.clave_embalaje || ''
          };
        
        case 'configuraciones_vehiculares':
          return {
            value: item.clave || item.clave_config || '',
            label: `${item.clave || item.clave_config || ''} - ${item.descripcion || ''}`,
            descripcion: item.descripcion || '',
            clave: item.clave || item.clave_config || ''
          };
        
        case 'figuras_transporte':
          return {
            value: item.clave || item.clave_figura || '',
            label: `${item.clave || item.clave_figura || ''} - ${item.descripcion || ''}`,
            descripcion: item.descripcion || '',
            clave: item.clave || item.clave_figura || ''
          };
        
        case 'tipos_permiso':
          return {
            value: item.clave || item.clave_permiso || '',
            label: `${item.clave || item.clave_permiso || ''} - ${item.descripcion || ''}`,
            descripcion: item.descripcion || '',
            clave: item.clave || item.clave_permiso || ''
          };
        
        case 'remolques':
          return {
            value: item.clave || item.clave_subtipo || '',
            label: `${item.clave || item.clave_subtipo || ''} - ${item.descripcion || ''}`,
            descripcion: item.descripcion || '',
            clave: item.clave || item.clave_subtipo || ''
          };
        
        case 'estados':
          return {
            value: item.clave || item.clave_estado || '',
            label: `${item.clave || item.clave_estado || ''} - ${item.descripcion || ''}`,
            descripcion: item.descripcion || '',
            clave: item.clave || item.clave_estado || ''
          };
        
        default:
          return {
            value: item.clave || item.id || '',
            label: `${item.clave || item.id || ''} - ${item.descripcion || item.nombre || ''}`,
            descripcion: item.descripcion || item.nombre || '',
            clave: item.clave || item.id || ''
          };
      }
    });
  }, [queryResult.data, tipo]);

  return {
    ...queryResult,
    data: adaptedData
  };
}
