
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ClienteSelector } from '@/components/crm/ClienteSelector';
import { ArrowRight, AlertCircle } from 'lucide-react';
import { OpcionesEspeciales } from './OpcionesEspeciales';
import { CartaPorteData } from '@/types/cartaPorte';
import { ClienteProveedor } from '@/hooks/crm/useClientesProveedores';
import { RFCValidator } from '@/utils/rfcValidation';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

  // Función para obtener el cliente seleccionado para el emisor
  const getEmisorSeleccionado = (): ClienteProveedor | null => {
    if (data.rfcEmisor && data.nombreEmisor) {
      return {
        id: '', // No necesario para mostrar
        rfc: data.rfcEmisor,
        razon_social: data.nombreEmisor,
        tipo: 'cliente',
        estatus: 'activo',
        fecha_registro: '',
        user_id: '',
        credito_limite: 0,
        credito_disponible: 0,
        dias_credito: 0,
      };
    }
    return null;
  };

  // Función para obtener el cliente seleccionado para el receptor
  const getReceptorSeleccionado = (): ClienteProveedor | null => {
    if (data.rfcReceptor && data.nombreReceptor) {
      return {
        id: '', // No necesario para mostrar
        rfc: data.rfcReceptor,
        razon_social: data.nombreReceptor,
        tipo: 'cliente',
        estatus: 'activo',
        fecha_registro: '',
        user_id: '',
        credito_limite: 0,
        credito_disponible: 0,
        dias_credito: 0,
      };
    }
    return null;
  };

  // Validar si el formulario está completo
  const isFormCompleto = () => {
    const validacionEmisor = data.rfcEmisor ? RFCValidator.validarRFC(data.rfcEmisor) : { esValido: false };
    const validacionReceptor = data.rfcReceptor ? RFCValidator.validarRFC(data.rfcReceptor) : { esValido: false };

    return (
      data.tipoCfdi &&
      data.rfcEmisor &&
      data.nombreEmisor &&
      data.rfcReceptor &&
      data.nombreReceptor &&
      validacionEmisor.esValido &&
      validacionReceptor.esValido
    );
  };

  // Obtener errores de validación
  const getValidationErrors = () => {
    const errors: string[] = [];
    
    if (!data.tipoCfdi) {
      errors.push('Selecciona el tipo de CFDI');
    }
    
    if (!data.rfcEmisor || !data.nombreEmisor) {
      errors.push('Selecciona o crea el emisor');
    } else {
      const validacionEmisor = RFCValidator.validarRFC(data.rfcEmisor);
      if (!validacionEmisor.esValido) {
        errors.push('RFC del emisor no es válido');
      }
    }
    
    if (!data.rfcReceptor || !data.nombreReceptor) {
      errors.push('Selecciona o crea el receptor');
    } else {
      const validacionReceptor = RFCValidator.validarRFC(data.rfcReceptor);
      if (!validacionReceptor.esValido) {
        errors.push('RFC del receptor no es válido');
      }
    }
    
    return errors;
  };

  const validationErrors = getValidationErrors();

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
            value={getEmisorSeleccionado()}
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
            value={getReceptorSeleccionado()}
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

        {/* Errores de validación */}
        {validationErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <div className="font-medium">Completa los siguientes campos:</div>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index} className="text-sm">{error}</li>
                  ))}
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

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
