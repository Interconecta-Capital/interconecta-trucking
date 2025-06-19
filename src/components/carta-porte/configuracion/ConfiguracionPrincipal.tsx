
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { CartaPorteData } from '@/types/cartaPorte';
import { getUsoCFDIOptions } from '@/data/catalogosUsoCFDI';

interface ConfiguracionPrincipalProps {
  data: CartaPorteData;
  onChange: (config: Partial<CartaPorteData>) => void;
}

export function ConfiguracionPrincipal({ data, onChange }: ConfiguracionPrincipalProps) {
  const usoCFDIOptions = getUsoCFDIOptions();

  return (
    <div className="space-y-6">
      {/* Información del Emisor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos del Emisor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rfcEmisor">RFC Emisor *</Label>
              <Input
                id="rfcEmisor"
                value={data.rfcEmisor || ''}
                onChange={(e) => onChange({ rfcEmisor: e.target.value.toUpperCase() })}
                placeholder="RFC del emisor"
                maxLength={13}
              />
            </div>
            <div>
              <Label htmlFor="nombreEmisor">Nombre/Razón Social Emisor *</Label>
              <Input
                id="nombreEmisor"
                value={data.nombreEmisor || ''}
                onChange={(e) => onChange({ nombreEmisor: e.target.value })}
                placeholder="Nombre completo o razón social del emisor"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información del Receptor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Datos del Receptor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="rfcReceptor">RFC Receptor *</Label>
              <Input
                id="rfcReceptor"
                value={data.rfcReceptor || ''}
                onChange={(e) => onChange({ rfcReceptor: e.target.value.toUpperCase() })}
                placeholder="RFC del receptor"
                maxLength={13}
              />
            </div>
            <div>
              <Label htmlFor="nombreReceptor">Nombre/Razón Social Receptor *</Label>
              <Input
                id="nombreReceptor"
                value={data.nombreReceptor || ''}
                onChange={(e) => onChange({ nombreReceptor: e.target.value })}
                placeholder="Nombre completo o razón social del receptor"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="usoCfdi">Uso de CFDI *</Label>
              <Select 
                value={data.uso_cfdi || ''} 
                onValueChange={(value) => onChange({ uso_cfdi: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar uso de CFDI..." />
                </SelectTrigger>
                <SelectContent>
                  {usoCFDIOptions.map((uso) => (
                    <SelectItem key={uso.clave} value={uso.clave}>
                      {uso.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tipoCfdi">Tipo de CFDI</Label>
              <Select 
                value={data.tipoCfdi || 'Traslado'} 
                onValueChange={(value) => onChange({ tipoCfdi: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Traslado">Traslado</SelectItem>
                  <SelectItem value="Ingreso">Ingreso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuración del Transporte */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuración del Transporte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cartaPorteVersion">Versión Carta Porte</Label>
              <Select 
                value={data.cartaPorteVersion || '3.1'} 
                onValueChange={(value) => onChange({ cartaPorteVersion: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3.1">3.1</SelectItem>
                  <SelectItem value="3.0">3.0</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="transporteInternacional"
                checked={!!data.transporteInternacional}
                onCheckedChange={(checked) => onChange({ transporteInternacional: checked })}
              />
              <Label htmlFor="transporteInternacional">Transporte Internacional</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="registroIstmo"
                checked={!!data.registroIstmo}
                onCheckedChange={(checked) => onChange({ registroIstmo: checked })}
              />
              <Label htmlFor="registroIstmo">Registro Istmo</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
