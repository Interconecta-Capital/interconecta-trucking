
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export interface RealDashboardMetrics {
  // Financial metrics
  ingresosTotales: number;
  costosTotales: number;
  margenPromedio: number;
  margenTotal: number;
  
  // Operational metrics
  viajesCompletados: number;
  viajesEnTransito: number;
  viajesProgramados: number;
  kmRecorridos: number;
  
  // Asset utilization
  vehiculosActivos: number;
  vehiculosDisponibles: number;
  conductoresActivos: number;
  conductoresDisponibles: number;
  
  // Performance indicators
  puntualidadPromedio: number;
  eficienciaFlota: number;
  satisfaccionCliente: number;
  
  // Comparatives
  comparativoPeriodoAnterior: {
    ingresos: number;
    costos: number;
    viajes: number;
    margen: number;
  };
  
  // Trends and analytics
  tendenciasSemanales: Array<{
    semana: string;
    ingresos: number;
    viajes: number;
    margen: number;
  }>;
  
  rutasMasRentables: Array<{
    origen: string;
    destino: string;
    viajesTotal: number;
    ingresoPromedio: number;
    margenPromedio: number;
  }>;
}

export const useRealDashboard = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['real-dashboard-metrics', user?.id],
    queryFn: async (): Promise<RealDashboardMetrics> => {
      if (!user?.id) throw new Error('User not authenticated');

      const now = new Date();
      const mesActual = {
        inicio: startOfMonth(now),
        fin: endOfMonth(now)
      };
      const mesAnterior = {
        inicio: startOfMonth(subMonths(now, 1)),
        fin: endOfMonth(subMonths(now, 1))
      };

      // 1. Obtener datos financieros reales
      const { data: viajesData } = await supabase
        .from('viajes')
        .select(`
          *,
          costos_viaje (
            precio_cotizado,
            precio_final_cobrado,
            costo_total_estimado,
            costo_total_real,
            margen_estimado,
            margen_real
          )
        `)
        .eq('user_id', user.id)
        .gte('created_at', mesActual.inicio.toISOString())
        .lte('created_at', mesActual.fin.toISOString());

      // 2. Calcular métricas financieras
      let ingresosTotales = 0;
      let costosTotales = 0;
      let margenTotal = 0;
      let viajesConCostos = 0;

      viajesData?.forEach(viaje => {
        const costos = viaje.costos_viaje?.[0];
        if (costos) {
          const ingreso = costos.precio_final_cobrado || costos.precio_cotizado || 0;
          const costo = costos.costo_total_real || costos.costo_total_estimado || 0;
          const margen = costos.margen_real || costos.margen_estimado || 0;
          
          ingresosTotales += ingreso;
          costosTotales += costo;
          margenTotal += margen;
          viajesConCostos++;
        }
      });

      const margenPromedio = viajesConCostos > 0 ? margenTotal / viajesConCostos : 0;

      // 3. Obtener métricas operacionales
      const { data: viajesEstados } = await supabase
        .from('viajes')
        .select('estado')
        .eq('user_id', user.id);

      const viajesCompletados = viajesEstados?.filter(v => v.estado === 'completado').length || 0;
      const viajesEnTransito = viajesEstados?.filter(v => v.estado === 'en_transito').length || 0;
      const viajesProgramados = viajesEstados?.filter(v => v.estado === 'programado').length || 0;

      // 4. Obtener datos de activos
      const { data: vehiculos } = await supabase
        .from('vehiculos')
        .select('estado, activo')
        .eq('user_id', user.id)
        .eq('activo', true);

      const vehiculosActivos = vehiculos?.length || 0;
      const vehiculosDisponibles = vehiculos?.filter(v => v.estado === 'disponible').length || 0;

      const { data: conductores } = await supabase
        .from('conductores')
        .select('estado, activo')
        .eq('user_id', user.id)
        .eq('activo', true);

      const conductoresActivos = conductores?.length || 0;
      const conductoresDisponibles = conductores?.filter(c => c.estado === 'disponible').length || 0;

      // 5. Calcular datos comparativos del mes anterior
      const { data: viajesAnterior } = await supabase
        .from('viajes')
        .select(`
          *,
          costos_viaje (
            precio_final_cobrado,
            precio_cotizado,
            costo_total_real,
            costo_total_estimado,
            margen_real,
            margen_estimado
          )
        `)
        .eq('user_id', user.id)
        .gte('created_at', mesAnterior.inicio.toISOString())
        .lte('created_at', mesAnterior.fin.toISOString());

      let ingresosAnterior = 0;
      let costosAnterior = 0;
      let margenAnterior = 0;
      
      viajesAnterior?.forEach(viaje => {
        const costos = viaje.costos_viaje?.[0];
        if (costos) {
          ingresosAnterior += costos.precio_final_cobrado || costos.precio_cotizado || 0;
          costosAnterior += costos.costo_total_real || costos.costo_total_estimado || 0;
          margenAnterior += costos.margen_real || costos.margen_estimado || 0;
        }
      });

      // 6. Obtener tendencias semanales (últimas 4 semanas)
      const tendenciasSemanales = [];
      for (let i = 3; i >= 0; i--) {
        const inicioSemana = new Date(now);
        inicioSemana.setDate(now.getDate() - (i * 7));
        const finSemana = new Date(inicioSemana);
        finSemana.setDate(inicioSemana.getDate() + 6);

        const { data: viajesSemana } = await supabase
          .from('viajes')
          .select(`
            costos_viaje (
              precio_final_cobrado,
              precio_cotizado,
              margen_real,
              margen_estimado
            )
          `)
          .eq('user_id', user.id)
          .gte('created_at', inicioSemana.toISOString())
          .lte('created_at', finSemana.toISOString());

        let ingresosSemana = 0;
        let margenSemana = 0;
        const viajesSemanaCount = viajesSemana?.length || 0;

        viajesSemana?.forEach(viaje => {
          const costos = viaje.costos_viaje?.[0];
          if (costos) {
            ingresosSemana += costos.precio_final_cobrado || costos.precio_cotizado || 0;
            margenSemana += costos.margen_real || costos.margen_estimado || 0;
          }
        });

        tendenciasSemanales.push({
          semana: format(inicioSemana, 'dd/MM'),
          ingresos: ingresosSemana,
          viajes: viajesSemanaCount,
          margen: viajesSemanaCount > 0 ? margenSemana / viajesSemanaCount : 0
        });
      }

      // 7. Analizar rutas más rentables
      const { data: analisisRutas } = await supabase
        .from('analisis_viajes')
        .select('*')
        .eq('user_id', user.id)
        .not('precio_cobrado', 'is', null)
        .not('margen_real', 'is', null);

      const rutasMap = new Map<string, {
        viajes: number;
        ingresoTotal: number;
        margenTotal: number;
        origen: string;
        destino: string;
      }>();

      analisisRutas?.forEach(analisis => {
        const rutaKey = analisis.ruta_hash;
        if (!rutasMap.has(rutaKey)) {
          rutasMap.set(rutaKey, {
            viajes: 0,
            ingresoTotal: 0,
            margenTotal: 0,
            origen: 'N/A',
            destino: 'N/A'
          });
        }
        
        const ruta = rutasMap.get(rutaKey)!;
        ruta.viajes++;
        ruta.ingresoTotal += analisis.precio_cobrado || 0;
        ruta.margenTotal += analisis.margen_real || 0;
      });

      const rutasMasRentables = Array.from(rutasMap.entries())
        .map(([hash, data]) => ({
          origen: data.origen,
          destino: data.destino,
          viajesTotal: data.viajes,
          ingresoPromedio: data.viajes > 0 ? data.ingresoTotal / data.viajes : 0,
          margenPromedio: data.viajes > 0 ? data.margenTotal / data.viajes : 0
        }))
        .sort((a, b) => b.margenPromedio - a.margenPromedio)
        .slice(0, 5);

      // 8. Calcular métricas de performance
      const eficienciaFlota = vehiculosActivos > 0 ? 
        (vehiculosActivos - vehiculosDisponibles) / vehiculosActivos * 100 : 0;

      return {
        ingresosTotales,
        costosTotales,
        margenPromedio,
        margenTotal,
        viajesCompletados,
        viajesEnTransito,
        viajesProgramados,
        kmRecorridos: 0, // Se calculará con datos de tracking
        vehiculosActivos,
        vehiculosDisponibles,
        conductoresActivos,
        conductoresDisponibles,
        puntualidadPromedio: 95, // Se calculará con datos reales de entregas
        eficienciaFlota,
        satisfaccionCliente: 4.5, // Se calculará con calificaciones reales
        comparativoPeriodoAnterior: {
          ingresos: ingresosAnterior,
          costos: costosAnterior,
          viajes: viajesAnterior?.length || 0,
          margen: margenAnterior
        },
        tendenciasSemanales,
        rutasMasRentables
      };
    },
    enabled: !!user?.id,
    refetchInterval: 5 * 60 * 1000, // Refrescar cada 5 minutos
  });
};
