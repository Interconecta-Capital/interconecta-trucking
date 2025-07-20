import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface RealTimeMetrics {
  ingresosMensuales: number;
  ingresosTotales: number;
  costosMensuales: number;
  costosTotales: number;
  margenPromedio: number;
  gananciaNeta: number;
  cotizacionesPendientes: number;
  cotizacionesAprobadas: number;
  viajesCompletados: number;
  viajesEnTransito: number;
  evolucionIngresos: Array<{
    mes: string;
    ingresos: number;
    costos: number;
    margen: number;
  }>;
  // Campos para compatibilidad hacia atrás
  viajesHoy: number;
  viajesEnCurso: number;
  ingresosHoy: number;
  margenHoy: number;
  conductoresActivos: number;
  vehiculosEnUso: number;
  eficienciaFlota: number;
  utilizacionRecursos: number;
  documentosPendientes: number;
  alertasUrgentes: number;
  comparativas: {
    viajesEnCurso: number;
    ingresosHoy: number;
    eficienciaFlota: number;
  };
}

export const useRealTimeMetrics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  const calculateMetrics = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const now = new Date();
      let startDate = new Date();

      switch (period) {
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          startDate = new Date(now.getFullYear(), quarter * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
      }

      // Obtener viajes del período actual
      const { data: viajes, error: viajesError } = await supabase
        .from('viajes')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString());

      if (viajesError) throw viajesError;

      // Obtener todos los viajes para totales
      const { data: viajesTotal, error: viajesAError } = await supabase
        .from('viajes')
        .select('*')
        .eq('user_id', user.id);

      if (viajesAError) throw viajesAError;

      // Obtener costos
      const { data: costos, error: costosError } = await supabase
        .from('costos_viaje')
        .select('*')
        .eq('user_id', user.id);

      if (costosError) throw costosError;

      // Obtener cotizaciones
      const { data: cotizaciones, error: cotizacionesError } = await supabase
        .from('cotizaciones')
        .select('*')
        .eq('user_id', user.id);

      if (cotizacionesError) throw cotizacionesError;

      // Calcular métricas del período actual
      const ingresosMensuales = viajes?.reduce((sum, v) => sum + (v.precio_cobrado || 0), 0) || 0;
      const costosMensuales = costos?.filter(c => {
        const viaje = viajes?.find(v => v.id === c.viaje_id);
        return !!viaje;
      }).reduce((sum, c) => sum + (c.costo_total_real || c.costo_total_estimado || 0), 0) || 0;

      // Calcular métricas totales
      const ingresosTotales = viajesTotal?.reduce((sum, v) => sum + (v.precio_cobrado || 0), 0) || 0;
      const costosTotales = costos?.reduce((sum, c) => sum + (c.costo_total_real || c.costo_total_estimado || 0), 0) || 0;

      // Calcular otras métricas
      const margenPromedio = ingresosTotales > 0 ? ((ingresosTotales - costosTotales) / ingresosTotales) * 100 : 0;
      const gananciaNeta = ingresosMensuales - costosMensuales;

      const cotizacionesPendientes = cotizaciones?.filter(c => c.estado === 'pendiente').length || 0;
      const cotizacionesAprobadas = cotizaciones?.filter(c => c.estado === 'aprobada').length || 0;

      const viajesCompletados = viajes?.filter(v => v.estado === 'completado').length || 0;
      const viajesEnTransito = viajes?.filter(v => v.estado === 'en_transito').length || 0;

      // Calcular evolución de ingresos (últimos 6 meses)
      const evolucionIngresos = [];
      for (let i = 5; i >= 0; i--) {
        const mesDate = new Date();
        mesDate.setMonth(mesDate.getMonth() - i);
        const mesStart = new Date(mesDate.getFullYear(), mesDate.getMonth(), 1);
        const mesEnd = new Date(mesDate.getFullYear(), mesDate.getMonth() + 1, 0);

        const viajesMes = viajesTotal?.filter(v => {
          const fechaViaje = new Date(v.created_at);
          return fechaViaje >= mesStart && fechaViaje <= mesEnd;
        }) || [];

        const ingresosMes = viajesMes.reduce((sum, v) => sum + (v.precio_cobrado || 0), 0);
        const costosMes = costos?.filter(c => {
          const viaje = viajesMes.find(v => v.id === c.viaje_id);
          return !!viaje;
        }).reduce((sum, c) => sum + (c.costo_total_real || c.costo_total_estimado || 0), 0) || 0;

        evolucionIngresos.push({
          mes: mesDate.toLocaleString('es', { month: 'short' }),
          ingresos: ingresosMes,
          costos: costosMes,
          margen: ingresosMes - costosMes
        });
      }

      const calculatedMetrics: RealTimeMetrics = {
        ingresosMensuales,
        ingresosTotales,
        costosMensuales,
        costosTotales,
        margenPromedio,
        gananciaNeta,
        cotizacionesPendientes,
        cotizacionesAprobadas,
        viajesCompletados,
        viajesEnTransito,
        evolucionIngresos
      };

      setMetrics(calculatedMetrics);
    } catch (error) {
      console.error('Error calculating metrics:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, period]);

  useEffect(() => {
    calculateMetrics();
  }, [calculateMetrics]);

  // Actualizar métricas cada 30 segundos
  useEffect(() => {
    const interval = setInterval(calculateMetrics, 30000);
    return () => clearInterval(interval);
  }, [calculateMetrics]);

  return {
    data: metrics, // Backward compatibility
    metrics,
    loading,
    isLoading: loading, // Backward compatibility
    period,
    setPeriod,
    refreshMetrics: calculateMetrics
  };
};