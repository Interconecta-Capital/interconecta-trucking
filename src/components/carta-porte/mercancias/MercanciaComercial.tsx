
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MercanciaComercialProps {
  formData: {
    fraccion_arancelaria: string;
    moneda: string;
  };
  onFieldChange: (field: string, value: any) => void;
}

export function MercanciaComercial({ formData, onFieldChange }: MercanciaComercialProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
        Información Comercial
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fraccion_arancelaria">Fracción Arancelaria</Label>
          <Input
            id="fraccion_arancelaria"
            value={formData.fraccion_arancelaria}
            onChange={(e) => onFieldChange('fraccion_arancelaria', e.target.value)}
            placeholder="Ej: 84159090"
          />
        </div>

        <div>
          <Label htmlFor="moneda">Moneda</Label>
          <Select value={formData.moneda} onValueChange={(value) => onFieldChange('moneda', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
              <SelectItem value="USD">USD - Dólar Americano</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
