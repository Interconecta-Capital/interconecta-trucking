
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft, Truck } from 'lucide-react';
import { AutotransporteCompleto, Remolque } from '@/types/cartaPorte';
import { AutotransporteForm } from './autotransporte/AutotransporteForm';

interface AutotransporteSectionProps {
  data: AutotransporteCompleto;
  pesoTotalMercancias: number;
  onChange: (autotransporte: AutotransporteCompleto) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function AutotransporteSection({
  data,
  pesoTotalMercancias,
  onChange,
  onNext,
  onPrev
}: AutotransporteSectionProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const validateAutotransporte = (): boolean => {
    const newErrors: string[] = [];

    if (!data.placa_vm) {
      newErrors.push('La placa del vehículo es obligatoria');
    }

    if (!data.anio_modelo_vm || data.anio_modelo_vm < 1990) {
      newErrors.push('El año del modelo debe ser válido');
    }

    if (data.peso_bruto_vehicular < pesoTotalMercancias) {
      newErrors.push('El peso bruto vehicular debe ser mayor al peso total de mercancías');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleNext = () => {
    if (validateAutotransporte()) {
      onNext();
    }
  };

  const handleRemolqueAdd = () => {
    const newRemolque: Remolque = {
      id: crypto.randomUUID(),
      placa: '',
      subtipo_remolque: 'CTR001',
      subtipo_rem: 'CTR001'
    };

    onChange({
      ...data,
      remolques: [...(data.remolques || []), newRemolque]
    });
  };

  const handleRemolqueUpdate = (index: number, remolque: Remolque) => {
    const updatedRemolques = [...(data.remolques || [])];
    updatedRemolques[index] = remolque;
    onChange({
      ...data,
      remolques: updatedRemolques
    });
  };

  const handleRemolqueDelete = (index: number) => {
    const updatedRemolques = [...(data.remolques || [])];
    updatedRemolques.splice(index, 1);
    onChange({
      ...data,
      remolques: updatedRemolques
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Información del Autotransporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AutotransporteForm
            data={data}
            onChange={onChange}
            pesoTotalMercancias={pesoTotalMercancias}
            onRemolqueAdd={handleRemolqueAdd}
            onRemolqueUpdate={handleRemolqueUpdate}
            onRemolqueDelete={handleRemolqueDelete}
          />

          {errors.length > 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Errores de validación:</h4>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={onPrev} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button onClick={handleNext} className="flex items-center gap-2">
              Continuar a Figuras
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
