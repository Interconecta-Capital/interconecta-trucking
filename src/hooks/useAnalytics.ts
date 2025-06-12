
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

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

export interface TrendData {
  fecha: string;
  cartasPorte: number;
  ingresos: number;
  entregas: number;
}

export interface RouteMetrics {
  ruta: string;
  frecuencia: number;
  ingresoPromedio: number;
  tiempoPromedio: number;
  satisfaccion: number;
}

export interface PerformanceMetrics {
  mes: string;
  eficiencia: number;
  combustible: number;
  mantenimiento: number;
  entregas: number;
}

// Función para generar datos simulados realistas
const generateMockData = () => {
  const today = new Date();
  const trendData: TrendData[] = [];
  
  // Generar datos de los últimos 30 días
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const baseCartasPorte = 120 + Math.sin(i * 0.1) * 20;
    const baseIngresos = 2200000 + Math.sin(i * 0.15) * 400000;
    
    trendData.push({
      fecha: date.toISOString().split('T')[0],
      cartasPorte: Math.round(baseCartasPorte + (Math.random() - 0.5) * 30),
      ingresos: Math.round(baseIngresos + (Math.random() - 0.5) * 200000),
      entregas: Math.round(baseCartasPorte * 0.85 + (Math.random() - 0.5) * 15),
    });
  }

  const routeMetrics: RouteMetrics[] = [
    {
      ruta: 'CDMX - Guadalajara',
      frecuencia: 45,
      ingresoPromedio: 28500,
      tiempoPromedio: 7.5,
      satisfaccion: 4.8,
    },
    {
      ruta: 'Monterrey - Tijuana',
      frecuencia: 32,
      ingresoPromedio: 42000,
      tiempoPromedio: 12.2,
      satisfaccion: 4.6,
    },
    {
      ruta: 'Puebla - Cancún',
      frecuencia: 28,
      ingresoPromedio: 38200,
      tiempoPromedio: 14.5,
      satisfaccion: 4.7,
    },
    {
      ruta: 'CDMX - Veracruz',
      frecuencia: 38,
      ingresoPromedio: 22800,
      tiempoPromedio: 6.5,
      satisfaccion: 4.9,
    },
    {
      ruta: 'Guadalajara - León',
      frecuencia: 25,
      ingresoPromedio: 18500,
      tiempoPromedio: 4.2,
      satisfaccion: 4.5,
    },
  ];

  const performanceData: PerformanceMetrics[] = [
    { mes: 'Ene', eficiencia: 92, combustible: 85, mantenimiento: 78, entregas: 95 },
    { mes: 'Feb', eficiencia: 89, combustible: 82, mantenimiento: 85, entregas: 93 },
    { mes: 'Mar', eficiencia: 94, combustible: 88, mantenimiento: 82, entregas: 97 },
    { mes: 'Abr', eficiencia: 91, combustible: 86, mantenimiento: 79, entregas: 94 },
    { mes: 'May', eficiencia: 96, combustible: 90, mantenimiento: 88, entregas: 98 },
    { mes: 'Jun', eficiencia: 93, combustible: 87, mantenimiento: 86, entregas: 96 },
  ];

  return { trendData, routeMetrics, performanceData };
};

export function useAnalytics() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Métricas principales del dashboard
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async (): Promise<DashboardMetrics> => {
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      return {
        cartasPorteActivas: 127,
        vehiculosEnRuta: 23,
        conductoresActivos: 45,
        ingresosMes: 2340500,
        cambioCartasPorte: 12,
        cambioVehiculos: 5,
        cambioConductores: 8,
        cambioIngresos: 15,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Datos de tendencias y gráficos
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['analytics-data', dateRange],
    queryFn: async () => {
      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      return generateMockData();
    },
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  // Métricas de rendimiento en tiempo real
  const { data: realtimeMetrics, isLoading: realtimeLoading } = useQuery({
    queryKey: ['realtime-metrics'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        vehiculosActivos: 23,
        alertasActivas: 2,
        eficienciaPromedio: 94.2,
        consumoCombustible: 87.5,
        tiempoPromedioEntrega: 8.3,
        satisfaccionCliente: 4.7,
      };
    },
    refetchInterval: 30000, // Actualizar cada 30 segundos
    staleTime: 25000,
  });

  const updateDateRange = (range: '7d' | '30d' | '90d') => {
    setDateRange(range);
  };

  return {
    metrics,
    chartData,
    realtimeMetrics,
    dateRange,
    updateDateRange,
    isLoading: metricsLoading || chartLoading,
    isRealtimeLoading: realtimeLoading,
  };
}
