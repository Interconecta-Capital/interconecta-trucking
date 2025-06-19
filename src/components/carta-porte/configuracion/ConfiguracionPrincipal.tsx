
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CartaPorteData } from '@/types/cartaPorte';

interface ConfiguracionPrincipalProps {
  data: CartaPorteData;
  onChange: (config: Partial<CartaPorteData>) => void;
}

export function ConfiguracionPrincipal({ data, onChange }: ConfiguracionPrincipalProps) {
  const handleFieldChange = (field: keyof CartaPorteData, value: any) => {
    onChange({ [field]: value });
  };

  const handleEmisorChange = (field: string, value: string) => {
    onChange({
      [field]: value
    });
  };

  const handleReceptorChange = (field: string, value: string) => {
    onChange({
      [field]: value
    });
  };

  const handleTransporteChange = (field: string, value: any) => {
    onChange({
      tipoCfdi: field === 'tipoCfdi' ? value : data.tipoCfdi,
      [field]: value
    });
  };

  // Convertir transporteInternacional a boolean para el switch
  const transporteIntBool = typeof data.transporteInternacional === 'string' 
    ? data.transporteInternacional === 'true' || data.transporteInternacional === 'Sí'
    : Boolean(data.transporteInternacional);

  const registroIstmoBool = typeof data.registroIstmo === 'string'
    ? data.registroIstmo === 'true' || data.registroIstmo === 'Sí'
    : Boolean(data.registroIstmo);

  return (
    <div className="space-y-6">
      {/* Información del Emisor */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Información del Emisor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>RFC Emisor *</Label>
            <Input
              value={data.rfcEmisor || ''}
              onChange={(e) => handleEmisorChange('rfcEmisor', e.target.value)}
              placeholder="RFC de la empresa emisora"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Nombre Emisor *</Label>
            <Input
              value={data.nombreEmisor || ''}
              onChange={(e) => handleEmisorChange('nombreEmisor', e.target.value)}
              placeholder="Nombre de la empresa emisora"
              required
            />
          </div>
        </div>
      </div>

      {/* Información del Receptor */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Información del Receptor</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>RFC Receptor *</Label>
            <Input
              value={data.rfcReceptor || ''}
              onChange={(e) => handleReceptorChange('rfcReceptor', e.target.value)}
              placeholder="RFC del receptor"
              required
            />
          </div>
          <div className="space-y-2">
            <Label>Nombre Receptor *</Label>
            <Input
              value={data.nombreReceptor || ''}
              onChange={(e) => handleReceptorChange('nombreReceptor', e.target.value)}
              placeholder="Nombre del receptor"
              required
            />
          </div>
        </div>
      </div>

      {/* Configuración de Transporte */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Configuración de Transporte</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Versión Carta Porte *</Label>
            <Select
              value={data.cartaPorteVersion || '3.1'}
              onValueChange={(value) => handleTransporteChange('cartaPorteVersion', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona versión" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3.1">3.1 (Actual)</SelectItem>
                <SelectItem value="3.0">3.0</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Uso CFDI *</Label>
            <Select
              value={data.uso_cfdi || 'S01'}
              onValueChange={(value) => handleTransporteChange('uso_cfdi', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona uso CFDI" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="S01">S01 - Sin efectos fiscales</SelectItem>
                <SelectItem value="G01">G01 - Adquisición de mercancías</SelectItem>
                <SelectItem value="G02">G02 - Devoluciones, descuentos o bonificaciones</SelectItem>
                <SelectItem value="G03">G03 - Gastos en general</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Transporte Internacional</Label>
            <Switch
              checked={transporteIntBool}
              onCheckedChange={(checked) => handleTransporteChange('transporteInternacional', checked)}
            />
          </div>

          {transporteIntBool && (
            <div className="space-y-2">
              <Label>Régimen Aduanero</Label>
              <Select
                value={data.regimenAduanero || ''}
                onValueChange={(value) => handleTransporteChange('regimenAduanero', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona régimen aduanero" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IMD">IMD - Importación definitiva</SelectItem>
                  <SelectItem value="EXD">EXD - Exportación definitiva</SelectItem>
                  <SelectItem value="TRA">TRA - Tránsito de mercancías</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label>Registro ISTMO</Label>
            <Switch
              checked={registroIstmoBool}
              onCheckedChange={(checked) => handleTransporteChange('registroIstmo', checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
