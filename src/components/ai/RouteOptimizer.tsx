
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Route, MapPin, Clock, Fuel, TrendingUp, Loader2 } from 'lucide-react';
import { geminiCore } from '@/services/ai/GeminiCoreService';
import { useAIContext } from '@/hooks/ai/useAIContext';
import { toast } from 'sonner';

interface RouteOptimizerProps {
  ubicaciones: any[];
  vehiculo?: any;
  onRouteOptimized?: (optimizedRoute: any) => void;
  className?: string;
}

export function RouteOptimizer({
  ubicaciones,
  vehiculo,
  onRouteOptimized,
  className
}: RouteOptimizerProps) {
  const { context } = useAIContext();
  const [optimizing, setOptimizing] = useState(false);
  const [optimizedRoute, setOptimizedRoute] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const canOptimize = ubicaciones.length >= 2;

  useEffect(() => {
    // Auto-optimize when we have enough locations
    if (canOptimize && !optimizedRoute) {
      handleOptimize();
    }
  }, [ubicaciones, canOptimize]);

  const handleOptimize = async () => {
    if (!canOptimize) {
      toast.error('Se necesitan al menos 2 ubicaciones');
      return;
    }

    setOptimizing(true);
    try {
      const origin = ubicaciones.find(u => u.tipoUbicacion === 'Origen');
      const destination = ubicaciones.find(u => u.tipoUbicacion === 'Destino');
      const waypoints = ubicaciones.filter(u => u.tipoUbicacion === 'Paso Intermedio');

      if (!origin || !destination) {
        toast.error('Se requiere origen y destino');
        return;
      }

      const result = await geminiCore.optimizeRoute(
        origin,
        destination,
        waypoints,
        {
          ...context,
          vehicleInfo: vehiculo,
          optimization: 'balanced' // time, fuel, or balanced
        }
      );

      setOptimizedRoute(result);
      setSuggestions(result.suggestions || []);
      onRouteOptimized?.(result);
      
      toast.success('Ruta optimizada con IA');
    } catch (error) {
      console.error('Error optimizing route:', error);
      toast.error('Error al optimizar ruta');
    } finally {
      setOptimizing(false);
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDistance = (km: number): string => {
    return km >= 1 ? `${km.toFixed(1)} km` : `${(km * 1000).toFixed(0)} m`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            <span>Optimización de Ruta IA</span>
          </div>
          <Button
            onClick={handleOptimize}
            disabled={!canOptimize || optimizing}
            size="sm"
            className="flex items-center gap-2"
          >
            {optimizing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
            {optimizing ? 'Optimizando...' : 'Optimizar'}
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {!canOptimize && (
          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              Agregue al menos origen y destino para optimizar la ruta
            </AlertDescription>
          </Alert>
        )}

        {optimizedRoute && (
          <div className="space-y-4">
            {/* Route Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Tiempo</span>
                </div>
                <div className="text-lg font-bold text-blue-900">
                  {formatTime(optimizedRoute.estimatedTime)}
                </div>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">Distancia</span>
                </div>
                <div className="text-lg font-bold text-green-900">
                  {formatDistance(optimizedRoute.estimatedDistance)}
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-amber-700">
                  <Fuel className="h-4 w-4" />
                  <span className="text-sm font-medium">Combustible</span>
                </div>
                <div className="text-lg font-bold text-amber-900">
                  {optimizedRoute.fuelEfficiency.toFixed(1)} L
                </div>
              </div>

              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-purple-700">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Eficiencia</span>
                </div>
                <div className="text-lg font-bold text-purple-900">
                  {Math.round((optimizedRoute.fuelEfficiency / optimizedRoute.estimatedDistance) * 100)}%
                </div>
              </div>
            </div>

            {/* Optimized Route Sequence */}
            <div>
              <h4 className="font-medium mb-2">Secuencia Optimizada:</h4>
              <div className="space-y-2">
                {optimizedRoute.optimizedRoute.map((location: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <Badge variant="outline">{index + 1}</Badge>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {location.nombreRemitenteDestinatario || `Ubicación ${index + 1}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {location.tipoUbicacion} - {location.domicilio?.calle}, {location.domicilio?.municipio}
                      </div>
                    </div>
                    <Badge 
                      variant={
                        location.tipoUbicacion === 'Origen' ? 'default' :
                        location.tipoUbicacion === 'Destino' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {location.tipoUbicacion}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  Sugerencias de IA:
                </h4>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <Alert key={index} className="border-blue-200 bg-blue-50">
                      <AlertDescription className="text-blue-800">
                        {suggestion}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
