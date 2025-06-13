
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { buscarCodigoPostalLocal, validarFormatoCP, sugerirCodigosPostalesSimilares } from '@/data/codigosPostalesMexico';

export interface CodigoPostalInfo {
  codigoPostal: string;
  estado: string;
  municipio: string;
  localidad?: string;
  colonias: string[];
  fuente: 'local' | 'api_interna' | 'cache';
}

interface UseCodigoPostalOptions {
  onSuccess?: (info: CodigoPostalInfo) => void;
  onError?: (error: string, sugerencias?: string[]) => void;
  debounceMs?: number;
}

export function useCodigoPostalOptimizado(options: UseCodigoPostalOptions = {}) {
  const { onSuccess, onError, debounceMs = 500 } = options;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [codigoPostalInfo, setCodigoPostalInfo] = useState<CodigoPostalInfo | null>(null);
  
  // Cache en memoria para evitar consultas repetidas
  const cacheRef = useRef<Map<string, CodigoPostalInfo>>(new Map());
  const timeoutRef = useRef<NodeJS.Timeout>();

  const limpiarTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const buscarCodigoPostal = useCallback(async (codigoPostal: string) => {
    // Limpiar estado anterior
    setError('');
    setCodigoPostalInfo(null);

    // Validar formato
    if (!validarFormatoCP(codigoPostal)) {
      const errorMsg = 'Código postal debe tener 5 dígitos';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsLoading(true);

    try {
      // 1. Verificar cache en memoria
      const cached = cacheRef.current.get(codigoPostal);
      if (cached) {
        console.log(`[CP_HOOK] Usando cache para ${codigoPostal}`);
        setCodigoPostalInfo(cached);
        onSuccess?.(cached);
        return;
      }

      // 2. Buscar en datos locales primero (más rápido)
      const datosLocales = buscarCodigoPostalLocal(codigoPostal);
      if (datosLocales) {
        console.log(`[CP_HOOK] Encontrado en datos locales: ${codigoPostal}`);
        
        const info: CodigoPostalInfo = {
          codigoPostal,
          estado: datosLocales.estado,
          municipio: datosLocales.municipio,
          localidad: datosLocales.localidad,
          colonias: datosLocales.colonias,
          fuente: 'local'
        };

        // Guardar en cache
        cacheRef.current.set(codigoPostal, info);
        setCodigoPostalInfo(info);
        onSuccess?.(info);
        return;
      }

      // 3. Si no está en datos locales, consultar API interna
      console.log(`[CP_HOOK] Consultando API interna para ${codigoPostal}`);
      
      const { data, error: apiError } = await supabase.functions.invoke('codigo-postal', {
        body: { codigoPostal }
      });

      if (apiError) {
        throw new Error(apiError.message || 'Error en consulta de API');
      }

      if (data && !data.error) {
        const info: CodigoPostalInfo = {
          codigoPostal: data.codigoPostal,
          estado: data.estado,
          municipio: data.municipio, 
          localidad: data.localidad,
          colonias: data.colonias,
          fuente: 'api_interna'
        };

        // Guardar en cache
        cacheRef.current.set(codigoPostal, info);
        setCodigoPostalInfo(info);
        onSuccess?.(info);
        return;
      }

      // 4. Si no se encuentra, mostrar error con sugerencias
      const sugerencias = sugerirCodigosPostalesSimilares(codigoPostal);
      const errorMsg = `Código postal ${codigoPostal} no encontrado`;
      
      setError(errorMsg);
      onError?.(errorMsg, sugerencias);

    } catch (error) {
      console.error('[CP_HOOK] Error en búsqueda:', error);
      
      const errorMsg = error instanceof Error ? error.message : 'Error al consultar código postal';
      const sugerencias = sugerirCodigosPostalesSimilares(codigoPostal);
      
      setError(errorMsg);
      onError?.(errorMsg, sugerencias);
      
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError]);

  const buscarConDebounce = useCallback((codigoPostal: string) => {
    limpiarTimeout();
    
    if (codigoPostal.length !== 5) {
      setCodigoPostalInfo(null);
      setError('');
      return;
    }

    timeoutRef.current = setTimeout(() => {
      buscarCodigoPostal(codigoPostal);
    }, debounceMs);
  }, [buscarCodigoPostal, debounceMs, limpiarTimeout]);

  const limpiarCache = useCallback(() => {
    cacheRef.current.clear();
    console.log('[CP_HOOK] Cache limpiado');
  }, []);

  const resetear = useCallback(() => {
    limpiarTimeout();
    setIsLoading(false);
    setError('');
    setCodigoPostalInfo(null);
  }, [limpiarTimeout]);

  return {
    isLoading,
    error,
    codigoPostalInfo,
    buscarCodigoPostal,
    buscarConDebounce,
    limpiarCache,
    resetear
  };
}
