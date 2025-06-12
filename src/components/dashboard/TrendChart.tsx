
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { TrendData } from '@/hooks/useAnalytics';

interface TrendChartProps {
  data: TrendData[];
  dateRange: '7d' | '30d' | '90d';
  onDateRangeChange: (range: '7d' | '30d' | '90d') => void;
  isLoading?: boolean;
}

const chartConfig = {
  cartasPorte: {
    label: "Cartas Porte",
    color: "hsl(var(--chart-1))",
  },
  ingresos: {
    label: "Ingresos",
    color: "hsl(var(--chart-2))",
  },
  entregas: {
    label: "Entregas",
    color: "hsl(var(--chart-3))",
  },
};

export function TrendChart({ data, dateRange, onDateRangeChange, isLoading }: TrendChartProps) {
  const dateRangeOptions = [
    { value: '7d' as const, label: '7 días' },
    { value: '30d' as const, label: '30 días' },
    { value: '90d' as const, label: '90 días' },
  ];

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
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
    fecha: new Date(item.fecha).toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric'
    }),
    ingresosK: Math.round(item.ingresos / 1000), // Convertir a miles para mejor visualización
  })) || [];

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Tendencias de Operación</CardTitle>
          <div className="flex gap-2">
            {dateRangeOptions.map((option) => (
              <Button
                key={option.value}
                variant={dateRange === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => onDateRangeChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="fecha" 
                className="text-xs"
                axisLine={false}
                tickLine={false}
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
              <ChartTooltip content={<ChartTooltipContent />} />
              
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="cartasPorte"
                stroke="var(--color-cartasPorte)"
                strokeWidth={2}
                dot={{ fill: "var(--color-cartasPorte)", r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="ingresosK"
                stroke="var(--color-ingresos)"
                strokeWidth={2}
                dot={{ fill: "var(--color-ingresos)", r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="entregas"
                stroke="var(--color-entregas)"
                strokeWidth={2}
                dot={{ fill: "var(--color-entregas)", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
