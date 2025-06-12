
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { RouteMetrics } from '@/hooks/useAnalytics';
import { MapPin } from 'lucide-react';

interface RoutePerformanceChartProps {
  data: RouteMetrics[];
  isLoading?: boolean;
}

const chartConfig = {
  frecuencia: {
    label: "Frecuencia",
    color: "hsl(var(--chart-1))",
  },
  ingresoPromedio: {
    label: "Ingreso Promedio",
    color: "hsl(var(--chart-2))",
  },
};

export function RoutePerformanceChart({ data, isLoading }: RoutePerformanceChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  // Formatear datos para el gráfico
  const chartData = data?.map(item => ({
    ...item,
    rutaCorta: item.ruta.split(' - ').map(city => 
      city.length > 8 ? city.substring(0, 8) + '...' : city
    ).join(' - '),
    ingresoK: Math.round(item.ingresoPromedio / 1000),
  })) || [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg font-semibold">Rendimiento por Ruta</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="rutaCorta" 
                className="text-xs"
                axisLine={false}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                yAxisId="left"
                className="text-xs"
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                className="text-xs"
                axisLine={false}
                tickLine={false}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                labelFormatter={(label, payload) => {
                  const originalData = data?.find(d => d.ruta.includes(label.replace('...', '')));
                  return originalData?.ruta || label;
                }}
              />
              
              <Bar
                yAxisId="left"
                dataKey="frecuencia"
                fill="var(--color-frecuencia)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="ingresoK"
                fill="var(--color-ingresoPromedio)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Leyenda personalizada con métricas adicionales */}
        <div className="mt-4 space-y-2">
          {data?.slice(0, 3).map((route, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm font-medium">{route.ruta}</span>
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <span>⭐ {route.satisfaccion}</span>
                <span>⏱️ {route.tiempoPromedio}h</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
