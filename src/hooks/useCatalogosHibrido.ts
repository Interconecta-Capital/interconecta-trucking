
import { useQuery } from '@tanstack/react-query';
import { CatalogosSATService } from '@/services/catalogosSAT';
import { getCatalogoEstatico, searchCatalogoEstatico } from '@/data/catalogosSATEstaticos';

interface CatalogoItem {
  value: string;
  label: string;
  descripcion?: string;
  clave?: string;
  simbolo?: string;
  clase_division?: string;
  grupo_embalaje?: string;
}

// Mapeo de tipos para el servicio SAT
const tipoToServiceMap: Record<string, string> = {
  'productos': 'obtenerProductosServicios',
  'unidades': 'obtenerUnidades', 
  'materiales_peligrosos': 'obtenerMaterialesPeligrosos',
  'embalajes': 'obtenerTiposEmbalaje',
  'configuraciones_vehiculares': 'obtenerConfiguracionesVehiculares',
  'figuras_transporte': 'obtenerFigurasTransporte',
  'tipos_permiso': 'obtenerTiposPermiso',
  'remolques': 'obtenerSubtiposRemolque',
  'estados': 'obtenerEstados'
};

const formatSATResponse = (data: any[], tipo: string): CatalogoItem[] => {
  return data.map(item => {
    // Formato estándar para todos los tipos
    let clave = item.clave || item.clave_prod_serv || item.clave_unidad || 
                item.clave_material || item.clave_embalaje || item.clave_config ||
                item.clave_figura || item.clave_permiso || item.clave_subtipo ||
                item.clave_estado || item.value;
    
    let descripcion = item.descripcion || item.nombre || item.label;
    
    return {
      value: clave,
      label: `${clave} - ${descripcion}`,
      descripcion,
      clave,
      simbolo: item.simbolo,
      clase_division: item.clase_division,
      grupo_embalaje: item.grupo_embalaje
    };
  });
};

export const useCatalogosHibrido = (tipo: string, searchTerm: string = '', enabled: boolean = true) => {
  return useQuery({
    queryKey: ['catalogos-hibrido', tipo, searchTerm],
    queryFn: async (): Promise<CatalogoItem[]> => {
      try {
        console.log(`🔍 Consultando catálogo híbrido: ${tipo}, término: "${searchTerm}"`);
        
        // 1. Intentar obtener datos dinámicos del servicio SAT
        let dynamicData: any[] = [];
        const serviceMethod = tipoToServiceMap[tipo];
        
        if (serviceMethod && (CatalogosSATService as any)[serviceMethod]) {
          try {
            dynamicData = await (CatalogosSATService as any)[serviceMethod](searchTerm);
            console.log(`✅ Datos dinámicos obtenidos: ${dynamicData.length} registros`);
          } catch (error) {
            console.warn(`⚠️ Error en servicio dinámico para ${tipo}:`, error);
          }
        }
        
        // 2. Si hay datos dinámicos suficientes, usarlos
        if (dynamicData.length >= 10) {
          return formatSATResponse(dynamicData, tipo);
        }
        
        // 3. Fallback a datos estáticos
        console.log(`📚 Usando datos estáticos para ${tipo}`);
        const staticData = searchTerm 
          ? searchCatalogoEstatico(tipo, searchTerm)
          : getCatalogoEstatico(tipo);
        
        // 4. Combinar datos dinámicos (si los hay) con estáticos
        const combinedData = [
          ...formatSATResponse(dynamicData, tipo),
          ...staticData.filter(staticItem => 
            !dynamicData.some(dynamicItem => 
              (dynamicItem.clave || dynamicItem.value) === staticItem.clave
            )
          )
        ];
        
        console.log(`✅ Datos combinados: ${combinedData.length} registros`);
        return combinedData;
        
      } catch (error) {
        console.error(`❌ Error en catálogo híbrido ${tipo}:`, error);
        
        // Fallback final a datos estáticos
        const fallbackData = searchTerm 
          ? searchCatalogoEstatico(tipo, searchTerm)
          : getCatalogoEstatico(tipo);
        
        console.log(`🔄 Fallback final: ${fallbackData.length} registros estáticos`);
        return fallbackData;
      }
    },
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    retry: 1,
    refetchOnWindowFocus: false
  });
};
