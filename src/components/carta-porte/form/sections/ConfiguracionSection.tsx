
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CartaPorteData } from '@/types/cartaPorte';
import { Building, User } from 'lucide-react';

interface ConfiguracionSectionProps {
  data: CartaPorteData;
  onChange: (field: keyof CartaPorteData, value: any) => void;
}

export function ConfiguracionSection({ data, onChange }: ConfiguracionSectionProps) {
  console.log('ConfiguracionSection render:', data);

  const handleTransporteInternacionalChange = (checked: boolean) => {
    onChange('transporteInternacional', checked);
  };

  const handleRegistroIstmoChange = (checked: boolean) => {
    onChange('registroIstmo', checked);
  };

  // Normalize boolean values
  const transporteInternacionalValue = data.transporteInternacional === true || data.transporteInternacional === 'Sí';
  const registroIstmoValue = data.registroIstmo === true || data.registroIstmo === 'Sí';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Datos del Emisor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rfcEmisor">RFC Emisor *</Label>
              <Input
                id="rfcEmisor"
                value={data.rfcEmisor || ''}
                onChange={(e) => {
                  console.log('RFC Emisor changed:', e.target.value);
                  onChange('rfcEmisor', e.target.value);
                }}
                placeholder="RFC del emisor"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nombreEmisor">Nombre/Razón Social *</Label>
              <Input
                id="nombreEmisor"
                value={data.nombreEmisor || ''}
                onChange={(e) => {
                  console.log('Nombre Emisor changed:', e.target.value);
                  onChange('nombreEmisor', e.target.value);
                }}
                placeholder="Nombre o razón social del emisor"
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Datos del Receptor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rfcReceptor">RFC Receptor *</Label>
              <Input
                id="rfcReceptor"
                value={data.rfcReceptor || ''}
                onChange={(e) => {
                  console.log('RFC Receptor changed:', e.target.value);
                  onChange('rfcReceptor', e.target.value);
                }}
                placeholder="RFC del receptor"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="nombreReceptor">Nombre/Razón Social *</Label>
              <Input
                id="nombreReceptor"
                value={data.nombreReceptor || ''}
                onChange={(e) => {
                  console.log('Nombre Receptor changed:', e.target.value);
                  onChange('nombreReceptor', e.target.value);
                }}
                placeholder="Nombre o razón social del receptor"
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración del Documento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipoCfdi">Tipo de CFDI</Label>
              <Select 
                value={data.tipoCfdi || 'Traslado'} 
                onValueChange={(value) => onChange('tipoCfdi', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Traslado">Traslado</SelectItem>
                  <SelectItem value="Ingreso">Ingreso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cartaPorteVersion">Versión Carta Porte</Label>
              <Select 
                value={data.cartaPorteVersion || '3.1'} 
                onValueChange={(value) => onChange('cartaPorteVersion', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar versión" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3.1">3.1</SelectItem>
                  <SelectItem value="3.0">3.0</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Transporte Internacional</Label>
                <p className="text-sm text-muted-foreground">
                  ¿El transporte cruza fronteras internacionales?
                </p>
              </div>
              <Switch
                checked={transporteInternacionalValue}
                onCheckedChange={handleTransporteInternacionalChange}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Registro ISTMO</Label>
                <p className="text-sm text-muted-foreground">
                  ¿Requiere registro en el ISTMO?
                </p>
              </div>
              <Switch
                checked={registroIstmoValue}
                onCheckedChange={handleRegistroIstmoChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
