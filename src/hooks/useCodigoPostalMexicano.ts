
import { useState, useEffect, useCallback, useRef } from 'react';

interface ColoniaData {
  nombre: string;
  tipo: string;
}

interface DatosDomicilio {
  codigoPostal: string;
  estado: string;
  municipio: string;
  localidad: string;
  colonia: string;
  calle: string;
  numeroExterior: string;
  numeroInterior: string;
  referencia: string;
  domicilioCompleto: string;
}

interface DireccionInfo {
  estado: string;
  municipio: string;
  localidad: string;
  colonias: ColoniaData[];
}

interface APISepomexResponse {
  error?: boolean;
  response?: Array<{
    d_estado: string;
    d_mnp: string;
    d_ciudad: string;
    d_asenta: string;
    d_tipo_asenta: string;
  }>;
}

interface APITauResponse {
  data: {
    state: string;
    city: string;
    locality: string;
    settlements: Array<{
      name: string;
      type: string;
    }>;
  };
}

interface SugerenciaCP {
  codigo: string;
  ubicacion: string;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
const cache = new Map<string, { data: DireccionInfo; timestamp: number }>();

export const useCodigoPostalMexicano = () => {
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

  // Función para generar códigos postales similares
  const generarCPsSimilares = useCallback((cp: string): SugerenciaCP[] => {
    const cpNum = parseInt(cp);
    if (isNaN(cpNum)) return [];

    const similares: SugerenciaCP[] = [];
    
    // Generar variaciones cercanas (+/- 10)
    for (let i = -10; i <= 10; i++) {
      if (i === 0) continue;
      const nuevoCP = cpNum + i;
      if (nuevoCP >= 1000 && nuevoCP <= 99999) {
        const cpStr = nuevoCP.toString().padStart(5, '0');
        similares.push({
          codigo: cpStr,
          ubicacion: `Área cercana a ${cp}`
        });
      }
    }

    return similares.slice(0, 6); // Limitar a 6 sugerencias
  }, []);

  // Consultar API principal (SEPOMEX) - MEJORADO para capturar TODAS las colonias
  const consultarAPISepomex = async (cp: string): Promise<DireccionInfo | null> => {
    try {
      console.log(`[API_SEPOMEX] Consultando CP: ${cp}`);
      const response = await fetch(`https://api-sepomex.hckdrk.mx/query/info_cp/${cp}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(8000) // 8 segundos timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data: APISepomexResponse = await response.json();
      
      if (data.error || !data.response || data.response.length === 0) {
        throw new Error('Datos incompletos o error en respuesta');
      }

      // Obtener datos de la primera respuesta para estado/municipio/localidad
      const primeraRespuesta = data.response[0];
      
      // IMPORTANTE: Extraer TODAS las colonias únicas de la respuesta
      const todasLasColonias: ColoniaData[] = [];
      const coloniasUnicas = new Set<string>();
      
      data.response.forEach(item => {
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

      // Ordenar colonias alfabéticamente
      todasLasColonias.sort((a, b) => a.nombre.localeCompare(b.nombre));

      const direccionInfo: DireccionInfo = {
        estado: primeraRespuesta.d_estado,
        municipio: primeraRespuesta.d_mnp,
        localidad: primeraRespuesta.d_ciudad || primeraRespuesta.d_mnp,
        colonias: todasLasColonias
      };

      console.log(`[API_SEPOMEX] Éxito - ${todasLasColonias.length} colonias encontradas:`, direccionInfo);
      return direccionInfo;
    } catch (error) {
      console.log(`[API_SEPOMEX] Error:`, error);
      throw error;
    }
  };

  // Consultar API respaldo (Tau) - MEJORADO para capturar TODAS las colonias
  const consultarAPITau = async (cp: string): Promise<DireccionInfo | null> => {
    try {
      console.log(`[API_TAU] Consultando CP: ${cp}`);
      const response = await fetch(`https://api.tau.com.mx/dipomex/v1/cp/${cp}`, {
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

      const data: APITauResponse = await response.json();
      
      if (!data.data?.state || !data.data?.city || !data.data?.settlements) {
        throw new Error('Datos incompletos en respuesta TAU');
      }

      // IMPORTANTE: Extraer TODAS las colonias del array settlements
      const todasLasColonias: ColoniaData[] = data.data.settlements.map(settlement => ({
        nombre: settlement.name,
        tipo: settlement.type || 'Colonia'
      }));

      // Eliminar duplicados y ordenar
      const coloniasUnicas = todasLasColonias.filter((colonia, index, self) =>
        index === self.findIndex(c => c.nombre === colonia.nombre)
      ).sort((a, b) => a.nombre.localeCompare(b.nombre));

      const direccionInfo: DireccionInfo = {
        estado: data.data.state,
        municipio: data.data.city,
        localidad: data.data.locality || data.data.city,
        colonias: coloniasUnicas
      };

      console.log(`[API_TAU] Éxito - ${coloniasUnicas.length} colonias encontradas:`, direccionInfo);
      return direccionInfo;
    } catch (error) {
      console.log(`[API_TAU] Error:`, error);
      throw error;
    }
  };

  // Función principal de consulta con failover mejorado
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
      console.log(`[CACHE] Usando datos en cache para CP: ${cp} - ${cached.data.colonias.length} colonias`);
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
      // Intentar API principal (SEPOMEX)
      let resultado = await consultarAPISepomex(cp);
      
      if (!resultado || resultado.colonias.length === 0) {
        console.log('[FAILOVER] API SEPOMEX sin colonias, intentando API alternativa...');
        // Failover a API secundaria (Tau)
        resultado = await consultarAPITau(cp);
      }

      if (resultado && resultado.colonias.length > 0) {
        // Guardar en cache
        cache.set(cp, { data: resultado, timestamp: Date.now() });
        setDireccionInfo(resultado);
        setError('');
        setSugerencias([]);
        console.log(`[ÉXITO] CP ${cp} procesado con ${resultado.colonias.length} colonias`);
      } else {
        throw new Error('No se encontraron colonias');
      }
    } catch (error) {
      console.log('[ERROR_CONSULTA] Ambas APIs fallaron:', error);
      
      // Generar sugerencias de CPs similares
      const cpsSimilares = generarCPsSimilares(cp);
      setSugerencias(cpsSimilares);
      setError('Código postal no encontrado. Prueba con alguno de estos códigos similares:');
      setDireccionInfo(null);
    } finally {
      setLoading(false);
    }
  }, [generarCPsSimilares]);

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

export type { DatosDomicilio, DireccionInfo, ColoniaData, SugerenciaCP };
