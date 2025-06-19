
import React from 'react';
import { MapPin } from 'lucide-react';

export function UbicacionesEmptyState() {
  return (
    <div className="text-center py-8 text-gray-500">
      <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>No hay ubicaciones registradas</p>
      <p className="text-sm">Agrega al menos un origen y un destino</p>
    </div>
  );
}
