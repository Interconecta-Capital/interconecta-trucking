
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';

interface ConductorSCTFieldsProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
}

export function ConductorSCTFields({ formData, onFieldChange }: ConductorSCTFieldsProps) {
  const paisesResidencia = [
    { value: 'MEX', label: 'México' },
    { value: 'USA', label: 'Estados Unidos' },
    { value: 'CAN', label: 'Canadá' },
    { value: 'GTM', label: 'Guatemala' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Información SCT
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="operador_sct"
            checked={formData.operador_sct || false}
            onCheckedChange={(checked) => onFieldChange('operador_sct', checked)}
          />
          <Label htmlFor="operador_sct">Es operador SCT</Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="residencia_fiscal">Residencia Fiscal</Label>
            <Select 
              value={formData.residencia_fiscal || 'MEX'} 
              onValueChange={(value) => onFieldChange('residencia_fiscal', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paisesResidencia.map((pais) => (
                  <SelectItem key={pais.value} value={pais.value}>
                    {pais.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="num_reg_id_trib">Número Registro ID Tributario</Label>
            <Input
              id="num_reg_id_trib"
              value={formData.num_reg_id_trib || ''}
              onChange={(e) => onFieldChange('num_reg_id_trib', e.target.value)}
              placeholder="Registro tributario extranjero"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
