
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { RegimenesAduanerosList } from './RegimenesAduanerosList';
import { ClienteSelectorConCRM } from '@/components/crm/ClienteSelectorConCRM';
import { CartaPorteData } from '@/types/cartaPorte';
import { RFCValidator, RFCValidationResult } from '@/utils/rfcValidation';

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
  
  const validacionEmisor: RFCValidationResult = data.rfcEmisor ? 
    RFCValidator.validarRFC(data.rfcEmisor) : 
    { esValido: false, mensaje: 'RFC requerido' };
    
  const validacionReceptor: RFCValidationResult = data.rfcReceptor ? 
    RFCValidator.validarRFC(data.rfcReceptor) : 
    { esValido: false, mensaje: 'RFC requerido' };

  const handleTransporteInternacionalChange = (value: boolean) => {
    onChange({ 
      transporteInternacional: value,
      // Si cambia a false, limpiar regímenes aduaneros
      regimenesAduaneros: value ? (data.regimenesAduaneros || []) : []
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información General del CFDI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tipoCfdi">Tipo de CFDI *</Label>
              <Select
                value={data.tipoCfdi || ''}
                onValueChange={(value) => onChange({ tipoCfdi: value as 'Ingreso' | 'Traslado' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo de CFDI" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Traslado">Traslado</SelectItem>
                  <SelectItem value="Ingreso">Ingreso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="cartaPorteVersion">Versión Complemento</Label>
              <Select
                value={data.cartaPorteVersion || '3.1'}
                onValueChange={(value) => onChange({ cartaPorteVersion: value as '3.0' | '3.1' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3.1">3.1 (Recomendado)</SelectItem>
                  <SelectItem value="3.0">3.0</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emisor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ClienteSelectorConCRM
            tipo="emisor"
            rfc={data.rfcEmisor || ''}
            nombre={data.nombreEmisor || ''}
            onClienteChange={(cliente) => {
              onChange({
                rfcEmisor: cliente.rfc,
                nombreEmisor: cliente.nombre
              });
            }}
          />
          
          {data.rfcEmisor && !validacionEmisor.esValido && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                RFC del emisor inválido: {validacionEmisor.mensaje || 'Error de validación'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Receptor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ClienteSelectorConCRM
            tipo="receptor"
            rfc={data.rfcReceptor || ''}
            nombre={data.nombreReceptor || ''}
            onClienteChange={(cliente) => {
              onChange({
                rfcReceptor: cliente.rfc,
                nombreReceptor: cliente.nombre
              });
            }}
          />
          
          {data.rfcReceptor && !validacionReceptor.esValido && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                RFC del receptor inválido: {validacionReceptor.mensaje || 'Error de validación'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración del Transporte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="transporteInternacional"
                checked={Boolean(data.transporteInternacional)}
                onCheckedChange={handleTransporteInternacionalChange}
              />
              <Label htmlFor="transporteInternacional">Transporte Internacional</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="registroIstmo"
                checked={Boolean(data.registroIstmo)}
                onCheckedChange={(checked) => onChange({ registroIstmo: checked })}
              />
              <Label htmlFor="registroIstmo">Registro ISTMO</Label>
            </div>
          </div>

          {data.transporteInternacional && (
            <RegimenesAduanerosList
              regimenes={data.regimenesAduaneros || []}
              onChange={(regimenes) => onChange({ regimenesAduaneros: regimenes })}
              transporteInternacional={data.transporteInternacional}
            />
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button 
          onClick={onNext} 
          disabled={!isFormValid}
          className="flex items-center space-x-2"
        >
          <span>Continuar a Ubicaciones</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
