
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CatalogoSelector } from '@/components/catalogos/CatalogoSelector';
import { useSubtiposRemolque } from '@/hooks/useCatalogos';
import { VehicleValidator } from '@/utils/vehicleValidation';
import { RemolqueData } from '@/hooks/useAutotransporte';

interface RemolqueFormProps {
  remolque?: RemolqueData;
  onSave: (remolque: RemolqueData) => void;
  onCancel: () => void;
}

export function RemolqueForm({ remolque, onSave, onCancel }: RemolqueFormProps) {
  const [formData, setFormData] = useState<RemolqueData>({
    placa: '',
    subtipo_rem: '',
  });
  const [erroresValidacion, setErroresValidacion] = useState<Record<string, string[]>>({});
  const { data: subtiposRemolque } = useSubtiposRemolque();

  useEffect(() => {
    if (remolque) {
      setFormData(remolque);
    }
  }, [remolque]);

  const handlePlacaChange = (value: string) => {
    const placaFormateada = VehicleValidator.formatearPlaca(value);
    const validacion = VehicleValidator.validarPlaca(placaFormateada);
    
    setErroresValidacion(prev => ({
      ...prev,
      placa: validacion.errores
    }));

    setFormData(prev => ({ ...prev, placa: placaFormateada }));
  };

  const handleSubtipoChange = (clave: string) => {
    setFormData(prev => ({ ...prev, subtipo_rem: clave }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar datos
    const placaValidacion = VehicleValidator.validarPlaca(formData.placa);
    const errores: Record<string, string[]> = {};
    
    if (!placaValidacion.esValido) {
      errores.placa = placaValidacion.errores;
    }
    
    if (!formData.subtipo_rem) {
      errores.subtipo_rem = ['El subtipo de remolque es requerido'];
    }

    setErroresValidacion(errores);

    if (Object.keys(errores).length === 0) {
      onSave(formData);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {remolque ? 'Editar Remolque' : 'Agregar Remolque'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="placa_remolque">Placa del Remolque *</Label>
              <Input
                id="placa_remolque"
                value={formData.placa}
                onChange={(e) => handlePlacaChange(e.target.value)}
                placeholder="ABC-1234"
                className={erroresValidacion.placa?.length ? 'border-red-500' : ''}
              />
              {erroresValidacion.placa?.map((error, index) => (
                <p key={index} className="text-sm text-red-600 mt-1">{error}</p>
              ))}
            </div>

            <div>
              <CatalogoSelector
                label="Subtipo de Remolque"
                items={subtiposRemolque || []}
                value={formData.subtipo_rem}
                onValueChange={handleSubtipoChange}
                placeholder="Seleccionar subtipo..."
                required
              />
              {erroresValidacion.subtipo_rem?.map((error, index) => (
                <p key={index} className="text-sm text-red-600 mt-1">{error}</p>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <Button type="submit" className="flex-1">
              {remolque ? 'Actualizar' : 'Agregar'} Remolque
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
