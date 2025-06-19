
import React from 'react';
import { Card } from '@/components/ui/card';
import { AutotransporteSection as AutotransporteSectionEditor } from './editor/sections/AutotransporteSection';

interface AutotransporteSectionProps {
  data: any;
  onChange: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function AutotransporteSection({ data, onChange, onNext, onPrev }: AutotransporteSectionProps) {
  return (
    <Card>
      <AutotransporteSectionEditor
        data={data}
        onChange={onChange}
      />
    </Card>
  );
}
