
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CodigoPostalInput } from '@/components/catalogos/CodigoPostalInput';
import { Ubicacion } from '@/hooks/useUbicaciones';

interface UbicacionDomicilioFormProps {
  formData: Ubicacion;
  onFieldChange: (field: string, value: any) => void;
  onLocationUpdate: (locationData: any) => void;
}

export function UbicacionDomicilioForm({
  formData,
  onFieldChange,
  onLocationUpdate
}: UbicacionDomicilioFormProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Domicilio</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>País *</Label>
          <Select 
            value={formData.domicilio.pais} 
            onValueChange={(value) => onFieldChange('domicilio.pais', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background border shadow-lg z-50">
              <SelectItem value="México">México</SelectItem>
              <SelectItem value="Estados Unidos">Estados Unidos</SelectItem>
              <SelectItem value="Canadá">Canadá</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <CodigoPostalInput
          value={formData.domicilio.codigoPostal}
          onChange={(cp) => onFieldChange('domicilio.codigoPostal', cp)}
          onLocationUpdate={onLocationUpdate}
          coloniaValue={formData.domicilio.colonia}
          onColoniaChange={(colonia) => onFieldChange('domicilio.colonia', colonia)}
          required
        />
      </div>

      {/* Campos auto-completados */}
      {formData.domicilio.estado && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Estado *</Label>
            <Input
              value={formData.domicilio.estado}
              onChange={(e) => onFieldChange('domicilio.estado', e.target.value)}
              placeholder="Estado"
              className="bg-gray-50"
            />
          </div>

          <div className="space-y-2">
            <Label>Municipio *</Label>
            <Input
              value={formData.domicilio.municipio}
              onChange={(e) => onFieldChange('domicilio.municipio', e.target.value)}
              placeholder="Municipio"
              className="bg-gray-50"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Calle *</Label>
          <Input
            value={formData.domicilio.calle}
            onChange={(e) => onFieldChange('domicilio.calle', e.target.value)}
            placeholder="Nombre de la calle"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Número Exterior *</Label>
          <Input
            value={formData.domicilio.numExterior}
            onChange={(e) => onFieldChange('domicilio.numExterior', e.target.value)}
            placeholder="123"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Número Interior</Label>
          <Input
            value={formData.domicilio.numInterior}
            onChange={(e) => onFieldChange('domicilio.numInterior', e.target.value)}
            placeholder="A, B, 1, 2..."
          />
        </div>

        <div className="space-y-2">
          <Label>Referencia</Label>
          <Input
            value={formData.domicilio.referencia}
            onChange={(e) => onFieldChange('domicilio.referencia', e.target.value)}
            placeholder="Entre calles, cerca de..."
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Distancia Recorrida (km)</Label>
        <Input
          type="number"
          value={formData.distanciaRecorrida}
          onChange={(e) => onFieldChange('distanciaRecorrida', parseFloat(e.target.value) || 0)}
          placeholder="0"
          min="0"
          step="0.1"
        />
      </div>
    </div>
  );
}
