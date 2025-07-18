
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { startOfDay, endOfDay, format } from 'date-fns';

export interface RealTimeMetrics {
  // Métricas operacionales actuales
  viajesHoy: number;
  viajesEnCurso: number;
  conductoresActivos: number;
  vehiculosEnUso: number;
  
  // Métricas financieras del día
  ingresosHoy: number;
  costosHoy: number;
  margenHoy: number;
  
  // Alertas y estado del sistema
  alertasUrgentes: number;
  documentosPendientes: number;
  mantenimientosPendientes: number;
  
  // Performance en tiempo real
  eficienciaFlota: number;
  puntualidadPromedio: number;
  utilizacionRecursos: number;
  
  // Comparativas con ayer
  comparativas: {
    viajes: { actual: number; anterior: number; cambio: number };
    ingresos: { actual: number; anterior: number; cambio: number };
    eficiencia: { actual: number; anterior: number; cambio: number };
  };
}

export const useRealTimeMetrics = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['real-time-metrics', user?.id],
    queryFn: async (): Promise<RealTimeMetrics> => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      const hoy = new Date();
      const ayer = new Date(hoy);
      ayer.setDate(ayer.getDate() - 1);

      // 1. Métricas de viajes hoy
      const { data: viajesHoy } = await supabase
        .from('viajes')
        .select('id, estado, created_at')
        .eq('user_id', user.id)
        .gte('created_at', startOfDay(hoy).toISOString())
        .lte('created_at', endOfDay(hoy).toISOString());

      const viajesHoyCount = viajesHoy?.length || 0;
      const viajesEnCurso = viajesHoy?.filter(v => v.estado === 'en_transito').length || 0;

      // 2. Métricas de ayer para comparación
      const { data: viajesAyer } = await supabase
        .from('viajes')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', startOfDay(ayer).toISOString())
        .lte('created_at', endOfDay(ayer).toISOString());

      const viajesAyerCount = viajesAyer?.length || 0;

      // 3. Métricas financieras del día
      const { data: costosHoy } = await supabase
        .from('costos_viaje')
        .select('precio_final_cobrado, costo_total_real, margen_real')
        .eq('user_id', user.id)
        .gte('created_at', startOfDay(hoy).toISOString())
        .lte('created_at', endOfDay(hoy).toISOString());

      const ingresosHoy = costosHoy?.reduce((sum, c) => sum + (c.precio_final_cobrado || 0), 0) || 0;
      const costosHoyTotal = costosHoy?.reduce((sum, c) => sum + (c.costo_total_real || 0), 0) || 0;
      const margenHoy = costosHoy?.reduce((sum, c) => sum + (c.margen_real || 0), 0) || 0;

      // 4. Métricas de recursos activos
      const { data: conductores } = await supabase
        .from('conductores')
        .select('estado')
        .eq('user_id', user.id)
        .eq('activo', true);

      const conductoresActivos = conductores?.filter(c => c.estado !== 'inactivo').length || 0;

      const { data: vehiculos } = await supabase
        .from('vehiculos')
        .select('estado')
        .eq('user_id', user.id)
        .eq('activo', true);

      const vehiculosEnUso = vehiculos?.filter(v => v.estado === 'en_transito').length || 0;
      const totalVehiculos = vehiculos?.length || 1;

      // 5. Documentos y alertas pendientes
      const { data: cartasPendientes } = await supabase
        .from('cartas_porte')
        .select('id')
        .eq('usuario_id', user.id)
        .eq('status', 'borrador');

      const documentosPendientes = cartasPendientes?.length || 0;

      // 6. Cálculos de performance
      const eficienciaFlota = totalVehiculos > 0 ? (vehiculosEnUso / totalVehiculos) * 100 : 0;
      const puntualidadPromedio = 92; // Se calculará con datos reales de entregas
      const utilizacionRecursos = conductoresActivos > 0 ? (viajesEnCurso / conductoresActivos) * 100 : 0;

      // 7. Métricas de comparación
      const cambioViajes = viajesAyerCount > 0 ? ((viajesHoyCount - viajesAyerCount) / viajesAyerCount) * 100 : 0;

      // 8. Ingresos de ayer para comparación
      const { data: costosAyer } = await supabase
        .from('costos_viaje')
        .select('precio_final_cobrado')
        .eq('user_id', user.id)
        .gte('created_at', startOfDay(ayer).toISOString())
        .lte('created_at', endOfDay(ayer).toISOString());

      const ingresosAyer = costosAyer?.reduce((sum, c) => sum + (c.precio_final_cobrado || 0), 0) || 0;
      const cambioIngresos = ingresosAyer > 0 ? ((ingresosHoy - ingresosAyer) / ingresosAyer) * 100 : 0;

      return {
        viajesHoy: viajesHoyCount,
        viajesEnCurso,
        conductoresActivos,
        vehiculosEnUso,
        ingresosHoy,
        costosHoy: costosHoyTotal,
        margenHoy,
        alertasUrgentes: documentosPendientes > 5 ? 1 : 0,
        documentosPendientes,
        mantenimientosPendientes: 0, // Se implementará con datos de mantenimiento
        eficienciaFlota,
        puntualidadPromedio,
        utilizacionRecursos,
        comparativas: {
          viajes: {
            actual: viajesHoyCount,
            anterior: viajesAyerCount,
            cambio: cambioViajes
          },
          ingresos: {
            actual: ingresosHoy,
            anterior: ingresosAyer,
            cambio: cambioIngresos
          },
          eficiencia: {
            actual: eficienciaFlota,
            anterior: 85, // Se calculará con histórico
            cambio: eficienciaFlota - 85
          }
        }
      };
    },
    enabled: !!user?.id,
    refetchInterval: 30000, // Actualizar cada 30 segundos
  });
};
