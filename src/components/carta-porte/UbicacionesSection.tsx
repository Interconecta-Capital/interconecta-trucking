
import React from 'react';
import { Card } from '@/components/ui/card';
import { UbicacionesSectionOptimizada } from './ubicaciones/UbicacionesSectionOptimizada';

interface UbicacionesSectionProps {
  data: any[];
  onChange: (data: any[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function UbicacionesSection({ data, onChange, onNext, onPrev }: UbicacionesSectionProps) {
  return (
    <Card>
      <UbicacionesSectionOptimizada
        data={data}
        onChange={onChange}
        onNext={onNext}
        onPrev={onPrev}
      />
    </Card>
  );
}
