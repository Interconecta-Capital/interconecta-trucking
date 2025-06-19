
import React from 'react';
import { Card } from '@/components/ui/card';
import { ConfiguracionInicial } from './ConfiguracionInicial';

interface ConfiguracionSectionProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function ConfiguracionSection({ data, onChange, onNext, onPrev }: ConfiguracionSectionProps) {
  return (
    <Card>
      <ConfiguracionInicial
        data={data}
        onChange={onChange}
        onNext={onNext}
      />
    </Card>
  );
}
