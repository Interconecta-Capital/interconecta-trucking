
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight } from 'lucide-react';
import { DatosEmisor } from './DatosEmisor';
import { DatosReceptor } from './DatosReceptor';
import { OpcionesEspeciales } from './OpcionesEspeciales';
import { CartaPorteData } from '../CartaPorteForm';

interface ConfiguracionPrincipalProps {
  data: CartaPorteData;
  onChange: (data: Partial<CartaPorteData>) => void;
  onNext: () => void;
  isFormValid: boolean;
}

export function ConfiguracionPrincipal({ 
  data, 
  onChange, 
  onNext, 
  isFormValid 
}: ConfiguracionPrincipalProps) {
  const handleTipoCfdiChange = (value: string) => {
    if (value === 'Ingreso' || value === 'Traslado') {
      onChange({ tipoCfdi: value });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de la Carta Porte</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tipo de CFDI */}
        <div className="space-y-2">
          <Label>Tipo de CFDI *</Label>
          <Select value={data.tipoCfdi} onValueChange={handleTipoCfdiChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar tipo de CFDI..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Traslado">Traslado</SelectItem>
              <SelectItem value="Ingreso">Ingreso</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Datos del Emisor */}
        <DatosEmisor
          rfcEmisor={data.rfcEmisor || ''}
          nombreEmisor={data.nombreEmisor || ''}
          onRFCChange={(rfc) => onChange({ rfcEmisor: rfc })}
          onNombreChange={(nombre) => onChange({ nombreEmisor: nombre })}
        />

        {/* Datos del Receptor */}
        <DatosReceptor
          rfcReceptor={data.rfcReceptor || ''}
          nombreReceptor={data.nombreReceptor || ''}
          onRFCChange={(rfc) => onChange({ rfcReceptor: rfc })}
          onNombreChange={(nombre) => onChange({ nombreReceptor: nombre })}
        />

        {/* Opciones Especiales */}
        <OpcionesEspeciales data={data} onChange={onChange} />

        <div className="flex justify-end">
          <Button 
            onClick={onNext} 
            disabled={!isFormValid}
            className="flex items-center space-x-2"
          >
            <span>Continuar</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
