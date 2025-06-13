
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DireccionCompleta {
  codigoPostal: string;
  estado: string;
  estadoClave?: string;
  municipio: string;
  municipioClave?: string;
  localidad?: string;
  ciudad?: string;
  zona?: string;
  colonias: Array<{
    colonia: string;
    tipo_asentamiento?: string;
  }>;
  fuente: 'database' | 'api_externa' | 'cache';
}

interface UseCodigoPostalOptions {
  onSuccess?: (info: DireccionCompleta) => void;
  onError?: (error: string, sugerencias?: Array<{codigo_postal: string, ubicacion: string}>) => void;
  debounceMs?: number;
  autoLimpiar?: boolean;
}

export function useCodigoPostalUnificado(options: UseCodigoPostalOptions = {}) {
  const { onSuccess, onError, debounceMs = 300, autoLimpiar = true } = options;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [direccionInfo, setDireccionInfo] = useState<DireccionCompleta | null>(null);
  
  // Cache optimizado con TTL
  const cacheRef = useRef<Map<string, { data: DireccionCompleta; timestamp: number }>>(new Map());
  const timeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();
  
  // TTL del cache: 30 minutos
  const CACHE_TTL = 30 * 60 * 1000;

  const limpiarTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const validarFormatoCP = useCallback((cp: string): boolean => {
    return /^\d{5}$/.test(cp.trim());
  }, []);

  const obtenerDelCache = useCallback((cp: string): DireccionCompleta | null => {
    const cached = cacheRef.current.get(cp);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return { ...cached.data, fuente: 'cache' };
    }
    if (cached) {
      cacheRef.current.delete(cp); // Eliminar cache expirado
    }
    return null;
  }, []);

  const guardarEnCache = useCallback((cp: string, data: DireccionCompleta) => {
    cacheRef.current.set(cp, {
      data,
      timestamp: Date.now()
    });
  }, []);

  const buscarCodigoPostal = useCallback(async (codigoPostal: string) => {
    console.log(`[CP_UNIFICADO] Iniciando búsqueda para: ${codigoPostal}`);
    
    if (autoLimpiar) {
      setError('');
      setDireccionInfo(null);
    }

    if (!validarFormatoCP(codigoPostal)) {
      const errorMsg = 'El código postal debe tener exactamente 5 dígitos';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsLoading(true);

    // Cancelar petición anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      // 1. Verificar cache
      const cached = obtenerDelCache(codigoPostal);
      if (cached) {
        console.log(`[CP_UNIFICADO] Usando cache para ${codigoPostal}`);
        setDireccionInfo(cached);
        onSuccess?.(cached);
        return;
      }

      // 2. Consultar Edge Function optimizada
      console.log(`[CP_UNIFICADO] Consultando Edge Function para ${codigoPostal}`);
      
      const { data, error: functionError } = await supabase.functions.invoke('codigo-postal', {
        body: { codigoPostal }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Error en consulta');
      }

      if (data && !data.error) {
        const info: DireccionCompleta = {
          codigoPostal: data.codigoPostal,
          estado: data.estado,
          estadoClave: data.estadoClave,
          municipio: data.municipio,
          municipioClave: data.municipioClave,
          localidad: data.localidad || data.ciudad,
          ciudad: data.ciudad,
          zona: data.zona,
          colonias: data.colonias || [],
          fuente: data.fuente
        };

        guardarEnCache(codigoPostal, info);
        setDireccionInfo(info);
        onSuccess?.(info);
        return;
      }

      // 3. Manejar error con sugerencias
      const sugerencias = data?.sugerencias || [];
      const errorMsg = `Código postal ${codigoPostal} no encontrado`;
      
      setError(errorMsg);
      onError?.(errorMsg, sugerencias);

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('[CP_UNIFICADO] Búsqueda cancelada');
        return;
      }
      
      console.error('[CP_UNIFICADO] Error en búsqueda:', error);
      
      const errorMsg = 'Error al consultar código postal';
      setError(errorMsg);
      onError?.(errorMsg, []);
      
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError, validarFormatoCP, obtenerDelCache, guardarEnCache, autoLimpiar]);

  const buscarConDebounce = useCallback((codigoPostal: string) => {
    limpiarTimeout();
    
    if (codigoPostal.length !== 5) {
      if (autoLimpiar) {
        setDireccionInfo(null);
        setError('');
      }
      return;
    }

    timeoutRef.current = setTimeout(() => {
      buscarCodigoPostal(codigoPostal);
    }, debounceMs);
  }, [buscarCodigoPostal, debounceMs, limpiarTimeout, autoLimpiar]);

  const limpiarCache = useCallback(() => {
    cacheRef.current.clear();
    console.log('[CP_UNIFICADO] Cache limpiado');
  }, []);

  const resetear = useCallback(() => {
    limpiarTimeout();
    setIsLoading(false);
    setError('');
    setDireccionInfo(null);
  }, [limpiarTimeout]);

  return {
    isLoading,
    error,
    direccionInfo,
    buscarCodigoPostal,
    buscarConDebounce,
    limpiarCache,
    resetear,
    validarFormatoCP
  };
}
