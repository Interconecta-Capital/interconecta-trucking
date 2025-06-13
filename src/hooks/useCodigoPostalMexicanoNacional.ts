
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ColoniaData {
  nombre: string;
  tipo: string;
}

interface DireccionInfo {
  estado: string;
  municipio: string;
  localidad: string;
  colonias: ColoniaData[];
  totalColonias: number;
  fuente: string;
}

interface SugerenciaCP {
  codigo: string;
  ubicacion: string;
}

const CACHE_TTL = 10 * 60 * 1000; // 10 minutos
const cache = new Map<string, { data: DireccionInfo; timestamp: number }>();

export const useCodigoPostalMexicanoNacional = () => {
  const [direccionInfo, setDireccionInfo] = useState<DireccionInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [sugerencias, setSugerencias] = useState<SugerenciaCP[]>([]);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Consultar tu base de datos nacional primero
  const consultarBaseDatosNacional = useCallback(async (cp: string): Promise<DireccionInfo | null> => {
    try {
      console.log(`[DB_NACIONAL] Consultando CP: ${cp}`);
      
      const { data, error } = await supabase.functions.invoke('codigo-postal-mexico', {
        body: { codigoPostal: cp }
      });

      if (error) {
        console.error(`[DB_NACIONAL] Error:`, error);
        throw error;
      }

      if (data && data.colonias && data.colonias.length > 0) {
        const direccionInfo: DireccionInfo = {
          estado: data.estado,
          municipio: data.municipio,
          localidad: data.localidad || data.ciudad || data.municipio,
          colonias: data.colonias,
          totalColonias: data.totalColonias,
          fuente: 'database_nacional'
        };

        console.log(`[DB_NACIONAL] Éxito - ${data.totalColonias} colonias encontradas`);
        return direccionInfo;
      }

      throw new Error('Sin datos en base nacional');
    } catch (error) {
      console.log(`[DB_NACIONAL] Error:`, error);
      throw error;
    }
  }, []);

  // API externa como respaldo (SEPOMEX)
  const consultarAPISepomex = useCallback(async (cp: string): Promise<DireccionInfo | null> => {
    try {
      console.log(`[API_SEPOMEX_BACKUP] Consultando CP: ${cp}`);
      const response = await fetch(`https://api-sepomex.hckdrk.mx/query/info_cp/${cp}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(8000)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error || !data.response || data.response.length === 0) {
        throw new Error('Datos incompletos en SEPOMEX');
      }

      const primeraRespuesta = data.response[0];
      const todasLasColonias: ColoniaData[] = [];
      const coloniasUnicas = new Set<string>();
      
      data.response.forEach((item: any) => {
        const nombreColonia = item.d_asenta?.trim();
        const tipoColonia = item.d_tipo_asenta?.trim() || 'Colonia';
        
        if (nombreColonia && !coloniasUnicas.has(nombreColonia)) {
          coloniasUnicas.add(nombreColonia);
          todasLasColonias.push({
            nombre: nombreColonia,
            tipo: tipoColonia
          });
        }
      });

      todasLasColonias.sort((a, b) => a.nombre.localeCompare(b.nombre));

      const direccionInfo: DireccionInfo = {
        estado: primeraRespuesta.d_estado,
        municipio: primeraRespuesta.d_mnp,
        localidad: primeraRespuesta.d_ciudad || primeraRespuesta.d_mnp,
        colonias: todasLasColonias,
        totalColonias: todasLasColonias.length,
        fuente: 'api_sepomex_backup'
      };

      console.log(`[API_SEPOMEX_BACKUP] Éxito - ${todasLasColonias.length} colonias`);
      return direccionInfo;
    } catch (error) {
      console.log(`[API_SEPOMEX_BACKUP] Error:`, error);
      throw error;
    }
  }, []);

  // Función principal de consulta
  const consultarCodigoPostal = useCallback(async (cp: string): Promise<void> => {
    if (!cp || cp.length !== 5 || !/^\d{5}$/.test(cp)) {
      setError('El código postal debe tener 5 dígitos');
      setDireccionInfo(null);
      setSugerencias([]);
      return;
    }

    // Verificar cache
    const cached = cache.get(cp);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log(`[CACHE] Usando datos en cache para CP: ${cp}`);
      setDireccionInfo(cached.data);
      setError('');
      setSugerencias([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    setSugerencias([]);

    try {
      // 1. Intentar base de datos nacional PRIMERO
      let resultado = await consultarBaseDatosNacional(cp);
      
      if (!resultado || resultado.colonias.length === 0) {
        console.log('[FAILOVER] Base nacional sin datos, intentando API externa...');
        // 2. Fallback a API externa solo si es necesario
        resultado = await consultarAPISepomex(cp);
      }

      if (resultado && resultado.colonias.length > 0) {
        // Guardar en cache
        cache.set(cp, { data: resultado, timestamp: Date.now() });
        setDireccionInfo(resultado);
        setError('');
        setSugerencias([]);
        console.log(`[ÉXITO] CP ${cp} procesado con ${resultado.totalColonias} colonias desde ${resultado.fuente}`);
      } else {
        throw new Error('No se encontraron colonias');
      }
    } catch (error: any) {
      console.log('[ERROR_CONSULTA] Todas las fuentes fallaron:', error);
      
      // Obtener sugerencias del error si están disponibles
      let cpsSimilares: SugerenciaCP[] = [];
      if (error.sugerencias) {
        cpsSimilares = error.sugerencias.map((s: any) => ({
          codigo: s.codigo_postal,
          ubicacion: s.ubicacion
        }));
      }
      
      setSugerencias(cpsSimilares);
      setError('Código postal no encontrado en la base de datos nacional. Prueba con alguno de estos códigos similares:');
      setDireccionInfo(null);
    } finally {
      setLoading(false);
    }
  }, [consultarBaseDatosNacional, consultarAPISepomex]);

  // Función con debounce
  const buscarConDebounce = useCallback((cp: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      consultarCodigoPostal(cp);
    }, 500);
  }, [consultarCodigoPostal]);

  // Función para usar sugerencia
  const usarSugerencia = useCallback((cp: string) => {
    setSugerencias([]);
    consultarCodigoPostal(cp);
  }, [consultarCodigoPostal]);

  return {
    direccionInfo,
    loading,
    error,
    sugerencias,
    buscarConDebounce,
    usarSugerencia,
    consultarCodigoPostal
  };
};

export type { DireccionInfo, ColoniaData, SugerenciaCP };
