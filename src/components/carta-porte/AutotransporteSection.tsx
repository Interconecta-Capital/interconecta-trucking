
import React from 'react';
import { Card } from '@/components/ui/card';
import { AutotransporteSectionOptimizada } from './autotransporte/AutotransporteSectionOptimizada';

interface AutotransporteSectionProps {
  data: any;
  pesoTotalMercancias: number;
  onChange: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function AutotransporteSection({ data, pesoTotalMercancias, onChange, onNext, onPrev }: AutotransporteSectionProps) {
  return (
    <Card>
      <AutotransporteSectionOptimizada
        data={data}
        pesoTotalMercancias={pesoTotalMercancias}
        onChange={onChange}
        onNext={onNext}
        onPrev={onPrev}
      />
    </Card>
  );
}
