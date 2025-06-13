
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
  
  // Manejador optimizado para actualización de información desde CP
  const handleLocationUpdate = React.useCallback((locationData: any) => {
    console.log('[UbicacionDomicilio] Actualizando desde CP:', locationData);
    
    // Actualizar TODOS los campos del domicilio automáticamente
    if (locationData.estado) {
      onFieldChange('domicilio.estado', locationData.estado);
    }
    if (locationData.municipio) {
      onFieldChange('domicilio.municipio', locationData.municipio);
    }
    if (locationData.localidad) {
      onFieldChange('domicilio.localidad', locationData.localidad);
    }
    if (locationData.colonia) {
      onFieldChange('domicilio.colonia', locationData.colonia);
    }
    
    // Llamar callback original
    onLocationUpdate(locationData);
  }, [onFieldChange, onLocationUpdate]);

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
          onLocationUpdate={handleLocationUpdate}
          coloniaValue={formData.domicilio.colonia}
          onColoniaChange={(colonia) => onFieldChange('domicilio.colonia', colonia)}
          required
          label="Código Postal"
        />
      </div>

      {/* Campos auto-completados mejorados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Estado *</Label>
          <Input
            value={formData.domicilio.estado}
            onChange={(e) => onFieldChange('domicilio.estado', e.target.value)}
            placeholder="Estado"
            className="bg-gray-50"
            readOnly
          />
        </div>

        <div className="space-y-2">
          <Label>Municipio *</Label>
          <Input
            value={formData.domicilio.municipio}
            onChange={(e) => onFieldChange('domicilio.municipio', e.target.value)}
            placeholder="Municipio"
            className="bg-gray-50"
            readOnly
          />
        </div>
      </div>

      {/* NUEVO: Campo de Localidad ahora visible */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Localidad/Ciudad</Label>
          <Input
            value={formData.domicilio.localidad || ''}
            onChange={(e) => onFieldChange('domicilio.localidad', e.target.value)}
            placeholder="Localidad"
            className="bg-gray-50"
            readOnly
          />
        </div>

        {/* Campo de colonia visible cuando hay valor */}
        {formData.domicilio.colonia && (
          <div className="space-y-2">
            <Label>Colonia Seleccionada</Label>
            <Input
              value={formData.domicilio.colonia}
              placeholder="Colonia"
              className="bg-green-50 border-green-200"
              readOnly
            />
          </div>
        )}
      </div>

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
