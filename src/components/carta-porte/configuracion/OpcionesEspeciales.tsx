
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Globe, MapPin } from 'lucide-react';
import { CartaPorteData } from '../CartaPorteForm';

interface OpcionesEspecialesProps {
  data: CartaPorteData;
  onChange: (data: Partial<CartaPorteData>) => void;
}

export function OpcionesEspeciales({ data, onChange }: OpcionesEspecialesProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Opciones Especiales</h3>
      
      <div className="flex items-center space-x-2">
        <Switch
          checked={data.transporteInternacional}
          onCheckedChange={(checked) => onChange({ transporteInternacional: checked })}
        />
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4" />
          <Label>Transporte Internacional</Label>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={data.registroIstmo}
          onCheckedChange={(checked) => onChange({ registroIstmo: checked })}
        />
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4" />
          <Label>Registro Istmo</Label>
        </div>
      </div>

      {/* Campos adicionales para transporte internacional */}
      {data.transporteInternacional && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 border rounded-lg bg-blue-50">
          <div className="space-y-2">
            <Label>Entrada/Salida Mercancía</Label>
            <Select 
              value={data.entrada_salida_merc || ''} 
              onValueChange={(value) => onChange({ entrada_salida_merc: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Entrada">Entrada</SelectItem>
                <SelectItem value="Salida">Salida</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>País Origen/Destino</Label>
            <Input
              value={data.pais_origen_destino || ''}
              onChange={(e) => onChange({ pais_origen_destino: e.target.value })}
              placeholder="Código del país"
            />
          </div>

          <div className="space-y-2">
            <Label>Vía Entrada/Salida</Label>
            <Input
              value={data.via_entrada_salida || ''}
              onChange={(e) => onChange({ via_entrada_salida: e.target.value })}
              placeholder="Vía de entrada/salida"
            />
          </div>
        </div>
      )}
    </div>
  );
}
