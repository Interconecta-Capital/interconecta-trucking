
import React from 'react';
import { MapPin, Clock } from 'lucide-react';

interface RouteMetricsDisplayProps {
  distanciaTotal: number;
  tiempoEstimado: number;
}

export function RouteMetricsDisplay({ distanciaTotal, tiempoEstimado }: RouteMetricsDisplayProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (!distanciaTotal || !tiempoEstimado) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-800">Distancia Total</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {distanciaTotal} km
        </div>
        <div className="text-xs text-gray-600 mt-1">
          Calculado automáticamente
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-800">Tiempo Estimado</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {formatTime(tiempoEstimado)}
        </div>
        <div className="text-xs text-gray-600 mt-1">
          Tiempo de conducción
        </div>
      </div>
    </div>
  );
}
