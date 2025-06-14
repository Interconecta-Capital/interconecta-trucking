
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Settings } from 'lucide-react';
import { CartaPorteData } from '@/types/cartaPorte';

interface OpcionesEspecialesProps {
  data: CartaPorteData;
  onChange: (data: Partial<CartaPorteData>) => void;
}

export function OpcionesEspeciales({ data, onChange }: OpcionesEspecialesProps) {
  const handleRegistroIstmoChange = (checked: boolean) => {
    onChange({ registroIstmo: checked });
  };

  const handleTransporteInternacionalChange = (value: string) => {
    onChange({ transporteInternacional: value });
  };

  const handleEntradaSalidaChange = (value: string) => {
    onChange({ entradaSalidaMerc: value });
  };

  const handlePaisOrigenDestinoChange = (value: string) => {
    onChange({ pais_origen_destino: value });
  };

  const handleViaEntradaSalidaChange = (value: string) => {
    onChange({ via_entrada_salida: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Opciones Especiales</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="registro-istmo">Registro Istmo</Label>
          <Switch
            id="registro-istmo"
            checked={data.registroIstmo || false}
            onCheckedChange={handleRegistroIstmoChange}
          />
        </div>

        <div className="space-y-2">
          <Label>Transporte Internacional</Label>
          <Select
            value={data.transporteInternacional || 'No'}
            onValueChange={handleTransporteInternacionalChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sí">Sí</SelectItem>
              <SelectItem value="No">No</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Entrada/Salida Mercancía</Label>
          <Select
            value={data.entradaSalidaMerc || 'Salida'}
            onValueChange={handleEntradaSalidaChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Entrada">Entrada</SelectItem>
              <SelectItem value="Salida">Salida</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {data.transporteInternacional === 'Sí' && (
          <>
            <div className="space-y-2">
              <Label>País Origen/Destino</Label>
              <Input
                value={data.pais_origen_destino || ''}
                onChange={(e) => handlePaisOrigenDestinoChange(e.target.value)}
                placeholder="Código del país"
              />
            </div>

            <div className="space-y-2">
              <Label>Vía Entrada/Salida</Label>
              <Input
                value={data.via_entrada_salida || ''}
                onChange={(e) => handleViaEntradaSalidaChange(e.target.value)}
                placeholder="Código de la vía"
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
