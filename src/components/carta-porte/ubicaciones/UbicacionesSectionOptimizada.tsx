
import React from 'react';
import { UbicacionesContainer } from './UbicacionesContainer';

interface UbicacionesSectionOptimizadaProps {
  data: any[];
  onChange: (data: any[]) => void;
  onNext: () => void;
  onPrev: () => void;
  cartaPorteId?: string;
  onDistanceCalculated?: (datos: { distanciaTotal?: number; tiempoEstimado?: number }) => void;
}

export function UbicacionesSectionOptimizada(props: UbicacionesSectionOptimizadaProps) {
  return <UbicacionesContainer {...props} />;
}
