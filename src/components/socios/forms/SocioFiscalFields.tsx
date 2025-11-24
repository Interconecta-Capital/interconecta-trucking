
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { RegimesFiscalesSelector } from '@/components/shared/RegimesFiscalesSelector';

interface SocioFiscalFieldsProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
}

export function SocioFiscalFields({ formData, onFieldChange }: SocioFiscalFieldsProps) {
  const usosCFDI = [
    { value: 'G01', label: 'G01 - Adquisición de mercancías' },
    { value: 'G02', label: 'G02 - Devoluciones, descuentos o bonificaciones' },
    { value: 'G03', label: 'G03 - Gastos en general' },
    { value: 'I01', label: 'I01 - Construcciones' },
    { value: 'I02', label: 'I02 - Mobilario y equipo de oficina por inversiones' },
    { value: 'I03', label: 'I03 - Equipo de transporte' },
    { value: 'I04', label: 'I04 - Equipo de computo y accesorios' },
    { value: 'I05', label: 'I05 - Dados, troqueles, moldes, matrices y herramental' },
    { value: 'I06', label: 'I06 - Comunicaciones telefónicas' },
    { value: 'I07', label: 'I07 - Comunicaciones satelitales' },
    { value: 'I08', label: 'I08 - Otra maquinaria y equipo' },
    { value: 'D01', label: 'D01 - Honorarios médicos, dentales y gastos hospitalarios' },
    { value: 'D02', label: 'D02 - Gastos médicos por incapacidad o discapacidad' },
    { value: 'D03', label: 'D03 - Gastos funerales' },
    { value: 'D04', label: 'D04 - Donativos' },
    { value: 'D05', label: 'D05 - Intereses reales efectivamente pagados por créditos hipotecarios' },
    { value: 'D06', label: 'D06 - Aportaciones voluntarias al SAR' },
    { value: 'D07', label: 'D07 - Primas por seguros de gastos médicos' },
    { value: 'D08', label: 'D08 - Gastos de transportación escolar obligatoria' },
    { value: 'D09', label: 'D09 - Depósitos en cuentas para el ahorro, primas que tengan como base planes de pensiones' },
    { value: 'D10', label: 'D10 - Pagos por servicios educativos' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Información Fiscal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RegimesFiscalesSelector
          value={formData.regimen_fiscal || ''}
          onValueChange={(value) => onFieldChange('regimen_fiscal', value)}
          label="Régimen Fiscal"
          placeholder="Seleccionar régimen fiscal..."
        />

        <div>
          <Label htmlFor="uso_cfdi">Uso CFDI</Label>
          <Select 
            value={formData.uso_cfdi || 'G03'} 
            onValueChange={(value) => onFieldChange('uso_cfdi', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-60 overflow-y-auto">
              {usosCFDI.map((uso) => (
                <SelectItem key={uso.value} value={uso.value}>
                  {uso.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
