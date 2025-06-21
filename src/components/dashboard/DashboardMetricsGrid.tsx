
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FileText, 
  Truck, 
  Users, 
  UserCheck,
  Brain,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';

interface DashboardMetricsGridProps {
  isLoading: boolean;
  totalCartasPorte: number;
  cartasPendientes: number;
  cartasCompletadas: number;
  totalVehiculos: number;
  vehiculosDisponibles: number;
  vehiculosEnUso: number;
  vehiculosMantenimiento: number;
  totalConductores: number;
  conductoresDisponibles: number;
  conductoresEnViaje: number;
  totalSocios: number;
  sociosActivos: number;
}

export function DashboardMetricsGrid({
  isLoading,
  totalCartasPorte,
  cartasPendientes,
  cartasCompletadas,
  totalVehiculos,
  vehiculosDisponibles,
  vehiculosEnUso,
  vehiculosMantenimiento,
  totalConductores,
  conductoresDisponibles,
  conductoresEnViaje,
  totalSocios,
  sociosActivos,
}: DashboardMetricsGridProps) {
  
  const getEfficiencyColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (value: number, threshold: number) => {
    if (value >= threshold) return <TrendingUp className="h-4 w-4 text-green-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const hasAIInsights = (total: number) => total > 0;

  const metrics = [
    {
      title: 'Cartas Porte',
      total: totalCartasPorte,
      subtitle: `${cartasCompletadas} completadas • ${cartasPendientes} pendientes`,
      icon: FileText,
      progress: totalCartasPorte > 0 ? (cartasCompletadas / totalCartasPorte) * 100 : 0,
      color: 'blue',
      hasInsights: hasAIInsights(totalCartasPorte)
    },
    {
      title: 'Vehículos',
      total: totalVehiculos,
      subtitle: `${vehiculosDisponibles} disponibles • ${vehiculosEnUso} en uso`,
      icon: Truck,
      progress: totalVehiculos > 0 ? (vehiculosDisponibles / totalVehiculos) * 100 : 0,
      color: 'green',
      hasInsights: hasAIInsights(totalVehiculos)
    },
    {
      title: 'Conductores',
      total: totalConductores,
      subtitle: `${conductoresDisponibles} disponibles • ${conductoresEnViaje} en viaje`,
      icon: Users,
      progress: totalConductores > 0 ? (conductoresDisponibles / totalConductores) * 100 : 0,
      color: 'purple',
      hasInsights: hasAIInsights(totalConductores)
    },
    {
      title: 'Socios',
      total: totalSocios,
      subtitle: `${sociosActivos} activos`,
      icon: UserCheck,
      progress: totalSocios > 0 ? (sociosActivos / totalSocios) * 100 : 0,
      color: 'orange',
      hasInsights: hasAIInsights(totalSocios)
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'text-blue-interconecta bg-blue-light',
      green: 'text-green-600 bg-green-50',
      purple: 'text-purple-600 bg-purple-50',
      orange: 'text-orange-600 bg-orange-50'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-10 rounded-xl" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-2 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <Card key={index} className="group hover:shadow-lg transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${getColorClasses(metric.color)} transition-all duration-200 group-hover:scale-105`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold text-gray-90">
                    {metric.title}
                  </CardTitle>
                  {metric.hasInsights && (
                    <Badge variant="outline" className="mt-1 text-xs gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 border-purple-200">
                      <Brain className="h-3 w-3" />
                      <span>IA</span>
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-gray-90">{metric.total}</div>
                {metric.total > 0 && getTrendIcon(metric.progress, 70)}
              </div>
              
              <p className="text-sm text-gray-60">
                {metric.subtitle}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-60">Eficiencia</span>
                  <span className={`font-medium ${getEfficiencyColor(metric.progress)}`}>
                    {Math.round(metric.progress)}%
                  </span>
                </div>
                <Progress 
                  value={metric.progress} 
                  className="h-2" 
                />
              </div>

              {metric.hasInsights && (
                <div className="flex items-center gap-2 pt-2 text-xs text-purple-600 border-t border-gray-10">
                  <Activity className="h-3 w-3" />
                  <span>Insights disponibles</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
