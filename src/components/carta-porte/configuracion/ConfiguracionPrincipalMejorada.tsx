import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClienteSelector } from '@/components/crm/ClienteSelector';
import { ArrowRight } from 'lucide-react';
import { OpcionesEspeciales } from './OpcionesEspeciales';
import { CartaPorteData } from '../CartaPorteForm';
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
    if (value === 'Ingreso' || value === 'Traslado') {
      onChange({ tipoCfdi: value });
    }
  };

  // Emisor y Receptor actuales como objeto ClienteProveedor stub
  const emisorValue = data.rfcEmisor && data.nombreEmisor 
    ? {
        id: '',
        tipo: 'cliente',
        rfc: data.rfcEmisor,
        razon_social: data.nombreEmisor,
        estatus: 'activo',
        fecha_registro: '',
        user_id: '',
      }
    : null;
  const receptorValue = data.rfcReceptor && data.nombreReceptor 
    ? {
        id: '',
        tipo: 'cliente',
        rfc: data.rfcReceptor,
        razon_social: data.nombreReceptor,
        estatus: 'activo',
        fecha_registro: '',
        user_id: '',
      }
    : null;

  // Validar si el formulario está completo (opción booleana para desactivar botón)
  const isFormCompleto = () =>
    data.tipoCfdi &&
    data.rfcEmisor &&
    data.nombreEmisor &&
    data.rfcReceptor &&
    data.nombreReceptor;

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
            value={emisorValue}
            onChange={(emisor) => {
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
            }}
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
            value={receptorValue}
            onChange={(receptor) => {
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
            }}
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
