
import React from 'react';
import { MapVisualization } from './MapVisualization';

interface UbicacionesRouteInfoProps {
  showMap: boolean;
  rutaCalculada: any;
  ubicaciones: any[];
}

export function UbicacionesRouteInfo({ showMap, rutaCalculada, ubicaciones }: UbicacionesRouteInfoProps) {
  if (!showMap || !rutaCalculada) {
    return null;
  }

  return (
    <div className="mt-6">
      <MapVisualization 
        ubicaciones={ubicaciones}
        rutaCalculada={rutaCalculada}
        isVisible={showMap}
      />
    </div>
  );
}
