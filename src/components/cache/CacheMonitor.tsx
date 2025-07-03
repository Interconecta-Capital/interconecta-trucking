
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Database, 
  Zap, 
  TrendingUp, 
  TrendingDown,
  RotateCcw,
  Trash2,
  Activity,
  Clock
} from 'lucide-react';
import { useCacheInteligente } from '@/hooks/useCacheInteligente';

export const CacheMonitor: React.FC = () => {
  const { getMetrics, clear, invalidateByTag, preloadFrequentRoutes, preloadActiveVehicles } = useCacheInteligente();
  const [metrics, setMetrics] = useState(getMetrics());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(getMetrics());
    };

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, [getMetrics]);

  const handlePreload = async (type: 'routes' | 'vehicles') => {
    setIsLoading(true);
    try {
      if (type === 'routes') {
        await preloadFrequentRoutes();
      } else {
        await preloadActiveVehicles();
      }
      setMetrics(getMetrics());
    } catch (error) {
      console.error('Error preloading:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvalidateTag = async (tag: string) => {
    setIsLoading(true);
    try {
      await invalidateByTag(tag);
      setMetrics(getMetrics());
    } catch (error) {
      console.error('Error invalidating tag:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = () => {
    clear();
    setMetrics(getMetrics());
  };

  const hitRatePercentage = Math.round(metrics.hitRate * 100);
  const memoryUsageMB = Math.round(metrics.memoryUsage / 1024 / 1024 * 100) / 100;
  const maxMemoryMB = 50; // From SmartCacheManager

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Monitor de Cache Inteligente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Hit Rate */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Tasa de Aciertos</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {hitRatePercentage}%
              </div>
              <Progress value={hitRatePercentage} className="h-2" />
            </div>

            {/* Memory Usage */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Uso de Memoria</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {memoryUsageMB}MB
              </div>
              <Progress 
                value={(memoryUsageMB / maxMemoryMB) * 100} 
                className="h-2" 
              />
            </div>

            {/* Total Items */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Items en Cache</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {metrics.totalItems}
              </div>
              <div className="text-xs text-gray-500">
                máx: 1000 items
              </div>
            </div>

            {/* Total Requests */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium">Solicitudes</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {metrics.totalRequests}
              </div>
              <div className="text-xs text-gray-500">
                evictadas: {metrics.evictions}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cache Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-blue-600" />
            Operaciones de Cache
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Preload Operations */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Precarga Predictiva
              </h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreload('routes')}
                  disabled={isLoading}
                  className="w-full"
                >
                  Precargar Rutas Frecuentes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreload('vehicles')}
                  disabled={isLoading}
                  className="w-full"
                >
                  Precargar Vehículos Activos
                </Button>
              </div>
            </div>

            {/* Tag Invalidation */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Invalidar por Categoría
              </h4>
              <div className="space-y-2">
                {['precios', 'vehiculos', 'rutas', 'configuracion'].map((tag) => (
                  <Button
                    key={tag}
                    variant="outline"
                    size="sm"
                    onClick={() => handleInvalidateTag(tag)}
                    disabled={isLoading}
                    className="w-full"
                  >
                    Invalidar {tag}
                  </Button>
                ))}
              </div>
            </div>

            {/* Emergency Operations */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                Operaciones de Emergencia
              </h4>
              <div className="space-y-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearAll}
                  className="w-full"
                >
                  Limpiar Todo el Cache
                </Button>
                <div className="text-xs text-gray-500 text-center">
                  ⚠️ Esto eliminará todo el cache en memoria
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cache Strategy Information */}
      <Card>
        <CardHeader>
          <CardTitle>Estrategias de Cache Configuradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">APIs Externas</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Precios Combustible CRE</span>
                  <Badge variant="outline">6 horas</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Peajes INEGI</span>
                  <Badge variant="outline">24 horas</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Restricciones Urbanas</span>
                  <Badge variant="outline">7 días</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Patrones IA</span>
                  <Badge variant="outline">1 hora</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Cálculos Internos</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Costos por Vehículo-Ruta</span>
                  <Badge variant="outline">30 min</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Configuraciones Empresa</span>
                  <Badge variant="outline">hasta cambio</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Datos Vehículos</span>
                  <Badge variant="outline">1 hora</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Análisis Históricos</span>
                  <Badge variant="outline">2 horas</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
