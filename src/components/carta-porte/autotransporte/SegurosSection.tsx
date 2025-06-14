
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield } from 'lucide-react';

interface SegurosSectionProps {
  data: any;
  onChange: (field: string, value: string) => void;
}

export function SegurosSection({ data, onChange }: SegurosSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Seguros</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Aseguradora Responsabilidad Civil *</Label>
            <Input
              value={data.asegura_resp_civil || ''}
              onChange={(e) => onChange('asegura_resp_civil', e.target.value)}
              placeholder="Nombre de la aseguradora"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Póliza Responsabilidad Civil *</Label>
            <Input
              value={data.poliza_resp_civil || ''}
              onChange={(e) => onChange('poliza_resp_civil', e.target.value)}
              placeholder="Número de póliza"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Aseguradora Medio Ambiente</Label>
            <Input
              value={data.asegura_med_ambiente || ''}
              onChange={(e) => onChange('asegura_med_ambiente', e.target.value)}
              placeholder="Nombre de la aseguradora"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Póliza Medio Ambiente</Label>
            <Input
              value={data.poliza_med_ambiente || ''}
              onChange={(e) => onChange('poliza_med_ambiente', e.target.value)}
              placeholder="Número de póliza"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
