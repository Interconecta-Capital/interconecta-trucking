
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

export interface RouteMetrics {
  ruta: string;
  frecuencia: number;
  ingresoPromedio: number;
  satisfaccion: number;
  tiempoPromedio: number;
}

export interface PerformanceMetrics {
  mes: string;
  eficiencia: number;
  combustible: number;
  mantenimiento: number;
  entregas: number;
}

export interface TrendData {
  fecha: string;
  cartasPorte: number;
  ingresos: number;
  entregas: number;
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

  // Mock data para las rutas
  const mockRouteMetrics: RouteMetrics[] = [
    {
      ruta: "Ciudad de México - Guadalajara",
      frecuencia: 15,
      ingresoPromedio: 85000,
      satisfaccion: 4.8,
      tiempoPromedio: 6.5
    },
    {
      ruta: "Monterrey - Ciudad de México",
      frecuencia: 12,
      ingresoPromedio: 78000,
      satisfaccion: 4.6,
      tiempoPromedio: 8.2
    },
    {
      ruta: "Guadalajara - Tijuana",
      frecuencia: 8,
      ingresoPromedio: 95000,
      satisfaccion: 4.9,
      tiempoPromedio: 12.0
    }
  ];

  // Mock data para performance
  const mockPerformanceMetrics: PerformanceMetrics[] = [
    { mes: "Enero", eficiencia: 92, combustible: 88, mantenimiento: 95, entregas: 90 },
    { mes: "Febrero", eficiencia: 94, combustible: 85, mantenimiento: 92, entregas: 93 },
    { mes: "Marzo", eficiencia: 89, combustible: 90, mantenimiento: 88, entregas: 95 }
  ];

  // Mock data para tendencias
  const mockTrendData: TrendData[] = [
    { fecha: "2024-01-01", cartasPorte: 45, ingresos: 125000, entregas: 42 },
    { fecha: "2024-01-02", cartasPorte: 52, ingresos: 138000, entregas: 48 },
    { fecha: "2024-01-03", cartasPorte: 38, ingresos: 112000, entregas: 35 },
    { fecha: "2024-01-04", cartasPorte: 61, ingresos: 155000, entregas: 58 },
    { fecha: "2024-01-05", cartasPorte: 47, ingresos: 128000, entregas: 44 }
  ];

  return {
    metrics,
    isLoading,
    routeMetrics: mockRouteMetrics,
    performanceMetrics: mockPerformanceMetrics,
    trendData: mockTrendData,
  };
};
