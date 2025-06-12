
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Fuel, 
  Clock, 
  Star,
  AlertTriangle,
  Truck
} from 'lucide-react';

interface RealtimeMetricsProps {
  metrics: {
    vehiculosActivos: number;
    alertasActivas: number;
    eficienciaPromedio: number;
    consumoCombustible: number;
    tiempoPromedioEntrega: number;
    satisfaccionCliente: number;
  };
  isLoading?: boolean;
}

export function RealtimeMetrics({ metrics, isLoading }: RealtimeMetricsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const metricsItems = [
    {
      label: 'Vehículos Activos',
      value: metrics.vehiculosActivos,
      icon: Truck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      suffix: '',
    },
    {
      label: 'Alertas Activas',
      value: metrics.alertasActivas,
      icon: AlertTriangle,
      color: metrics.alertasActivas > 3 ? 'text-red-600' : 'text-yellow-600',
      bgColor: metrics.alertasActivas > 3 ? 'bg-red-100' : 'bg-yellow-100',
      suffix: '',
    },
    {
      label: 'Eficiencia Promedio',
      value: metrics.eficienciaPromedio,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      suffix: '%',
    },
    {
      label: 'Consumo Combustible',
      value: metrics.consumoCombustible,
      icon: Fuel,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      suffix: '%',
    },
    {
      label: 'Tiempo Prom. Entrega',
      value: metrics.tiempoPromedioEntrega,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      suffix: 'h',
    },
    {
      label: 'Satisfacción Cliente',
      value: metrics.satisfaccionCliente,
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      suffix: '/5',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Métricas en Tiempo Real</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600">Actualizando cada 30s</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metricsItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {item.label}
                </span>
              </div>
              <Badge 
                variant="secondary" 
                className="font-bold"
              >
                {typeof item.value === 'number' 
                  ? item.value % 1 === 0 
                    ? item.value 
                    : item.value.toFixed(1)
                  : item.value
                }{item.suffix}
              </Badge>
            </div>
          ))}
        </div>
        
        {/* Indicadores de estado */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Sistema Operativo</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Datos Sincronizados</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
