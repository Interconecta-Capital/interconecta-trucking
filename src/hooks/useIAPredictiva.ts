
import { useState, useCallback } from 'react';
import { iaPredictiva } from '@/services/iaPredictiva';
import { AnalisisIA, AnalisisViaje } from '@/types/iaPredictiva';

interface UseIAPredictivaReturn {
  analizarRuta: (origen: string, destino: string) => Promise<AnalisisIA>;
  registrarAnalisis: (datos: Partial<AnalisisViaje>) => Promise<boolean>;
  obtenerHistorial: (limite?: number) => Promise<AnalisisViaje[]>;
  aplicarCorreccion: (costo: number, factor: number, tipo?: 'conservador' | 'moderado' | 'agresivo') => number;
  loading: boolean;
  error: string | null;
}

export const useIAPredictiva = (): UseIAPredictivaReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analizarRuta = useCallback(async (origen: string, destino: string): Promise<AnalisisIA> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🧠 Analizando ruta con IA:', { origen, destino });
      
      const analisis = await iaPredictiva.analizarRuta(origen, destino);
      
      console.log('📊 Análisis IA completado:', {
        exactitudCosto: analisis.precision.exactitudCosto,
        precioOptimo: analisis.sugerencias.precioOptimo,
        confianza: analisis.precision.confianza,
        tendencia: analisis.mercado.tendencia
      });

      return analisis;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error en análisis IA';
      setError(errorMsg);
      console.error('❌ Error en análisis IA:', err);
      
      // Retornar análisis vacío en caso de error
      return iaPredictiva['getAnalisisVacio']();
    } finally {
      setLoading(false);
    }
  }, []);

  const registrarAnalisis = useCallback(async (datos: Partial<AnalisisViaje>): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      console.log('💾 Registrando análisis de viaje:', datos);
      
      const resultado = await iaPredictiva.registrarAnalisisViaje(datos);
      
      if (resultado) {
        console.log('✅ Análisis registrado exitosamente:', resultado.id);
        return true;
      }
      
      return false;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error registrando análisis';
      setError(errorMsg);
      console.error('❌ Error registrando análisis:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const obtenerHistorial = useCallback(async (limite: number = 50): Promise<AnalisisViaje[]> => {
    setLoading(true);
    setError(null);

    try {
      const historial = await iaPredictiva.obtenerHistorialAnalisis(limite);
      console.log(`📋 Historial obtenido: ${historial.length} registros`);
      return historial;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error obteniendo historial';
      setError(errorMsg);
      console.error('❌ Error obteniendo historial:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const aplicarCorreccion = useCallback((
    costo: number, 
    factor: number, 
    tipo: 'conservador' | 'moderado' | 'agresivo' = 'moderado'
  ): number => {
    return iaPredictiva.aplicarFactorCorreccion(costo, factor, tipo);
  }, []);

  return {
    analizarRuta,
    registrarAnalisis,
    obtenerHistorial,
    aplicarCorreccion,
    loading,
    error
  };
};
