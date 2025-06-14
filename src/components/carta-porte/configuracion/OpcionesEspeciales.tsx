
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CartaPorteData } from '@/types/cartaPorte';

interface OpcionesEspecialesProps {
  data: CartaPorteData;
  onChange: (data: Partial<CartaPorteData>) => void;
}

export function OpcionesEspeciales({ data, onChange }: OpcionesEspecialesProps) {
  const handleTransporteInternacionalChange = (checked: boolean) => {
    onChange({ 
      transporteInternacional: checked ? 'Sí' : 'No'
    });
  };

  const handleRegistroIstmoChange = (checked: boolean) => {
    onChange({ registroIstmo: checked });
  };

  const handleEntradaSalidaChange = (value: string) => {
    onChange({ entradaSalidaMerc: value });
  };

  const handleViaTransporteChange = (value: string) => {
    onChange({ viaTransporte: value });
  };

  const handlePaisOrigenDestinoChange = (value: string) => {
    onChange({ pais_origen_destino: value });
  };

  const handleViaEntradaSalidaChange = (value: string) => {
    onChange({ via_entrada_salida: value });
  };

  // Ensure transporteInternacional is treated as boolean for the switch
  const isTransporteInternacional = typeof data.transporteInternacional === 'string' 
    ? data.transporteInternacional === 'Sí' 
    : Boolean(data.transporteInternacional);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="transporte-internacional"
              checked={isTransporteInternacional}
              onCheckedChange={handleTransporteInternacionalChange}
            />
            <Label htmlFor="transporte-internacional">
              Transporte Internacional
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="registro-istmo"
              checked={Boolean(data.registroIstmo)}
              onCheckedChange={handleRegistroIstmoChange}
            />
            <Label htmlFor="registro-istmo">
              Registro Istmo
            </Label>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="entrada-salida">Entrada/Salida de Mercancías</Label>
            <Select value={data.entradaSalidaMerc || ''} onValueChange={handleEntradaSalidaChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Entrada">Entrada</SelectItem>
                <SelectItem value="Salida">Salida</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="via-transporte">Vía de Transporte</Label>
            <Select value={data.viaTransporte || ''} onValueChange={handleViaTransporteChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="01">Autotransporte</SelectItem>
                <SelectItem value="02">Marítimo</SelectItem>
                <SelectItem value="03">Aéreo</SelectItem>
                <SelectItem value="04">Ferroviario</SelectItem>
                <SelectItem value="05">Ducto</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Campos adicionales para transporte internacional */}
      {isTransporteInternacional && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div>
            <Label htmlFor="pais-origen-destino">País de Origen/Destino</Label>
            <Select value={data.pais_origen_destino || ''} onValueChange={handlePaisOrigenDestinoChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un país..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USA">Estados Unidos</SelectItem>
                <SelectItem value="CAN">Canadá</SelectItem>
                <SelectItem value="GTM">Guatemala</SelectItem>
                <SelectItem value="BLZ">Belice</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="via-entrada-salida">Vía de Entrada/Salida</Label>
            <Select value={data.via_entrada_salida || ''} onValueChange={handleViaEntradaSalidaChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="01">Terrestre</SelectItem>
                <SelectItem value="02">Marítima</SelectItem>
                <SelectItem value="03">Aérea</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
