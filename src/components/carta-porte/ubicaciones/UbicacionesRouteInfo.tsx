
import React from 'react';
import { MapVisualization } from './MapVisualization';

interface UbicacionesRouteInfoProps {
  showMap: boolean;
  ruta_calculada: any;
  ubicaciones: any[];
}

export function UbicacionesRouteInfo({ showMap, ruta_calculada, ubicaciones }: UbicacionesRouteInfoProps) {
  if (!showMap || !ruta_calculada) {
    return null;
  }

  return (
    <div className="mt-6">
      <MapVisualization
        ubicaciones={ubicaciones}
        ruta_calculada={ruta_calculada}
        isVisible={showMap}
      />
    </div>
  );
}
