
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CodigoPostalInfo {
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
  onSuccess?: (info: CodigoPostalInfo) => void;
  onError?: (error: string, sugerencias?: Array<{codigo_postal: string, ubicacion: string}>) => void;
  debounceMs?: number;
}

export function useCodigoPostalCompleto(options: UseCodigoPostalOptions = {}) {
  const { onSuccess, onError, debounceMs = 300 } = options;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [codigoPostalInfo, setCodigoPostalInfo] = useState<CodigoPostalInfo | null>(null);
  
  // Cache en memoria para consultas recientes
  const cacheRef = useRef<Map<string, CodigoPostalInfo>>(new Map());
  const timeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

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

  const buscarCodigoPostal = useCallback(async (codigoPostal: string) => {
    console.log(`[CP_COMPLETO] Iniciando búsqueda para: ${codigoPostal}`);
    
    // Limpiar estado anterior
    setError('');
    setCodigoPostalInfo(null);

    // Validar formato
    if (!validarFormatoCP(codigoPostal)) {
      const errorMsg = 'El código postal debe tener exactamente 5 dígitos';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsLoading(true);

    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      // 1. Verificar cache en memoria primero
      const cached = cacheRef.current.get(codigoPostal);
      if (cached) {
        console.log(`[CP_COMPLETO] Usando cache para ${codigoPostal}`);
        setCodigoPostalInfo({ ...cached, fuente: 'cache' });
        onSuccess?.({ ...cached, fuente: 'cache' });
        return;
      }

      // 2. Consultar Edge Function optimizada
      console.log(`[CP_COMPLETO] Consultando Edge Function para ${codigoPostal}`);
      
      const { data, error: functionError } = await supabase.functions.invoke('codigo-postal', {
        body: { codigoPostal }
      });

      if (functionError) {
        throw new Error(functionError.message || 'Error en consulta');
      }

      if (data && !data.error) {
        const info: CodigoPostalInfo = {
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

        // Guardar en cache
        cacheRef.current.set(codigoPostal, info);
        setCodigoPostalInfo(info);
        onSuccess?.(info);
        return;
      }

      // 3. Si no se encuentra, manejar error con sugerencias
      const sugerencias = data?.sugerencias || [];
      const errorMsg = `Código postal ${codigoPostal} no encontrado. Te mostramos códigos postales similares:`;
      
      setError(errorMsg);
      onError?.(errorMsg, sugerencias);

    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('[CP_COMPLETO] Búsqueda cancelada');
        return;
      }
      
      console.error('[CP_COMPLETO] Error en búsqueda:', error);
      
      const errorMsg = 'Error al consultar código postal. Te mostramos códigos postales similares:';
      setError(errorMsg);
      onError?.(errorMsg, []);
      
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError, validarFormatoCP]);

  const buscarConDebounce = useCallback((codigoPostal: string) => {
    limpiarTimeout();
    
    if (codigoPostal.length !== 5) {
      setCodigoPostalInfo(null);
      setError('');
      return;
    }

    console.log(`[CP_COMPLETO] Programando búsqueda con debounce para: ${codigoPostal}`);
    timeoutRef.current = setTimeout(() => {
      buscarCodigoPostal(codigoPostal);
    }, debounceMs);
  }, [buscarCodigoPostal, debounceMs, limpiarTimeout]);

  const limpiarCache = useCallback(() => {
    cacheRef.current.clear();
    console.log('[CP_COMPLETO] Cache limpiado');
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
    resetear,
    validarFormatoCP
  };
}
