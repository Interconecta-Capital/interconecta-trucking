
import { useState, useCallback, useRef } from 'react';

interface ColoniaInfo {
  colonia: string;
  tipo_asentamiento?: string;
}

interface DireccionInfoUnificada {
  estado: string;
  municipio: string;
  localidad?: string;
  ciudad?: string;
  colonias: ColoniaInfo[];
}

interface UseCodigoPostalUnificadoProps {
  onSuccess?: (info: DireccionInfoUnificada) => void;
  onError?: (error: string, sugerencias?: Array<{codigo_postal: string, ubicacion: string}>) => void;
}

export const useCodigoPostalUnificado = ({ onSuccess, onError }: UseCodigoPostalUnificadoProps = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [direccionInfo, setDireccionInfo] = useState<DireccionInfoUnificada | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Función para consultar SEPOMEX API
  const consultarSEPOMEX = async (cp: string): Promise<DireccionInfoUnificada | null> => {
    try {
      console.log(`[SEPOMEX_UNIFICADO] Consultando CP: ${cp}`);
      const response = await fetch(`https://api-sepomex.hckdrk.mx/query/info_cp/${cp}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error || !data.response || data.response.length === 0) {
        throw new Error('Sin datos');
      }

      const primeraRespuesta = data.response[0];
      
      // Extraer TODAS las colonias de la respuesta
      const todasLasColonias: ColoniaInfo[] = [];
      const coloniasUnicas = new Set<string>();
      
      data.response.forEach((item: any) => {
        const nombreColonia = item.d_asenta?.trim();
        const tipoColonia = item.d_tipo_asenta?.trim() || 'Colonia';
        
        if (nombreColonia && !coloniasUnicas.has(nombreColonia)) {
          coloniasUnicas.add(nombreColonia);
          todasLasColonias.push({
            colonia: nombreColonia,
            tipo_asentamiento: tipoColonia
          });
        }
      });

      // Ordenar alfabéticamente
      todasLasColonias.sort((a, b) => a.colonia.localeCompare(b.colonia));

      const resultado: DireccionInfoUnificada = {
        estado: primeraRespuesta.d_estado,
        municipio: primeraRespuesta.d_mnp,
        localidad: primeraRespuesta.d_ciudad,
        ciudad: primeraRespuesta.d_ciudad,
        colonias: todasLasColonias
      };

      console.log(`[SEPOMEX_UNIFICADO] ${todasLasColonias.length} colonias encontradas`);
      return resultado;
    } catch (error) {
      console.log(`[SEPOMEX_UNIFICADO] Error:`, error);
      throw error;
    }
  };

  // Función para consultar API alternativa
  const consultarAPIAlternativa = async (cp: string): Promise<DireccionInfoUnificada | null> => {
    try {
      console.log(`[API_ALT_UNIFICADO] Consultando CP: ${cp}`);
      const response = await fetch(`https://api.tau.com.mx/dipomex/v1/cp/${cp}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.data?.settlements || data.data.settlements.length === 0) {
        throw new Error('Sin colonias');
      }

      const colonias: ColoniaInfo[] = data.data.settlements.map((settlement: any) => ({
        colonia: settlement.name,
        tipo_asentamiento: settlement.type || 'Colonia'
      })).sort((a: ColoniaInfo, b: ColoniaInfo) => a.colonia.localeCompare(b.colonia));

      const resultado: DireccionInfoUnificada = {
        estado: data.data.state,
        municipio: data.data.city,
        localidad: data.data.locality,
        ciudad: data.data.city,
        colonias: colonias
      };

      console.log(`[API_ALT_UNIFICADO] ${colonias.length} colonias encontradas`);
      return resultado;
    } catch (error) {
      console.log(`[API_ALT_UNIFICADO] Error:`, error);
      throw error;
    }
  };

  // Función principal de búsqueda
  const consultarCodigoPostal = useCallback(async (cp: string) => {
    if (!cp || cp.length !== 5 || !/^\d{5}$/.test(cp)) {
      const errorMsg = 'Formato de código postal inválido';
      setError(errorMsg);
      setDireccionInfo(null);
      onError?.(errorMsg);
      return;
    }

    setIsLoading(true);
    setError('');
    setDireccionInfo(null);

    try {
      // Intentar API principal
      let resultado = await consultarSEPOMEX(cp);
      
      // Si no hay resultado o pocas colonias, intentar API alternativa
      if (!resultado || resultado.colonias.length === 0) {
        console.log('[UNIFICADO] Fallback a API alternativa...');
        resultado = await consultarAPIAlternativa(cp);
      }

      if (resultado && resultado.colonias.length > 0) {
        setDireccionInfo(resultado);
        setError('');
        onSuccess?.(resultado);
        console.log(`[UNIFICADO] Éxito: ${resultado.colonias.length} colonias para CP ${cp}`);
      } else {
        throw new Error('No se encontraron datos');
      }
    } catch (error) {
      const errorMsg = `Código postal ${cp} no encontrado`;
      setError(errorMsg);
      setDireccionInfo(null);
      
      // Generar sugerencias simples
      const sugerencias = Array.from({length: 5}, (_, i) => ({
        codigo_postal: (parseInt(cp) + i - 2).toString().padStart(5, '0'),
        ubicacion: `Área cercana a ${cp}`
      })).filter(s => /^\d{5}$/.test(s.codigo_postal));
      
      onError?.(errorMsg, sugerencias);
      console.log(`[UNIFICADO] Error final para CP ${cp}`);
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  // Función con debounce
  const buscarConDebounce = useCallback((cp: string) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      consultarCodigoPostal(cp);
    }, 500);
  }, [consultarCodigoPostal]);

  return {
    isLoading,
    error,
    direccionInfo,
    consultarCodigoPostal,
    buscarConDebounce
  };
};
