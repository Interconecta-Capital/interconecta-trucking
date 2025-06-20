
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, Info } from 'lucide-react';

interface RouteMetricsDisplayProps {
  distanciaTotal: number;
  tiempoEstimado: number;
}

export function RouteMetricsDisplay({ distanciaTotal, tiempoEstimado }: RouteMetricsDisplayProps) {
  if (!distanciaTotal || distanciaTotal === 0) {
    return null;
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card className="bg-white border-gray-200">
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Distancia Total</span>
            </div>
            <div className="text-xl font-bold text-blue-700">
              {distanciaTotal} km
            </div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Tiempo Estimado</span>
            </div>
            <div className="text-xl font-bold text-green-700">
              {formatTime(tiempoEstimado)}
            </div>
          </div>
        </div>
        
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600">
              <strong>Nota:</strong> La distancia se calcula automáticamente usando rutas reales de Google Maps. 
              Esta es la distancia que aparecerá en tu PDF de Carta Porte.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
