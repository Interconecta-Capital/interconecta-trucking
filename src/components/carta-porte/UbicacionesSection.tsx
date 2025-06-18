
import React from 'react';
import { Card } from '@/components/ui/card';
import { UbicacionesSectionOptimizada } from './ubicaciones/UbicacionesSectionOptimizada';

interface UbicacionesSectionProps {
  data: any[];
  onChange: (data: any[]) => void;
  onNext: () => void;
  onPrev: () => void;
  cartaPorteId?: string;
}

export function UbicacionesSection({ 
  data, 
  onChange, 
  onNext, 
  onPrev, 
  cartaPorteId 
}: UbicacionesSectionProps) {
  return (
    <Card>
      <UbicacionesSectionOptimizada
        data={data}
        onChange={onChange}
        onNext={onNext}
        onPrev={onPrev}
        cartaPorteId={cartaPorteId}
      />
    </Card>
  );
}
