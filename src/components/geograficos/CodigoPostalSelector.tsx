
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CodigoPostalSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onLocationUpdate?: (data: any) => void;
  onPostalDataChange?: (data: any) => void;
  required?: boolean;
  error?: string;
}

export function CodigoPostalSelector({
  value,
  onChange,
  onLocationUpdate,
  onPostalDataChange,
  required = false,
  error
}: CodigoPostalSelectorProps) {
  const handleChange = (newValue: string) => {
    onChange(newValue);
    // Simular actualización de ubicación
    if (newValue.length === 5) {
      const locationData = {
        estado: 'Estado detectado',
        municipio: 'Municipio detectado',
        colonia: 'Colonia detectada'
      };
      
      if (onLocationUpdate) {
        onLocationUpdate(locationData);
      }
      
      if (onPostalDataChange) {
        onPostalDataChange(locationData);
      }
    }
  };

  return (
    <div>
      <Label htmlFor="codigo-postal">Código Postal {required && '*'}</Label>
      <Input
        id="codigo-postal"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="12345"
        maxLength={5}
        pattern="[0-9]{5}"
        required={required}
        className={error ? 'border-red-500' : ''}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  );
}
