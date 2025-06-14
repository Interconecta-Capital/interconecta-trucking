
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SegurosFormProps {
  data: {
    asegura_resp_civil: string;
    poliza_resp_civil: string;
    asegura_med_ambiente: string;
    poliza_med_ambiente: string;
  };
  onChange: (field: string, value: any) => void;
  errors: Record<string, string>;
}

export function SegurosForm({ data, onChange, errors }: SegurosFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Seguros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seguro Responsabilidad Civil */}
        <div>
          <h4 className="font-medium mb-3">Responsabilidad Civil *</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="asegura_resp_civil">Aseguradora *</Label>
              <Input
                id="asegura_resp_civil"
                value={data.asegura_resp_civil}
                onChange={(e) => onChange('asegura_resp_civil', e.target.value)}
                placeholder="Nombre de la aseguradora"
                className={errors.asegura_resp_civil ? 'border-red-500' : ''}
              />
              {errors.asegura_resp_civil && <p className="text-sm text-red-500 mt-1">{errors.asegura_resp_civil}</p>}
            </div>

            <div>
              <Label htmlFor="poliza_resp_civil">Número de Póliza *</Label>
              <Input
                id="poliza_resp_civil"
                value={data.poliza_resp_civil}
                onChange={(e) => onChange('poliza_resp_civil', e.target.value)}
                placeholder="Número de póliza"
                className={errors.poliza_resp_civil ? 'border-red-500' : ''}
              />
              {errors.poliza_resp_civil && <p className="text-sm text-red-500 mt-1">{errors.poliza_resp_civil}</p>}
            </div>
          </div>
        </div>

        {/* Seguro Medio Ambiente (Opcional) */}
        <div>
          <h4 className="font-medium mb-3">Medio Ambiente (Opcional)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="asegura_med_ambiente">Aseguradora</Label>
              <Input
                id="asegura_med_ambiente"
                value={data.asegura_med_ambiente}
                onChange={(e) => onChange('asegura_med_ambiente', e.target.value)}
                placeholder="Nombre de la aseguradora"
              />
            </div>

            <div>
              <Label htmlFor="poliza_med_ambiente">Número de Póliza</Label>
              <Input
                id="poliza_med_ambiente"
                value={data.poliza_med_ambiente}
                onChange={(e) => onChange('poliza_med_ambiente', e.target.value)}
                placeholder="Número de póliza"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
