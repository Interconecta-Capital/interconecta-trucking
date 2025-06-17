
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { VehiculoSelector } from './VehiculoSelector';
import { AutotransporteFormOptimizado } from './AutotransporteFormOptimizado';
import { AutotransporteCompleto } from '@/types/cartaPorte';

interface AutotransporteSectionOptimizadaProps {
  data: AutotransporteCompleto;
  onChange: (data: AutotransporteCompleto) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function AutotransporteSectionOptimizada({ 
  data, 
  onChange, 
  onNext, 
  onPrev 
}: AutotransporteSectionOptimizadaProps) {
  const isDataValid = () => {
    return data.placa_vm && 
           data.num_permiso_sct && 
           data.asegura_resp_civil && 
           data.poliza_resp_civil;
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Información del Autotransporte</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <VehiculoSelector data={data} onChange={onChange} />
        
        <AutotransporteFormOptimizado data={data} onChange={onChange} />

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
