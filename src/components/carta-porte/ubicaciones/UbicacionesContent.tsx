
import React from 'react';
import { CardContent } from '@/components/ui/card';
import { UbicacionesList } from './UbicacionesList';
import { AutoRouteCalculator } from './AutoRouteCalculator';
import { GoogleMapVisualization } from './GoogleMapVisualization';
import { UbicacionesNavigation } from './UbicacionesNavigation';
import { Ubicacion } from '@/types/ubicaciones';

interface UbicacionesContentProps {
  ubicaciones: Ubicacion[];
  canCalculateDistances: boolean;
  showMap: boolean;
  isMapFullscreen: boolean;
  routeData: any;
  distanciaTotal: number;
  tiempoEstimado: number;
  onEditarUbicacion: (index: number) => void;
  onEliminarUbicacion: (index: number) => void;
  onAgregarUbicacion: () => void;
  onDistanceCalculated: (distancia: number, tiempo: number, routeGeometry: any) => void;
  onToggleFullscreen: () => void;
  onPrev: () => void;
  onNext: () => void;
  canContinue: boolean;
}

export function UbicacionesContent({
  ubicaciones,
  canCalculateDistances,
  showMap,
  isMapFullscreen,
  routeData,
  distanciaTotal,
  tiempoEstimado,
  onEditarUbicacion,
  onEliminarUbicacion,
  onAgregarUbicacion,
  onDistanceCalculated,
  onToggleFullscreen,
  onPrev,
  onNext,
  canContinue
}: UbicacionesContentProps) {
  return (
    <CardContent className="bg-white">
      <UbicacionesList
        ubicaciones={ubicaciones}
        onEditarUbicacion={onEditarUbicacion}
        onEliminarUbicacion={onEliminarUbicacion}
        onAgregarUbicacion={onAgregarUbicacion}
      />

      {/* Calculadora automática de rutas con Google Maps */}
      {canCalculateDistances && (
        <div className="mt-6">
          <AutoRouteCalculator
            ubicaciones={ubicaciones}
            onDistanceCalculated={onDistanceCalculated}
            distanciaTotal={distanciaTotal}
            tiempoEstimado={tiempoEstimado}
          />
        </div>
      )}

      {/* Mapa de Google Maps integrado */}
      {showMap && ubicaciones.length >= 2 && (
        <div className="mt-6">
          <GoogleMapVisualization
            ubicaciones={ubicaciones}
            routeData={routeData}
            isVisible={showMap}
            onToggleFullscreen={onToggleFullscreen}
            isFullscreen={isMapFullscreen}
          />
        </div>
      )}

      <UbicacionesNavigation
        onPrev={onPrev}
        onNext={onNext}
        canContinue={canContinue}
      />
    </CardContent>
  );
}
