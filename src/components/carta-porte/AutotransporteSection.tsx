
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Truck } from 'lucide-react';
import { AutotransporteCompleto } from '@/types/cartaPorte';

interface AutotransporteSectionProps {
  data: AutotransporteCompleto;
  onChange: (autotransporte: AutotransporteCompleto) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function AutotransporteSection({ data, onChange, onNext, onPrev }: AutotransporteSectionProps) {
  
  const updateField = (field: keyof AutotransporteCompleto, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Autotransporte
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Placa del Vehículo *</Label>
            <Input
              value={data.placa_vm}
              onChange={(e) => updateField('placa_vm', e.target.value)}
              placeholder="Placas del vehículo"
              required
            />
          </div>
          <div>
            <Label>Año Modelo</Label>
            <Input
              type="number"
              value={data.anio_modelo_vm}
              onChange={(e) => updateField('anio_modelo_vm', parseInt(e.target.value) || new Date().getFullYear())}
              placeholder="Año del modelo"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Configuración Vehicular</Label>
            <Select value={data.config_vehicular} onValueChange={(value) => updateField('config_vehicular', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar configuración" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="C2">C2 - Camión Unitario (2 ejes)</SelectItem>
                <SelectItem value="C3">C3 - Camión Unitario (3 ejes)</SelectItem>
                <SelectItem value="T3S2">T3S2 - Tractocamión Articulado</SelectItem>
                <SelectItem value="T3S3">T3S3 - Tractocamión Articulado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Permiso SCT</Label>
            <Select value={data.perm_sct} onValueChange={(value) => updateField('perm_sct', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar permiso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TPAF01">TPAF01 - Autotransporte Federal de Carga</SelectItem>
                <SelectItem value="TPAF02">TPAF02 - Transporte Privado</SelectItem>
                <SelectItem value="TPAF03">TPAF03 - Turismo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Número de Permiso SCT</Label>
          <Input
            value={data.num_permiso_sct}
            onChange={(e) => updateField('num_permiso_sct', e.target.value)}
            placeholder="Número del permiso SCT"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Aseguradora Responsabilidad Civil</Label>
            <Input
              value={data.asegura_resp_civil}
              onChange={(e) => updateField('asegura_resp_civil', e.target.value)}
              placeholder="Nombre de la aseguradora"
            />
          </div>
          <div>
            <Label>Póliza Responsabilidad Civil</Label>
            <Input
              value={data.poliza_resp_civil}
              onChange={(e) => updateField('poliza_resp_civil', e.target.value)}
              placeholder="Número de póliza"
            />
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev}>
            Anterior
          </Button>
          <Button onClick={onNext} disabled={!data.placa_vm}>
            Continuar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
