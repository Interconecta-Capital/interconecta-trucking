import React, { memo } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CartaPorteData } from '@/types/cartaPorte';

interface OpcionesEspecialesProps {
  data: CartaPorteData;
  onChange: (data: Partial<CartaPorteData>) => void;
}

const OpcionesEspecialesComponent = ({ data, onChange }: OpcionesEspecialesProps) => {
  const isTransporteInternacional = data.transporteInternacional === 'Sí' || data.transporteInternacional === true;

  const handleTransporteInternacionalChange = (checked: boolean) => {
    const updates: Partial<CartaPorteData> = {
      transporteInternacional: checked ? 'Sí' : 'No'
    };

    if (!checked) {
      updates.pais_origen_destino = '';
      updates.via_entrada_salida = '';
    }
    
    // Si se activa, preseleccionar valores si no los hay
    if (checked) {
        updates.entradaSalidaMerc = data.entradaSalidaMerc || 'Salida';
        updates.viaTransporte = data.viaTransporte || '01';
    }

    onChange(updates);
  };

  const handleRegistroIstmoChange = (checked: boolean) => {
    onChange({ registroIstmo: checked });
  };
  
  const handleFieldChange = (field: keyof CartaPorteData, value: string) => {
    onChange({ [field]: value });
  };

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
              checked={!!data.registroIstmo}
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
            <Select 
              value={data.entradaSalidaMerc || ''} 
              onValueChange={(value) => handleFieldChange('entradaSalidaMerc', value)}
              // SIEMPRE habilitado, no condicionado a isTransporteInternacional
              // disabled={!isTransporteInternacional}
            >
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
            <Select 
              value={data.viaTransporte || ''} 
              onValueChange={(value) => handleFieldChange('viaTransporte', value)}
              // SIEMPRE habilitado, no condicionado a isTransporteInternacional
              // disabled={!isTransporteInternacional}
            >
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

      {/* SOLO los campos estrictamente internacionales siguen condicionados */}
      {isTransporteInternacional && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <Label htmlFor="pais-origen-destino">País de Origen/Destino</Label>
            <Select 
              value={data.pais_origen_destino || ''} 
              onValueChange={(value) => handleFieldChange('pais_origen_destino', value)}
            >
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
            <Select 
              value={data.via_entrada_salida || ''} 
              onValueChange={(value) => handleFieldChange('via_entrada_salida', value)}
            >
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div>
          <Label htmlFor="total-dist-rec">Distancia Total Recorrida (km)</Label>
          <Input
            id="total-dist-rec"
            type="number"
            value={data.totalDistRec || ''}
            onChange={e => handleFieldChange('totalDistRec', Number(e.target.value))}
            placeholder="0"
          />
        </div>
        <div>
          <Label htmlFor="regimen-aduanero">Régimen Aduanero</Label>
          <Input
            id="regimen-aduanero"
            value={data.regimenAduanero || ''}
            onChange={e => handleFieldChange('regimenAduanero', e.target.value)}
            placeholder="Regimen"
          />
        </div>
      </div>
    </div>
  );
};

export const OpcionesEspeciales = memo(OpcionesEspecialesComponent);
