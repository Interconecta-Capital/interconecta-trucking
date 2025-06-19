
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CatalogosSATService } from '@/services/catalogosSAT';
import { getCatalogoEstatico } from '@/data/catalogosSATEstaticos';

interface CatalogItem {
  value: string;
  label: string;
  descripcion?: string;
  clave?: string;
}

export function useCatalogosHibrido(tipo: string, searchTerm: string = '', enabled: boolean = true) {
  // Obtener datos estáticos como respaldo
  const datosEstaticos = useMemo(() => getCatalogoEstatico(tipo), [tipo]);

  // Query para datos dinámicos de la base de datos
  const { data: datosDinamicos, isLoading, error } = useQuery({
    queryKey: ['catalogo-hibrido', tipo, searchTerm],
    queryFn: async () => {
      try {
        switch (tipo) {
          case 'productos':
            return await CatalogosSATService.obtenerProductosServicios(searchTerm);
          case 'unidades':
            return await CatalogosSATService.obtenerUnidades(searchTerm);
          case 'embalajes':
            return await CatalogosSATService.obtenerTiposEmbalaje();
          case 'materiales_peligrosos':
            return searchTerm.length >= 2 ? await CatalogosSATService.obtenerMaterialesPeligrosos(searchTerm) : [];
          case 'configuraciones_vehiculares':
            return await CatalogosSATService.obtenerConfiguracionesVehiculares();
          case 'figuras_transporte':
            return await CatalogosSATService.obtenerFigurasTransporte();
          case 'tipos_permiso':
            return await CatalogosSATService.obtenerTiposPermiso();
          case 'remolques':
            return await CatalogosSATService.obtenerSubtiposRemolque(searchTerm);
          case 'estados':
            return await CatalogosSATService.obtenerEstados(searchTerm);
          case 'regimenes_aduaneros':
            return await CatalogosSATService.obtenerRegimenesAduaneros();
          default:
            return [];
        }
      } catch (error) {
        console.warn(`Error cargando catálogo ${tipo}:`, error);
        return [];
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1
  });

  // Combinar datos dinámicos con estáticos
  const data = useMemo(() => {
    let resultado: CatalogItem[] = [];

    // Si tenemos datos dinámicos, usarlos
    if (datosDinamicos && Array.isArray(datosDinamicos) && datosDinamicos.length > 0) {
      resultado = datosDinamicos.map((item: any) => {
        const clave = item.clave || item.clave_prod_serv || item.clave_unidad || 
                     item.clave_embalaje || item.clave_material || item.clave_config || 
                     item.clave_figura || item.clave_permiso || item.clave_subtipo || 
                     item.clave_estado || '';
        
        const descripcion = item.descripcion || item.nombre || '';
        
        return {
          value: clave,
          label: `${clave} - ${descripcion}`,
          descripcion,
          clave
        };
      });
    }

    // Si no hay datos dinámicos o hay error, usar datos estáticos
    if (resultado.length === 0 && datosEstaticos.length > 0) {
      resultado = datosEstaticos;
    }

    // Aplicar filtro de búsqueda si existe
    if (searchTerm && searchTerm.length > 0) {
      const termino = searchTerm.toLowerCase();
      resultado = resultado.filter(item => 
        item.value.toLowerCase().includes(termino) ||
        item.label.toLowerCase().includes(termino) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(termino))
      );
    }

    return resultado;
  }, [datosDinamicos, datosEstaticos, searchTerm]);

  return {
    data,
    isLoading,
    error,
    refetch: () => {
      // No implementamos refetch para mantener simplicidad
    }
  };
}
