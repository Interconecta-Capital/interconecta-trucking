
import React from 'react';
import { Card } from '@/components/ui/card';
import { MercanciasSectionOptimizada } from './mercancias/MercanciasSectionOptimizada';

interface MercanciasSectionProps {
  data: any[];
  onChange: (data: any[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function MercanciasSection({ data, onChange, onNext, onPrev }: MercanciasSectionProps) {
  return (
    <Card>
      <MercanciasSectionOptimizada
        data={data}
        onChange={onChange}
        onNext={onNext}
        onPrev={onPrev}
      />
    </Card>
  );
}
