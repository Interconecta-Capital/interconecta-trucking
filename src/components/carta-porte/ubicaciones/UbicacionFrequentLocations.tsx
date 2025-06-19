
import React from 'react';
import { Button } from '@/components/ui/button';
import { UbicacionFrecuente } from '@/types/ubicaciones';

interface UbicacionFrequentLocationsProps {
  ubicacionesFrecuentes: UbicacionFrecuente[];
  onCargarUbicacionFrecuente: (ubicacionFrecuente: UbicacionFrecuente) => void;
}

export function UbicacionFrequentLocations({
  ubicacionesFrecuentes,
  onCargarUbicacionFrecuente
}: UbicacionFrequentLocationsProps) {
  if (ubicacionesFrecuentes.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
      <h4 className="font-medium mb-2 text-gray-900">Ubicaciones Frecuentes</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {ubicacionesFrecuentes.slice(0, 4).map((uf) => (
          <Button
            key={uf.id}
            variant="outline"
            size="sm"
            onClick={() => onCargarUbicacionFrecuente(uf)}
            className="text-left justify-start border-gray-100 text-gray-700 hover:bg-gray-50 hover:border-gray-200 shadow-sm"
          >
            <div className="truncate">
              <div className="font-medium text-gray-900">{uf.nombreUbicacion}</div>
              <div className="text-xs text-gray-600">{uf.rfcAsociado}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
