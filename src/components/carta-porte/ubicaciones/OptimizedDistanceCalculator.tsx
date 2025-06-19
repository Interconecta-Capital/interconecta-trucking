
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UbicacionCompleta } from '@/types/cartaPorte';
import { Calculator, Route, Loader2 } from 'lucide-react';

interface OptimizedDistanceCalculatorProps {
  ubicaciones: UbicacionCompleta[];
  onDistanceCalculated: (distancia: number, tiempo: number) => void;
  onUbicacionesOptimizadas: (ubicaciones: UbicacionCompleta[]) => void;
  distanciaTotal?: number;
  tiempoEstimado?: number;
}

export function OptimizedDistanceCalculator({
  ubicaciones,
  onDistanceCalculated,
  onUbicacionesOptimizadas,
  distanciaTotal = 0,
  tiempoEstimado = 0
}: OptimizedDistanceCalculatorProps) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const calculateDistance = async () => {
    if (ubicaciones.length < 2) return;

    setIsCalculating(true);
    try {
      // Simulate distance calculation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock calculation based on number of locations
      const mockDistance = ubicaciones.length * 50 + Math.random() * 100;
      const mockTime = mockDistance / 80; // Assuming 80 km/h average speed
      
      onDistanceCalculated(Math.round(mockDistance), Math.round(mockTime * 10) / 10);
    } catch (error) {
      console.error('Error calculando distancia:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const optimizeRoute = async () => {
    if (ubicaciones.length < 3) return;

    setIsOptimizing(true);
    try {
      // Simulate route optimization
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock optimization - just shuffle intermediate locations
      const origen = ubicaciones.find(u => u.tipo_ubicacion === 'Origen');
      const destino = ubicaciones.find(u => u.tipo_ubicacion === 'Destino');
      const intermedias = ubicaciones.filter(u => u.tipo_ubicacion === 'Paso Intermedio');
      
      if (origen && destino) {
        const optimized = [origen, ...intermedias, destino];
        onUbicacionesOptimizadas(optimized);
        
        // Recalculate distance after optimization
        const optimizedDistance = optimized.length * 45 + Math.random() * 80;
        const optimizedTime = optimizedDistance / 85;
        onDistanceCalculated(Math.round(optimizedDistance), Math.round(optimizedTime * 10) / 10);
      }
    } catch (error) {
      console.error('Error optimizando ruta:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  useEffect(() => {
    if (ubicaciones.length >= 2 && distanciaTotal === 0) {
      calculateDistance();
    }
  }, [ubicaciones.length]);

  if (ubicaciones.length < 2) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Distancia: {distanciaTotal} km
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Tiempo: {tiempoEstimado} hrs
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={calculateDistance}
              disabled={isCalculating || ubicaciones.length < 2}
              className="text-blue-600 border-blue-300 hover:bg-blue-100"
            >
              {isCalculating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Calculator className="h-4 w-4" />
              )}
              {isCalculating ? 'Calculando...' : 'Recalcular'}
            </Button>
            
            {ubicaciones.length > 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={optimizeRoute}
                disabled={isOptimizing || ubicaciones.length < 3}
                className="text-green-600 border-green-300 hover:bg-green-100"
              >
                {isOptimizing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Route className="h-4 w-4" />
                )}
                {isOptimizing ? 'Optimizando...' : 'Optimizar Ruta'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
