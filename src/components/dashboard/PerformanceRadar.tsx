
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { PerformanceMetrics } from '@/hooks/useAnalytics';
import { TrendingUp } from 'lucide-react';

interface PerformanceRadarProps {
  data: PerformanceMetrics[];
  isLoading?: boolean;
}

const chartConfig = {
  eficiencia: {
    label: "Eficiencia",
    color: "hsl(var(--chart-1))",
  },
  combustible: {
    label: "Combustible",
    color: "hsl(var(--chart-2))",
  },
  mantenimiento: {
    label: "Mantenimiento",
    color: "hsl(var(--chart-3))",
  },
  entregas: {
    label: "Entregas",
    color: "hsl(var(--chart-4))",
  },
};

export function PerformanceRadar({ data, isLoading }: PerformanceRadarProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-36 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-80 bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  // Usar solo el último mes para el radar
  const latestData = data?.[data.length - 1];
  
  const radarData = latestData ? [
    {
      metric: 'Eficiencia',
      value: latestData.eficiencia,
      fullMark: 100,
    },
    {
      metric: 'Combustible',
      value: latestData.combustible,
      fullMark: 100,
    },
    {
      metric: 'Mantenimiento',
      value: latestData.mantenimiento,
      fullMark: 100,
    },
    {
      metric: 'Entregas',
      value: latestData.entregas,
      fullMark: 100,
    },
  ] : [];

  // Calcular promedio general
  const promedio = radarData.length > 0 
    ? Math.round(radarData.reduce((sum, item) => sum + item.value, 0) / radarData.length)
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg font-semibold">Rendimiento General</CardTitle>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{promedio}%</div>
            <div className="text-xs text-gray-600">Promedio General</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid className="stroke-muted" />
              <PolarAngleAxis 
                dataKey="metric" 
                className="text-xs fill-foreground"
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                className="text-xs fill-muted-foreground"
                tickCount={5}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Radar
                name="Rendimiento"
                dataKey="value"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        {/* Métricas detalladas */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {radarData.map((item, index) => {
            const isGood = item.value >= 85;
            const isWarning = item.value >= 70 && item.value < 85;
            
            return (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">{item.metric}</span>
                <span className={`text-sm font-bold ${
                  isGood ? 'text-green-600' : 
                  isWarning ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {item.value}%
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
