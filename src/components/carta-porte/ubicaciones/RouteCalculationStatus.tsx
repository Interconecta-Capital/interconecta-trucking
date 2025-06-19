
import React from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface RouteCalculationStatusProps {
  isCalculating: boolean;
  hasUbicaciones: boolean;
  canCalculate: boolean;
}

export function RouteCalculationStatus({ 
  isCalculating, 
  hasUbicaciones, 
  canCalculate 
}: RouteCalculationStatusProps) {
  if (!hasUbicaciones) {
    return (
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-gray-500">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">
              No hay ubicaciones disponibles para calcular la ruta
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!canCalculate) {
    return (
      <Card className="border-gray-200 bg-white shadow-sm">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-amber-700">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">
              Agrega un origen y destino con direcciones completas para calcular la ruta automáticamente
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isCalculating) {
    return (
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
        <span className="text-sm text-gray-800">
          Calculando ruta con Mapbox...
        </span>
      </div>
    );
  }

  return null;
}
