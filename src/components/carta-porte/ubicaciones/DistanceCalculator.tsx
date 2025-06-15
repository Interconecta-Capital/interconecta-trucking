
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Route, Clock, MapPin, Calculator, Loader2 } from 'lucide-react';
import { Ubicacion } from '@/types/ubicaciones';

interface DistanceCalculatorProps {
  ubicaciones: Ubicacion[];
  onDistanceCalculated: (distanciaTotal: number, tiempoEstimado: number) => void;
  distanciaTotal?: number;
  tiempoEstimado?: number;
  isCalculating?: boolean;
}

export function DistanceCalculator({
  ubicaciones,
  onDistanceCalculated,
  distanciaTotal,
  tiempoEstimado,
  isCalculating = false
}: DistanceCalculatorProps) {
  const canCalculate = ubicaciones.length >= 2 && 
    ubicaciones.some(u => u.tipoUbicacion === 'Origen') &&
    ubicaciones.some(u => u.tipoUbicacion === 'Destino');

  const handleCalculateDistance = () => {
    if (!canCalculate) return;
    
    // Simular cálculo de distancia - en producción usaría un servicio real
    const mockDistance = Math.round(Math.random() * 500 + 50); // 50-550 km
    const mockTime = Math.round(mockDistance / 80 * 60); // ~80 km/h en minutos
    
    onDistanceCalculated(mockDistance, mockTime);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Calculator className="h-5 w-5" />
          Calculadora de Distancia de Ruta
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!canCalculate && (
          <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
            <p className="text-sm text-yellow-800">
              Necesitas al menos un origen y un destino para calcular la distancia
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleCalculateDistance}
            disabled={!canCalculate || isCalculating}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isCalculating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Calculando...
              </>
            ) : (
              <>
                <Route className="h-4 w-4 mr-2" />
                Calcular Distancia de Ruta
              </>
            )}
          </Button>
        </div>

        {distanciaTotal && tiempoEstimado && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Distancia Total</span>
              </div>
              <div className="text-2xl font-bold text-green-700">
                {distanciaTotal} km
              </div>
              <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800">
                Requerido por SAT
              </Badge>
            </div>

            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Tiempo Estimado</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {formatTime(tiempoEstimado)}
              </div>
              <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-800">
                Estimación
              </Badge>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-600 bg-white p-3 rounded border">
          <strong>Nota SAT:</strong> La distancia total recorrida es obligatoria en la Carta Porte 
          y debe reflejar la suma de todas las distancias entre ubicaciones del trayecto.
        </div>
      </CardContent>
    </Card>
  );
}
