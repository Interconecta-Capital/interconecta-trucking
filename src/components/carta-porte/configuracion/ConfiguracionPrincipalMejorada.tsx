import React, { memo } from 'react';
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

const ConfiguracionPrincipalMejoradaComponent = ({
  data,
  onChange,
  onNext,
}: ConfiguracionPrincipalMejoradaProps) => {
  const handleTipoCfdiChange = (value: string) => {
    // Solo actualiza tipoCfdi; NO resetear emisor ni receptor
    if (value === 'Ingreso' || value === 'Traslado') {
      onChange({
        tipoCfdi: value,
        // Ya no se reinician estos campos:
        // rfcEmisor: '',
        // nombreEmisor: '',
        // rfcReceptor: '',
        // nombreReceptor: '',
      });
    }
  };

  // FIX: Crear objetos ClienteProveedor solo si hay datos completos
  const emisorValue = (data.rfcEmisor && data.nombreEmisor) ? {
    id: `emisor-${data.rfcEmisor}`,
    tipo: 'cliente' as const,
    rfc: data.rfcEmisor,
    razon_social: data.nombreEmisor,
    estatus: "activo" as const,
    fecha_registro: new Date().toISOString(),
    user_id: ''
  } : null;

  const receptorValue = (data.rfcReceptor && data.nombreReceptor) ? {
    id: `receptor-${data.rfcReceptor}`,
    tipo: 'cliente' as const,
    rfc: data.rfcReceptor,
    razon_social: data.nombreReceptor,
    estatus: "activo" as const,
    fecha_registro: new Date().toISOString(),
    user_id: ''
  } : null;

  const handleEmisorChange = (emisor: ClienteProveedor | null) => {
    onChange({
      rfcEmisor: emisor?.rfc || '',
      nombreEmisor: emisor?.razon_social || ''
    });
  };

  const handleReceptorChange = (receptor: ClienteProveedor | null) => {
    onChange({
      rfcReceptor: receptor?.rfc || '',
      nombreReceptor: receptor?.razon_social || ''
    });
  };

  const isFormCompleto = () => {
    return !!(data.tipoCfdi && data.rfcEmisor && data.nombreEmisor && data.rfcReceptor && data.nombreReceptor);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Configuración de la Carta Porte
          <span className="text-sm font-normal text-green-600">
            {data.tipoCfdi && `(${data.tipoCfdi})`}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
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

        <div className="space-y-2">
          <ClienteSelector 
            label="Emisor" 
            value={emisorValue}
            onChange={handleEmisorChange}
            tipo="cliente" 
            placeholder="Buscar empresa emisora..." 
            required 
            showCreateButton 
            className="w-full" 
          />
        </div>

        <div className="space-y-2">
          <ClienteSelector 
            label="Receptor" 
            value={receptorValue}
            onChange={handleReceptorChange}
            tipo="cliente" 
            placeholder="Buscar empresa receptora..." 
            required 
            showCreateButton 
            className="w-full" 
          />
        </div>

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
};

export const ConfiguracionPrincipalMejorada = memo(ConfiguracionPrincipalMejoradaComponent);
