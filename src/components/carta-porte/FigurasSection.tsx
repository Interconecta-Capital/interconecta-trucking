
import React from 'react';
import { Card } from '@/components/ui/card';
import { FigurasTransporteSection } from './FigurasTransporteSection';

interface FigurasSectionProps {
  data: any[];
  onChange: (data: any[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function FigurasSection({ data, onChange, onNext, onPrev }: FigurasSectionProps) {
  return (
    <Card>
      <FigurasTransporteSection
        data={data}
        onChange={onChange}
        onNext={onNext}
        onPrev={onPrev}
      />
    </Card>
  );
}
