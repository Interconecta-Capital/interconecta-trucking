
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AutotransporteCompleto } from '@/types/cartaPorte';

interface AutotransporteFormProps {
  data: AutotransporteCompleto;
  onChange: (autotransporte: AutotransporteCompleto) => void;
}

export function AutotransporteForm({
  data,
  onChange
}: AutotransporteFormProps) {
  const [formData, setFormData] = useState<AutotransporteCompleto>(data);

  useEffect(() => {
    setFormData(data);
  }, [data]);

  const handleChange = (field: keyof AutotransporteCompleto, value: any) => {
    const updatedData = {
      ...formData,
      [field]: value
    };
    setFormData(updatedData);
    onChange(updatedData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información del Autotransporte</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Permiso SCT *</Label>
            <Select
              value={formData.perm_sct}
              onValueChange={(value) => handleChange('perm_sct', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona permiso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TPAF01">TPAF01 - Autotransporte Federal</SelectItem>
                <SelectItem value="TPAF02">TPAF02 - Transporte Privado</SelectItem>
                <SelectItem value="TPAF03">TPAF03 - Turismo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Número de Permiso SCT</Label>
            <Input
              value={formData.num_permiso_sct || ''}
              onChange={(e) => handleChange('num_permiso_sct', e.target.value)}
              placeholder="Número de permiso"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Placa del Vehículo *</Label>
            <Input
              value={formData.placa_vm}
              onChange={(e) => handleChange('placa_vm', e.target.value.toUpperCase())}
              placeholder="ABC1234"
              className="uppercase"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Año del Modelo *</Label>
            <Input
              type="number"
              value={formData.anio_modelo_vm}
              onChange={(e) => handleChange('anio_modelo_vm', parseInt(e.target.value))}
              placeholder="2023"
              min="1980"
              max="2030"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Aseguradora Responsabilidad Civil *</Label>
            <Input
              value={formData.asegura_resp_civil}
              onChange={(e) => handleChange('asegura_resp_civil', e.target.value)}
              placeholder="Nombre de la aseguradora"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Póliza Responsabilidad Civil *</Label>
            <Input
              value={formData.poliza_resp_civil}
              onChange={(e) => handleChange('poliza_resp_civil', e.target.value)}
              placeholder="Número de póliza"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Peso Bruto Vehicular (kg) *</Label>
            <Input
              type="number"
              value={formData.peso_bruto_vehicular}
              onChange={(e) => handleChange('peso_bruto_vehicular', parseFloat(e.target.value))}
              placeholder="0"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Capacidad de Carga (kg) *</Label>
            <Input
              type="number"
              value={formData.capacidad_carga}
              onChange={(e) => handleChange('capacidad_carga', parseFloat(e.target.value))}
              placeholder="0"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Configuración Vehicular *</Label>
          <Select
            value={formData.config_vehicular}
            onValueChange={(value) => handleChange('config_vehicular', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona configuración" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VL">VL - Vehículo Ligero</SelectItem>
              <SelectItem value="C2">C2 - Camión de 2 ejes</SelectItem>
              <SelectItem value="C3">C3 - Camión de 3 ejes</SelectItem>
              <SelectItem value="T3S2">T3S2 - Tractocamión + Semirremolque</SelectItem>
              <SelectItem value="T3S3">T3S3 - Tractocamión + Semirremolque 3 ejes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
