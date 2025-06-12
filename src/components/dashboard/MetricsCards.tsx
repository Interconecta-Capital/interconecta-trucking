
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  Truck, 
  Users, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import { DashboardMetrics } from '@/hooks/useAnalytics';

interface MetricsCardsProps {
  metrics: DashboardMetrics;
  isLoading?: boolean;
}

export function MetricsCards({ metrics, isLoading }: MetricsCardsProps) {
  const cards = [
    {
      title: "Cartas Porte Activas",
      value: metrics?.cartasPorteActivas?.toLocaleString() || "0",
      change: metrics?.cambioCartasPorte || 0,
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "Vehículos en Ruta",
      value: metrics?.vehiculosEnRuta?.toString() || "0",
      change: metrics?.cambioVehiculos || 0,
      icon: Truck,
      color: "text-green-600"
    },
    {
      title: "Conductores Activos",
      value: metrics?.conductoresActivos?.toString() || "0",
      change: metrics?.cambioConductores || 0,
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "Ingresos del Mes",
      value: `$${(metrics?.ingresosMes || 0).toLocaleString()}`,
      change: metrics?.cambioIngresos || 0,
      icon: DollarSign,
      color: "text-orange-600"
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-5 w-5 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const isPositive = card.change >= 0;
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;
        
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {card.value}
              </div>
              <div className="flex items-center text-xs">
                <TrendIcon className={`h-3 w-3 mr-1 ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`} />
                <span className={`font-medium ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(card.change)}%
                </span>
                <span className="text-gray-600 ml-1">vs mes anterior</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
