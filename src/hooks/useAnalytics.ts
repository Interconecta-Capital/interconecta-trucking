
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardMetrics {
  cartasPorteActivas: number;
  vehiculosEnRuta: number;
  conductoresActivos: number;
  ingresosMes: number;
  cambioCartasPorte: number;
  cambioVehiculos: number;
  cambioConductores: number;
  cambioIngresos: number;
}

export interface RealtimeMetrics {
  vehiculosActivos: number;
  alertasActivas: number;
  eficienciaPromedio: number;
  consumoCombustible: number;
  tiempoPromedioEntrega: number;
  satisfaccionCliente: number;
}

// Add missing interfaces for dashboard components
export interface PerformanceMetrics {
  mes: string;
  eficiencia: number;
  combustible: number;
  mantenimiento: number;
  entregas: number;
}

export interface RouteMetrics {
  ruta: string;
  frecuencia: number;
  ingresoPromedio: number;
  satisfaccion: number;
  tiempoPromedio: number;
}

export interface TrendData {
  fecha: string;
  cartasPorte: number;
  ingresos: number;
  entregas: number;
}

export const useAnalytics = () => {
  const { data: dashboardMetrics, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async (): Promise<DashboardMetrics> => {
      // Obtener cartas porte del usuario actual
      const { data: cartasPorte, error } = await supabase
        .from('cartas_porte')
        .select('id, status, created_at')
        .eq('usuario_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      const ahora = new Date();
      const mesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
      const inicioMesActual = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

      // Cartas porte activas (no completadas/canceladas)
      const cartasActivas = cartasPorte?.filter(cp => 
        cp.status !== 'completado' && cp.status !== 'cancelado'
      ).length || 0;

      // Cartas del mes actual vs anterior para comparación
      const cartasMesActual = cartasPorte?.filter(cp => 
        new Date(cp.created_at) >= inicioMesActual
      ).length || 0;

      const cartasMesAnterior = cartasPorte?.filter(cp => {
        const fecha = new Date(cp.created_at);
        return fecha >= mesAnterior && fecha < inicioMesActual;
      }).length || 0;

      const cambioCartasPorte = cartasMesAnterior > 0 
        ? ((cartasMesActual - cartasMesAnterior) / cartasMesAnterior) * 100 
        : 0;

      return {
        cartasPorteActivas: cartasActivas,
        vehiculosEnRuta: Math.floor(cartasActivas * 0.7), // Estimación basada en cartas activas
        conductoresActivos: Math.floor(cartasActivas * 0.8),
        ingresosMes: cartasMesActual * 15000, // Estimación de $15,000 por carta porte
        cambioCartasPorte: Math.round(cambioCartasPorte),
        cambioVehiculos: Math.round(cambioCartasPorte * 0.8),
        cambioConductores: Math.round(cambioCartasPorte * 0.9),
        cambioIngresos: Math.round(cambioCartasPorte * 1.2)
      };
    },
    refetchInterval: 5 * 60 * 1000, // Actualizar cada 5 minutos
  });

  const { data: realtimeMetrics, isLoading: isLoadingRealtime } = useQuery({
    queryKey: ['realtime-metrics'],
    queryFn: async (): Promise<RealtimeMetrics> => {
      // Por ahora devolvemos datos simulados pero realistas
      // En el futuro se conectarán con sensores/GPS reales
      return {
        vehiculosActivos: dashboardMetrics?.vehiculosEnRuta || 0,
        alertasActivas: Math.floor(Math.random() * 5),
        eficienciaPromedio: 85 + Math.floor(Math.random() * 10),
        consumoCombustible: 15 + Math.floor(Math.random() * 5),
        tiempoPromedioEntrega: 6.5 + Math.random() * 2,
        satisfaccionCliente: 4.2 + Math.random() * 0.6
      };
    },
    enabled: !!dashboardMetrics,
    refetchInterval: 30 * 1000, // Actualizar cada 30 segundos
  });

  return {
    dashboardMetrics,
    realtimeMetrics,
    isLoadingDashboard,
    isLoadingRealtime
  };
};
