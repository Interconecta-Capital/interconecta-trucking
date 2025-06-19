
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, ArrowRight, Building2, FileText, User, Globe } from 'lucide-react';
import { RFCValidator } from '@/utils/rfcValidation';
import { CartaPorteData } from '@/types/cartaPorte';

interface ConfiguracionInicialProps {
  data: CartaPorteData;
  onChange: (config: Partial<CartaPorteData>) => void;
  onNext: () => void;
}

const usoFacturaOptions = [
  { value: 'G01', label: 'G01 - Adquisición de mercancías' },
  { value: 'G02', label: 'G02 - Devoluciones, descuentos o bonificaciones' },
  { value: 'G03', label: 'G03 - Gastos en general' },
  { value: 'P01', label: 'P01 - Por definir' },
  { value: 'S01', label: 'S01 - Sin efectos fiscales' }
];

export function ConfiguracionInicial({ data, onChange, onNext }: ConfiguracionInicialProps) {
  const handleChange = (field: keyof CartaPorteData, value: any) => {
    onChange({ [field]: value });
  };

  const validateRFC = (rfc: string) => {
    if (!rfc) return null;
    return RFCValidator.validarRFC(rfc);
  };

  const rfcEmisorValidation = validateRFC(data.rfcEmisor || '');
  const rfcReceptorValidation = validateRFC(data.rfcReceptor || '');

  const canContinue = data.rfcEmisor && 
                     data.nombreEmisor && 
                     data.rfcReceptor && 
                     data.nombreReceptor &&
                     rfcEmisorValidation?.esValido &&
                     rfcReceptorValidation?.esValido;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Configuración Inicial del CFDI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Emisor */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Emisor
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rfcEmisor">RFC del emisor *</Label>
                <Input
                  id="rfcEmisor"
                  value={data.rfcEmisor || ''}
                  onChange={(e) => handleChange('rfcEmisor', e.target.value.toUpperCase())}
                  placeholder="XAXX010101000"
                  className={rfcEmisorValidation && !rfcEmisorValidation.esValido ? 'border-red-500' : ''}
                />
                {rfcEmisorValidation && !rfcEmisorValidation.esValido && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      RFC del emisor inválido: {rfcEmisorValidation.mensaje}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nombreEmisor">Nombre del emisor *</Label>
                <Input
                  id="nombreEmisor"
                  value={data.nombreEmisor || ''}
                  onChange={(e) => handleChange('nombreEmisor', e.target.value)}
                  placeholder="Razón social del emisor"
                />
              </div>
            </div>
          </div>

          {/* Receptor */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Receptor
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rfcReceptor">RFC del receptor *</Label>
                <Input
                  id="rfcReceptor"
                  value={data.rfcReceptor || ''}
                  onChange={(e) => handleChange('rfcReceptor', e.target.value.toUpperCase())}
                  placeholder="XAXX010101000"
                  className={rfcReceptorValidation && !rfcReceptorValidation.esValido ? 'border-red-500' : ''}
                />
                {rfcReceptorValidation && !rfcReceptorValidation.esValido && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      RFC del receptor inválido: {rfcReceptorValidation.mensaje}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nombreReceptor">Nombre del receptor *</Label>
                <Input
                  id="nombreReceptor"
                  value={data.nombreReceptor || ''}
                  onChange={(e) => handleChange('nombreReceptor', e.target.value)}
                  placeholder="Razón social del receptor"
                />
              </div>
            </div>
          </div>

          {/* Uso de Factura */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Uso de la Factura</h3>
            <div className="space-y-2">
              <Label htmlFor="usoFactura">Uso que dará el receptor a esta factura *</Label>
              <Select
                value={data.uso_cfdi || ''}
                onValueChange={(value) => handleChange('uso_cfdi', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el uso de la factura" />
                </SelectTrigger>
                <SelectContent>
                  {usoFacturaOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Configuración del Transporte */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Configuración del Transporte
            </h3>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="transporte-internacional"
                checked={data.transporte_internacional || false}
                onCheckedChange={(checked) => handleChange('transporte_internacional', checked)}
              />
              <Label htmlFor="transporte-internacional">Transporte Internacional</Label>
            </div>
            
            {data.transporte_internacional && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  **Versión 3.1**: Para transporte internacional, puede registrar hasta 10 regímenes aduaneros diferentes.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="registro-istmo"
                checked={data.registro_istmo || false}
                onCheckedChange={(checked) => handleChange('registro_istmo', checked)}
              />
              <Label htmlFor="registro-istmo">Registro ISTMO</Label>
            </div>
          </div>

          {/* Información adicional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="folio">Folio interno (opcional)</Label>
              <Input
                id="folio"
                value={data.folio || ''}
                onChange={(e) => handleChange('folio', e.target.value)}
                placeholder="CP-001"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="version">Versión Carta Porte</Label>
              <Select
                value={data.cartaPorteVersion || '3.1'}
                onValueChange={(value) => handleChange('cartaPorteVersion', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3.1">3.1 (Actual)</SelectItem>
                  <SelectItem value="3.0">3.0 (Anterior)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={onNext} 
              disabled={!canContinue}
              className="flex items-center gap-2"
            >
              Continuar a Ubicaciones
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
