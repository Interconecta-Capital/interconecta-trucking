
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClienteSelector } from '@/components/crm/ClienteSelector';
import { ArrowRight } from 'lucide-react';
import { OpcionesEspeciales } from './OpcionesEspeciales';
import { CartaPorteData } from '@/types/cartaPorte';
import { ClienteProveedor } from '@/hooks/crm/useClientesProveedores';

interface ConfiguracionPrincipalMejoradaProps {
  data: CartaPorteData;
  onChange: (data: Partial<CartaPorteData>) => void;
  onNext: () => void;
  isFormValid: boolean;
}

export function ConfiguracionPrincipalMejorada({ 
  data, 
  onChange, 
  onNext, 
  isFormValid 
}: ConfiguracionPrincipalMejoradaProps) {
  
  const handleTipoCfdiChange = (value: string) => {
    console.log('Tipo CFDI changed:', value);
    if (value === 'Ingreso' || value === 'Traslado') {
      onChange({ tipoCfdi: value });
    }
  };

  const handleEmisorChange = (emisor: ClienteProveedor | null) => {
    console.log('Emisor changed:', emisor);
    if (emisor) {
      onChange({
        rfcEmisor: emisor.rfc,
        nombreEmisor: emisor.razon_social
      });
    } else {
      onChange({
        rfcEmisor: '',
        nombreEmisor: ''
      });
    }
  };

  const handleReceptorChange = (receptor: ClienteProveedor | null) => {
    console.log('Receptor changed:', receptor);
    if (receptor) {
      onChange({
        rfcReceptor: receptor.rfc,
        nombreReceptor: receptor.razon_social
      });
    } else {
      onChange({
        rfcReceptor: '',
        nombreReceptor: ''
      });
    }
  };

  // Validar si el formulario está completo
  const isFormCompleto = () => {
    return (
      data.tipoCfdi &&
      data.rfcEmisor &&
      data.nombreEmisor &&
      data.rfcReceptor &&
      data.nombreReceptor
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Configuración de la Carta Porte
          <span className="text-sm font-normal text-green-600">
            ✨ Con CRM Inteligente
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tipo de CFDI */}
        <div className="space-y-2">
          <Label>Tipo de CFDI *</Label>
          <Select value={data.tipoCfdi || ''} onValueChange={handleTipoCfdiChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Seleccionar tipo de CFDI..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Traslado">Traslado</SelectItem>
              <SelectItem value="Ingreso">Ingreso</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Emisor con CRM */}
        <div className="space-y-2">
          <ClienteSelector
            label="Emisor"
            value={null}
            onChange={handleEmisorChange}
            tipo="cliente"
            placeholder="Buscar empresa emisora por RFC, nombre o razón social..."
            required
            showCreateButton
            className="w-full"
          />
        </div>

        {/* Receptor con CRM */}
        <div className="space-y-2">
          <ClienteSelector
            label="Receptor"
            value={null}
            onChange={handleReceptorChange}
            tipo="cliente"
            placeholder="Buscar empresa receptora por RFC, nombre o razón social..."
            required
            showCreateButton
            className="w-full"
          />
        </div>

        {/* Opciones Especiales */}
        <OpcionesEspeciales data={data} onChange={onChange} />

        <div className="flex justify-end">
          <Button 
            onClick={onNext} 
            disabled={!isFormCompleto()}
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
