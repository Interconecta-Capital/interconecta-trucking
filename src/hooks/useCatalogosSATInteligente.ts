
import { useState, useCallback, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCatalogosHibrido } from './useCatalogosHibrido';
import { CatalogosSATService } from '@/services/catalogosSAT';
import { useDebounce } from './useDebounce';

interface CatalogoItem {
  value: string;
  label: string;
  descripcion?: string;
  clave?: string;
  confidence?: number;
  source: 'sat_oficial' | 'ia_sugerencia' | 'cache_local';
  metadata?: {
    simbolo?: string;
    categoria?: string;
    vigencia?: {
      inicio?: string;
      fin?: string;
    };
    [key: string]: any;
  };
}

interface SugerenciaIA {
  codigo: string;
  descripcion: string;
  confidence: number;
  contexto: string;
  razonamiento: string;
}

interface CatalogoConfig {
  tipo: string;
  enableIA?: boolean;
  minSearchLength?: number;
  cacheTime?: number;
  maxSuggestions?: number;
  prioritizeSAT?: boolean;
}

export function useCatalogosSATInteligente(config: CatalogoConfig) {
  const [searchTerm, setSearchTerm] = useState('');
  const [contextualData, setContextualData] = useState<Record<string, any>>({});
  const [sugerenciasIA, setSugerenciasIA] = useState<SugerenciaIA[]>([]);
  const [loadingIA, setLoadingIA] = useState(false);
  
  const debouncedSearch = useDebounce(searchTerm, 300);
  
  // Consulta híbrida existente como base
  const { 
    data: catalogoBase = [], 
    isLoading: loadingBase, 
    error: errorBase,
    refetch 
  } = useCatalogosHibrido(
    config.tipo, 
    debouncedSearch, 
    debouncedSearch.length >= (config.minSearchLength || 2)
  );

  // Generar sugerencias de IA basadas en contexto
  const generarSugerenciasIA = useCallback(async (termino: string, contexto: Record<string, any>) => {
    if (!config.enableIA || termino.length < 3) return [];
    
    setLoadingIA(true);
    try {
      console.log(`🤖 Generando sugerencias IA para: "${termino}" en contexto:`, contexto);
      
      // Analizar contexto para sugerencias inteligentes
      const sugerencias: SugerenciaIA[] = [];
      
      // Productos y servicios inteligentes
      if (config.tipo === 'productos') {
        if (termino.toLowerCase().includes('aguacate')) {
          sugerencias.push({
            codigo: '01012902',
            descripcion: 'Aguacates frescos',
            confidence: 0.95,
            contexto: 'Producto agrícola detectado',
            razonamiento: 'Código SAT específico para aguacates'
          });
        }
        
        if (termino.toLowerCase().includes('cemento')) {
          sugerencias.push({
            codigo: '23011001',
            descripcion: 'Cemento Portland',
            confidence: 0.90,
            contexto: 'Material de construcción',
            razonamiento: 'Cemento es producto industrial común'
          });
        }

        if (termino.toLowerCase().includes('transporte') || termino.toLowerCase().includes('flete')) {
          sugerencias.push({
            codigo: '78101800',
            descripcion: 'Servicios de transporte de carga por carretera',
            confidence: 0.92,
            contexto: 'Servicio de transporte',
            razonamiento: 'Código estándar para servicios de transporte'
          });
        }
      }
      
      // Unidades contextualmente inteligentes
      if (config.tipo === 'unidades') {
        const mercancia = contexto.descripcionMercancia?.toLowerCase() || '';
        
        if (mercancia.includes('ton') || mercancia.includes('tonelada') || termino.includes('ton')) {
          sugerencias.push({
            codigo: 'TNE',
            descripcion: 'Tonelada métrica',
            confidence: 0.98,
            contexto: 'Peso detectado en descripción',
            razonamiento: 'Unidad estándar para cargas pesadas'
          });
        }
        
        if (mercancia.includes('litro') || mercancia.includes('líquido') || termino.includes('litro')) {
          sugerencias.push({
            codigo: 'LTR',
            descripcion: 'Litro',
            confidence: 0.95,
            contexto: 'Líquido detectado',
            razonamiento: 'Unidad estándar para líquidos'
          });
        }

        if (mercancia.includes('pieza') || mercancia.includes('unidad') || termino.includes('pieza')) {
          sugerencias.push({
            codigo: 'H87',
            descripcion: 'Pieza',
            confidence: 0.93,
            contexto: 'Conteo por unidades',
            razonamiento: 'Unidad común para artículos individuales'
          });
        }
      }

      console.log(`✅ Sugerencias IA generadas: ${sugerencias.length}`);
      return sugerencias;
      
    } catch (error) {
      console.error('❌ Error generando sugerencias IA:', error);
      return [];
    } finally {
      setLoadingIA(false);
    }
  }, [config.tipo, config.enableIA]);

  // Combinar datos SAT oficiales con sugerencias IA
  const datosCombinados = useMemo((): CatalogoItem[] => {
    const items: CatalogoItem[] = [];
    
    // 1. Agregar datos SAT oficiales (máxima prioridad)
    catalogoBase.forEach(item => {
      items.push({
        value: item.value,
        label: item.label,
        descripcion: item.descripcion,
        clave: item.clave,
        confidence: 1.0,
        source: 'sat_oficial',
        metadata: {
          simbolo: item.simbolo,
          categoria: 'oficial_sat'
        }
      });
    });

    // 2. Agregar sugerencias IA si están habilitadas y no duplican SAT
    if (config.enableIA && sugerenciasIA.length > 0) {
      sugerenciasIA.forEach(sugerencia => {
        const existeEnSAT = items.some(item => 
          item.clave === sugerencia.codigo || 
          item.value === sugerencia.codigo
        );
        
        if (!existeEnSAT) {
          items.push({
            value: sugerencia.codigo,
            label: `${sugerencia.codigo} - ${sugerencia.descripcion}`,
            descripcion: sugerencia.descripcion,
            clave: sugerencia.codigo,
            confidence: sugerencia.confidence,
            source: 'ia_sugerencia',
            metadata: {
              contexto: sugerencia.contexto,
              razonamiento: sugerencia.razonamiento,
              categoria: 'sugerencia_ia'
            }
          });
        }
      });
    }

    // 3. Ordenar por relevancia: SAT oficial > IA alta confianza > resto
    return items.sort((a, b) => {
      if (a.source === 'sat_oficial' && b.source !== 'sat_oficial') return -1;
      if (b.source === 'sat_oficial' && a.source !== 'sat_oficial') return 1;
      return (b.confidence || 0) - (a.confidence || 0);
    });
  }, [catalogoBase, sugerenciasIA, config.enableIA]);

  // Actualizar contexto y regenerar sugerencias IA cuando cambie
  const actualizarContexto = useCallback((nuevoContexto: Record<string, any>) => {
    setContextualData(prev => ({ ...prev, ...nuevoContexto }));
    
    if (config.enableIA && debouncedSearch) {
      generarSugerenciasIA(debouncedSearch, { ...contextualData, ...nuevoContexto })
        .then(setSugerenciasIA);
    }
  }, [config.enableIA, debouncedSearch, contextualData, generarSugerenciasIA]);

  // Buscar con IA cuando cambie el término
  useEffect(() => {
    if (config.enableIA && debouncedSearch && debouncedSearch.length >= 3) {
      generarSugerenciasIA(debouncedSearch, contextualData)
        .then(setSugerenciasIA);
    } else {
      setSugerenciasIA([]);
    }
  }, [debouncedSearch, contextualData, config.enableIA, generarSugerenciasIA]);

  // Validar código contra SAT oficial
  const validarCodigoSAT = useCallback(async (codigo: string): Promise<{
    valido: boolean;
    item?: CatalogoItem;
    mensaje?: string;
  }> => {
    try {
      // Buscar en catálogo SAT por código exacto
      let datosValidacion: any[] = [];
      
      switch (config.tipo) {
        case 'productos':
          datosValidacion = await CatalogosSATService.obtenerProductosServicios(codigo);
          break;
        case 'unidades':
          datosValidacion = await CatalogosSATService.obtenerUnidades(codigo);
          break;
        case 'embalajes':
          datosValidacion = await CatalogosSATService.obtenerTiposEmbalaje();
          break;
        default:
          return { valido: false, mensaje: 'Tipo de catálogo no soportado' };
      }

      const encontrado = datosValidacion.find(item => 
        item.clave === codigo || 
        item.clave_prod_serv === codigo ||
        item.clave_unidad === codigo ||
        item.clave_embalaje === codigo
      );

      if (encontrado) {
        return {
          valido: true,
          item: {
            value: codigo,
            label: `${codigo} - ${encontrado.descripcion || encontrado.nombre}`,
            descripcion: encontrado.descripcion || encontrado.nombre,
            clave: codigo,
            confidence: 1.0,
            source: 'sat_oficial',
            metadata: {
              vigencia: {
                inicio: encontrado.fecha_inicio_vigencia,
                fin: encontrado.fecha_fin_vigencia
              }
            }
          }
        };
      }

      return { valido: false, mensaje: 'Código no encontrado en catálogos SAT' };
      
    } catch (error) {
      console.error('Error validando código SAT:', error);
      return { valido: false, mensaje: 'Error de validación' };
    }
  }, [config.tipo]);

  // Obtener sugerencias basadas en descripción completa
  const obtenerSugerenciasPorDescripcion = useCallback(async (descripcion: string): Promise<CatalogoItem[]> => {
    if (!descripcion || descripcion.length < 10) return [];
    
    try {
      console.log(`🔍 Analizando descripción completa: "${descripcion}"`);
      
      // Extraer palabras clave de la descripción
      const palabrasClave = descripcion.toLowerCase()
        .split(/[\s,.-]+/)
        .filter(palabra => palabra.length > 3)
        .slice(0, 5);

      const sugerencias: CatalogoItem[] = [];
      
      // Buscar en SAT por cada palabra clave
      for (const palabra of palabrasClave) {
        try {
          let resultados: any[] = [];
          
          if (config.tipo === 'productos') {
            resultados = await CatalogosSATService.obtenerProductosServicios(palabra);
          }
          
          resultados.slice(0, 3).forEach(item => {
            const clave = item.clave || item.clave_prod_serv;
            const descripcionItem = item.descripcion || item.nombre;
            
            if (!sugerencias.some(s => s.clave === clave)) {
              sugerencias.push({
                value: clave,
                label: `${clave} - ${descripcionItem}`,
                descripcion: descripcionItem,
                clave,
                confidence: 0.85,
                source: 'sat_oficial',
                metadata: {
                  palabraClave: palabra,
                  categoria: 'busqueda_contextual'
                }
              });
            }
          });
        } catch (error) {
          console.warn(`Error buscando palabra clave "${palabra}":`, error);
        }
      }

      console.log(`✅ Sugerencias por descripción: ${sugerencias.length}`);
      return sugerencias.slice(0, config.maxSuggestions || 10);
      
    } catch (error) {
      console.error('Error obteniendo sugerencias por descripción:', error);
      return [];
    }
  }, [config.tipo, config.maxSuggestions]);

  return {
    // Estado
    searchTerm,
    setSearchTerm,
    contextualData,
    actualizarContexto,
    
    // Datos
    datos: datosCombinados,
    sugerenciasIA,
    
    // Estado de carga
    isLoading: loadingBase || loadingIA,
    error: errorBase,
    
    // Acciones
    refetch,
    validarCodigoSAT,
    obtenerSugerenciasPorDescripcion,
    
    // Estadísticas
    stats: {
      totalItems: datosCombinados.length,
      satOficial: datosCombinados.filter(item => item.source === 'sat_oficial').length,
      iaSugerencias: datosCombinados.filter(item => item.source === 'ia_sugerencia').length,
      confidence: datosCombinados.reduce((acc, item) => acc + (item.confidence || 0), 0) / datosCombinados.length
    }
  };
}
