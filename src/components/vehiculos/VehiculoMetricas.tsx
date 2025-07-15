import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Fuel, Clock, DollarSign, Route } from 'lucide-react';

interface VehiculoMetricasProps {
  vehiculoId: string;
  compact?: boolean;
}

interface Metricas {
  viajesCompletados: number;
  kmRecorridos: number;
  horasOperacion: number;
  ingresosTotales: number;
  costosTotales: number;
  eficienciaCombustible: number;
  puntualidad: number;
  tendenciaViajes: 'up' | 'down' | 'stable';
  tendenciaIngresos: 'up' | 'down' | 'stable';
}

export function VehiculoMetricas({ vehiculoId, compact = false }: VehiculoMetricasProps) {
  // Simulamos datos para demostración - en producción vendría de la base de datos
  const metricas: Metricas = {
    viajesCompletados: 45,
    kmRecorridos: 12500,
    horasOperacion: 340,
    ingresosTotales: 125000,
    costosTotales: 85000,
    eficienciaCombustible: 8.5,
    puntualidad: 92,
    tendenciaViajes: 'up',
    tendenciaIngresos: 'up'
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-success" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-destructive" />;
      default:
        return <Minus className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  if (compact) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <Route className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Viajes</span>
          </div>
          <p className="text-lg font-bold mt-1">{metricas.viajesCompletados}</p>
        </div>
        
        <div className="p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <Fuel className="h-4 w-4 text-warning" />
            <span className="text-xs text-muted-foreground">km/L</span>
          </div>
          <p className="text-lg font-bold mt-1">{metricas.eficienciaCombustible}</p>
        </div>
        
        <div className="p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-info" />
            <span className="text-xs text-muted-foreground">Puntualidad</span>
          </div>
          <p className="text-lg font-bold mt-1">{metricas.puntualidad}%</p>
        </div>
        
        <div className="p-3 border rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-success" />
            <span className="text-xs text-muted-foreground">Margen</span>
          </div>
          <p className="text-lg font-bold mt-1">
            {Math.round(((metricas.ingresosTotales - metricas.costosTotales) / metricas.ingresosTotales) * 100)}%
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Viajes */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Route className="h-4 w-4" />
              Viajes Completados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{metricas.viajesCompletados}</span>
              <div className="flex items-center gap-1">
                {getTrendIcon(metricas.tendenciaViajes)}
                <span className={`text-sm ${getTrendColor(metricas.tendenciaViajes)}`}>
                  +8 este mes
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kilómetros */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Route className="h-4 w-4" />
              Kilómetros Recorridos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{metricas.kmRecorridos.toLocaleString()}</span>
              <Badge variant="outline" className="text-xs">
                {Math.round(metricas.kmRecorridos / metricas.viajesCompletados)} km/viaje
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Horas de Operación */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Horas de Operación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">{metricas.horasOperacion}</span>
              <Badge variant="outline" className="text-xs">
                {Math.round(metricas.horasOperacion / metricas.viajesCompletados)} h/viaje
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rendimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rendimiento Financiero</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Ingresos Totales</span>
              <div className="flex items-center gap-1">
                <span className="font-bold text-success">
                  ${metricas.ingresosTotales.toLocaleString()}
                </span>
                {getTrendIcon(metricas.tendenciaIngresos)}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Costos Totales</span>
              <span className="font-bold text-destructive">
                ${metricas.costosTotales.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm font-medium">Margen de Ganancia</span>
              <span className="font-bold text-lg">
                {Math.round(((metricas.ingresosTotales - metricas.costosTotales) / metricas.ingresosTotales) * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia Operacional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Eficiencia Combustible</span>
              <div className="flex items-center gap-1">
                <Fuel className="h-3 w-3 text-warning" />
                <span className="font-bold">{metricas.eficienciaCombustible} km/L</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Puntualidad</span>
              <span className="font-bold">{metricas.puntualidad}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Tiempo Promedio</span>
              <span className="font-bold">
                {Math.round(metricas.horasOperacion / metricas.viajesCompletados)}h por viaje
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}