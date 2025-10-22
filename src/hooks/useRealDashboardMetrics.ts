import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardMetrics {
  ingresosDelMes: number;
  ingresosComparacion: string;
  margenPromedio: number;
  margenComparacion: string;
  viajesCompletados: number;
  viajesComparacion: string;
  utilizacionFlota: number;
  utilizacionComparacion: string;
}

export const useRealDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async (): Promise<DashboardMetrics> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Fechas para comparación
      const now = new Date();
      const inicioMesActual = new Date(now.getFullYear(), now.getMonth(), 1);
      const inicioMesAnterior = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const finMesAnterior = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

      // 1. Ingresos del mes actual
      const { data: viajesActuales, error: errorActuales } = await supabase
        .from('viajes')
        .select('precio_cobrado')
        .eq('user_id', user.id)
        .gte('created_at', inicioMesActual.toISOString());

      if (errorActuales) throw errorActuales;

      const ingresosDelMes = (viajesActuales as any[])?.reduce((sum: number, v: any) => sum + (v.precio_cobrado || 0), 0) || 0;

      // 2. Ingresos del mes anterior para comparación
      const { data: viajesAnteriores, error: errorAnteriores } = await supabase
        .from('viajes')
        .select('precio_cobrado')
        .eq('user_id', user.id)
        .gte('created_at', inicioMesAnterior.toISOString())
        .lte('created_at', finMesAnterior.toISOString());

      if (errorAnteriores) throw errorAnteriores;

      const ingresosDelMesAnterior = (viajesAnteriores as any[])?.reduce((sum: number, v: any) => sum + (v.precio_cobrado || 0), 0) || 0;
      
      // Calcular cambio porcentual
      const calcularCambio = (actual: number, anterior: number): string => {
        if (anterior === 0) return actual > 0 ? '+100%' : '0%';
        const cambio = ((actual - anterior) / anterior) * 100;
        return `${cambio >= 0 ? '+' : ''}${cambio.toFixed(1)}%`;
      };

      // 3. Margen promedio (usando precio_cobrado y costo_real)
      const { data: viajesConGastos } = await supabase
        .from('viajes')
        .select('precio_cobrado, costo_real')
        .eq('user_id', user.id)
        .gte('created_at', inicioMesActual.toISOString())
        .not('precio_cobrado', 'is', null)
        .gt('precio_cobrado', 0);

      let margenPromedio = 0;
      if (viajesConGastos && viajesConGastos.length > 0) {
        const margenes = (viajesConGastos as any[]).map((v: any) => {
          const precio = v.precio_cobrado || 0;
          const costo = v.costo_real || 0;
          return precio > 0 ? ((precio - costo) / precio) * 100 : 0;
        });
        margenPromedio = margenes.reduce((sum: number, m: number) => sum + m, 0) / margenes.length;
      }

      // Margen mes anterior
      const { data: viajesAnterioresGastos } = await supabase
        .from('viajes')
        .select('precio_cobrado, costo_real')
        .eq('user_id', user.id)
        .gte('created_at', inicioMesAnterior.toISOString())
        .lte('created_at', finMesAnterior.toISOString())
        .not('precio_cobrado', 'is', null)
        .gt('precio_cobrado', 0);

      let margenAnterior = 0;
      if (viajesAnterioresGastos && viajesAnterioresGastos.length > 0) {
        const margenes = (viajesAnterioresGastos as any[]).map((v: any) => {
          const precio = v.precio_cobrado || 0;
          const costo = v.costo_real || 0;
          return precio > 0 ? ((precio - costo) / precio) * 100 : 0;
        });
        margenAnterior = margenes.reduce((sum: number, m: number) => sum + m, 0) / margenes.length;
      }

      // 4. Viajes completados
      const viajesCompletados = (viajesActuales as any[])?.length || 0;
      const viajesCompletadosAnterior = (viajesAnteriores as any[])?.length || 0;

      // 5. Utilización de flota - usar count del hook existente
      const utilizacionFlota = 0; // Se puede mejorar después

      return {
        ingresosDelMes,
        ingresosComparacion: calcularCambio(ingresosDelMes, ingresosDelMesAnterior),
        margenPromedio,
        margenComparacion: calcularCambio(margenPromedio, margenAnterior),
        viajesCompletados,
        viajesComparacion: calcularCambio(viajesCompletados, viajesCompletadosAnterior),
        utilizacionFlota,
        utilizacionComparacion: '+0%',
      };
    },
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });
};
