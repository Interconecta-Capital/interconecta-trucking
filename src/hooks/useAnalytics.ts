
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface DashboardMetrics {
  cartasPorteActivas: number;
  vehiculosEnRuta: number;
  conductoresActivos: number;
  ingresosMes: number;
  activeTrips: number;
  todayDeliveries: number;
  cambioCartasPorte: number;
  cambioVehiculos: number;
  cambioConductores: number;
  cambioIngresos: number;
}

export const useAnalytics = () => {
  const { user } = useAuth();

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['dashboard-metrics', user?.id],
    queryFn: async (): Promise<DashboardMetrics> => {
      if (!user?.id) {
        return {
          cartasPorteActivas: 0,
          vehiculosEnRuta: 0,
          conductoresActivos: 0,
          ingresosMes: 0,
          activeTrips: 0,
          todayDeliveries: 0,
          cambioCartasPorte: 0,
          cambioVehiculos: 0,
          cambioConductores: 0,
          cambioIngresos: 0,
        };
      }

      // Simular datos para el dashboard
      // En una aplicación real, estas consultas serían a la base de datos
      const mockMetrics: DashboardMetrics = {
        cartasPorteActivas: 45,
        vehiculosEnRuta: 12,
        conductoresActivos: 8,
        ingresosMes: 125000,
        activeTrips: 12,
        todayDeliveries: 8,
        cambioCartasPorte: 5,
        cambioVehiculos: 2,
        cambioConductores: -1,
        cambioIngresos: 12,
      };

      return mockMetrics;
    },
    enabled: !!user?.id,
  });

  return {
    metrics,
    isLoading,
  };
};
