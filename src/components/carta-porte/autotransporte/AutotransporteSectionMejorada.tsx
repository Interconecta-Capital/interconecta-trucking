
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VehiculoSelectorSimplificado } from './VehiculoSelectorSimplificado';
import { RemolqueSelectorSimplificado } from './RemolqueSelectorSimplificado';
import { AutotransporteCompleto } from '@/types/cartaPorte';

interface AutotransporteSectionMejoradaProps {
  data: AutotransporteCompleto;
  onChange: (data: AutotransporteCompleto) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function AutotransporteSectionMejorada({ 
  data, 
  onChange, 
  onNext, 
  onPrev 
}: AutotransporteSectionMejoradaProps) {
  const isDataValid = () => {
    const camposRequeridos = [
      { campo: 'placa_vm', nombre: 'Placa del vehículo' },
      { campo: 'num_permiso_sct', nombre: 'Número de permiso SCT' },
      { campo: 'asegura_resp_civil', nombre: 'Aseguradora de responsabilidad civil' },
      { campo: 'poliza_resp_civil', nombre: 'Póliza de responsabilidad civil' }
    ];

    return camposRequeridos.every(({ campo }) => data[campo as keyof AutotransporteCompleto]);
  };

  const getCamposFaltantes = () => {
    const camposRequeridos = [
      { campo: 'placa_vm', nombre: 'Placa del vehículo' },
      { campo: 'num_permiso_sct', nombre: 'Número de permiso SCT' },
      { campo: 'asegura_resp_civil', nombre: 'Aseguradora de responsabilidad civil' },
      { campo: 'poliza_resp_civil', nombre: 'Póliza de responsabilidad civil' }
    ];

    return camposRequeridos
      .filter(({ campo }) => !data[campo as keyof AutotransporteCompleto])
      .map(({ nombre }) => nombre);
  };

  const camposFaltantes = getCamposFaltantes();

  return (
    <>
      <CardHeader>
        <CardTitle>Información del Autotransporte</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <VehiculoSelectorSimplificado data={data} onChange={onChange} />
        
        <RemolqueSelectorSimplificado
          remolques={data.remolques || []}
          onChange={(remolques) => onChange({ ...data, remolques })}
        />

        {camposFaltantes.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Campos requeridos faltantes:</strong>
              <ul className="list-disc list-inside mt-2">
                {camposFaltantes.map((campo, index) => (
                  <li key={index}>{campo}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Anterior</span>
          </Button>
          <Button 
            onClick={onNext} 
            disabled={!isDataValid()}
            className="flex items-center space-x-2"
          >
            <span>Siguiente</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </>
  );
}
