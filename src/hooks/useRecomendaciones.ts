
import { useState, useCallback, useEffect } from 'react';
import { RecomendacionInteligente, ContextoRecomendacion } from '@/types/recomendaciones';
import { recomendacionesService } from '@/services/recomendacionesService';
import { useIAPredictiva } from './useIAPredictiva';

interface UseRecomendacionesReturn {
  recomendaciones: RecomendacionInteligente[];
  topRecomendaciones: RecomendacionInteligente[];
  generarRecomendaciones: (contexto: ContextoRecomendacion) => Promise<void>;
  obtenerTopRecomendaciones: (contexto: ContextoRecomendacion, limite?: number) => Promise<void>;
  marcarComoAplicada: (recomendacionId: string) => void;
  filtrarPorTipo: (tipo: RecomendacionInteligente['tipo']) => RecomendacionInteligente[];
  filtrarPorPrioridad: (prioridad: RecomendacionInteligente['prioridad']) => RecomendacionInteligente[];
  calcularImpactoTotal: () => { ahorro: number; ingreso: number; costo: number };
  loading: boolean;
  error: string | null;
}

export const useRecomendaciones = (): UseRecomendacionesReturn => {
  const [recomendaciones, setRecomendaciones] = useState<RecomendacionInteligente[]>([]);
  const [topRecomendaciones, setTopRecomendaciones] = useState<RecomendacionInteligente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { analizarRuta } = useIAPredictiva();

  const generarRecomendaciones = useCallback(async (contexto: ContextoRecomendacion) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🤖 Generando recomendaciones inteligentes...', contexto);

      // Enriquecer contexto con análisis IA si hay origen/destino
      let contextoEnriquecido = { ...contexto };
      if (contexto.viaje?.origen && contexto.viaje?.destino) {
        try {
          const analisisIA = await analizarRuta(contexto.viaje.origen, contexto.viaje.destino);
          contextoEnriquecido.analisisIA = analisisIA;
        } catch (aiError) {
          console.warn('No se pudo obtener análisis IA:', aiError);
        }
      }

      const nuevasRecomendaciones = await recomendacionesService.generarRecomendaciones(contextoEnriquecido);
      
      setRecomendaciones(nuevasRecomendaciones);
      
      console.log(`✅ ${nuevasRecomendaciones.length} recomendaciones generadas`, {
        vehiculo: nuevasRecomendaciones.filter(r => r.tipo === 'vehiculo').length,
        ruta: nuevasRecomendaciones.filter(r => r.tipo === 'ruta').length,
        precio: nuevasRecomendaciones.filter(r => r.tipo === 'precio').length,
        operacion: nuevasRecomendaciones.filter(r => r.tipo === 'operacion').length
      });

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error generando recomendaciones';
      setError(errorMsg);
      console.error('❌ Error generando recomendaciones:', err);
    } finally {
      setLoading(false);
    }
  }, [analizarRuta]);

  const obtenerTopRecomendaciones = useCallback(async (contexto: ContextoRecomendacion, limite: number = 3) => {
    setLoading(true);
    setError(null);

    try {
      console.log(`🎯 Obteniendo top ${limite} recomendaciones...`);

      // Enriquecer contexto con análisis IA
      let contextoEnriquecido = { ...contexto };
      if (contexto.viaje?.origen && contexto.viaje?.destino) {
        try {
          const analisisIA = await analizarRuta(contexto.viaje.origen, contexto.viaje.destino);
          contextoEnriquecido.analisisIA = analisisIA;
        } catch (aiError) {
          console.warn('No se pudo obtener análisis IA para top recomendaciones:', aiError);
        }
      }

      const topRecs = await recomendacionesService.obtenerTopRecomendaciones(contextoEnriquecido, limite);
      setTopRecomendaciones(topRecs);

      console.log(`📊 Top ${topRecs.length} recomendaciones obtenidas:`, 
        topRecs.map(r => `${r.tipo}: ${r.titulo}`)
      );

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error obteniendo top recomendaciones';
      setError(errorMsg);
      console.error('❌ Error obteniendo top recomendaciones:', err);
    } finally {
      setLoading(false);
    }
  }, [analizarRuta]);

  const marcarComoAplicada = useCallback((recomendacionId: string) => {
    console.log(`✅ Marcando recomendación como aplicada: ${recomendacionId}`);
    
    recomendacionesService.marcarComoAplicada(recomendacionId);
    
    // Actualizar estado local
    setRecomendaciones(prev => prev.map(rec => 
      rec.id === recomendacionId 
        ? { ...rec, aplicada: true }
        : rec
    ));
    
    setTopRecomendaciones(prev => prev.map(rec => 
      rec.id === recomendacionId 
        ? { ...rec, aplicada: true }
        : rec
    ));
  }, []);

  const filtrarPorTipo = useCallback((tipo: RecomendacionInteligente['tipo']) => {
    return recomendaciones.filter(rec => rec.tipo === tipo);
  }, [recomendaciones]);

  const filtrarPorPrioridad = useCallback((prioridad: RecomendacionInteligente['prioridad']) => {
    return recomendaciones.filter(rec => rec.prioridad === prioridad);
  }, [recomendaciones]);

  const calcularImpactoTotal = useCallback(() => {
    return recomendaciones.reduce((total, rec) => ({
      ahorro: total.ahorro + (rec.impactoEconomico.ahorro || 0),
      ingreso: total.ingreso + (rec.impactoEconomico.ingresoAdicional || 0),
      costo: total.costo + (rec.impactoEconomico.costoAdicional || 0)
    }), { ahorro: 0, ingreso: 0, costo: 0 });
  }, [recomendaciones]);

  return {
    recomendaciones,
    topRecomendaciones,
    generarRecomendaciones,
    obtenerTopRecomendaciones,
    marcarComoAplicada,
    filtrarPorTipo,
    filtrarPorPrioridad,
    calcularImpactoTotal,
    loading,
    error
  };
};
