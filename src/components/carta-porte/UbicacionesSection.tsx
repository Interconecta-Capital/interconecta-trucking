
import React from 'react';
import { Card } from '@/components/ui/card';
import { UbicacionesSectionOptimizada } from './ubicaciones/UbicacionesSectionOptimizada';

interface UbicacionesSectionProps {
  data: any[];
  onChange: (data: any[]) => void;
  onNext: () => void;
  onPrev: () => void;
  cartaPorteId?: string;
  onDistanceCalculated?: (datos: { distanciaTotal?: number; tiempoEstimado?: number }) => void;
}

export function UbicacionesSection({ 
  data, 
  onChange, 
  onNext, 
  onPrev, 
  cartaPorteId,
  onDistanceCalculated
}: UbicacionesSectionProps) {
  return (
    <Card>
      <UbicacionesSectionOptimizada
        data={data}
        onChange={onChange}
        onNext={onNext}
        onPrev={onPrev}
        cartaPorteId={cartaPorteId}
        onDistanceCalculated={onDistanceCalculated}
      />
    </Card>
  );
}
