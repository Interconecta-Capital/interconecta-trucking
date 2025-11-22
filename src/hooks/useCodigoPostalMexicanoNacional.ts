
import { useState, useEffect, useCallback, useRef } from 'react';
import { codigosPostalesService } from '@/services/codigosPostalesService';

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

  // Función principal de consulta optimizada con timeout
  const consultarCodigoPostal = useCallback(async (cp: string): Promise<void> => {
    if (!cp || cp.length !== 5 || !/^\d{5}$/.test(cp)) {
      setError('El código postal debe tener 5 dígitos');
      setDireccionInfo(null);
      setSugerencias([]);
      return;
    }

    setLoading(true);
    setError('');
    setSugerencias([]);

    try {
      console.log(`[HOOK_CP_OPT] Consultando CP: ${cp}`);
      
      // Timeout reducido a 8 segundos (SEPOMEX tiene su propio timeout de 3s)
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Tiempo de espera agotado')), 8000)
      );
      
      const searchPromise = codigosPostalesService.buscarDireccionPorCP(cp);
      
      const { data, error: serviceError, sugerencias: serviceSugerencias } = 
        await Promise.race([searchPromise, timeoutPromise]);

      if (data && data.colonias.length > 0) {
        const direccionInfo: DireccionInfo = {
          estado: data.estado,
          municipio: data.municipio,
          localidad: data.localidad || data.municipio,
          colonias: data.colonias,
          totalColonias: data.colonias.length,
          fuente: data.fuente
        };

        setDireccionInfo(direccionInfo);
        setError('');
        setSugerencias([]);
        console.log(`[HOOK_CP_OPT] Éxito - ${data.colonias.length} colonias (${data.fuente})`);
      } else {
        // Manejar error con sugerencias
        const cpsSimilares: SugerenciaCP[] = serviceSugerencias?.map(s => ({
          codigo: s.codigo_postal,
          ubicacion: s.ubicacion
        })) || [];
        
        setSugerencias(cpsSimilares);
        setError(serviceError || 'Código postal no encontrado. Puedes llenar los campos manualmente.');
        setDireccionInfo(null);
      }
    } catch (error: any) {
      console.error('[HOOK_CP_OPT] Error:', error);
      setError('Error al consultar código postal. Puedes llenar los campos manualmente.');
      setDireccionInfo(null);
      setSugerencias([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
