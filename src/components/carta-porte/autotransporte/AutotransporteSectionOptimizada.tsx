
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { VehiculoSelector } from './VehiculoSelector';
import { AutotransporteFormOptimizado } from './AutotransporteFormOptimizado';
import { AlertaCapacidadVehiculo } from './AlertaCapacidadVehiculo';
import { AutotransporteCompleto } from '@/types/cartaPorte';

interface AutotransporteSectionOptimizadaProps {
  data: AutotransporteCompleto;
  pesoTotalMercancias: number;
  onChange: (data: AutotransporteCompleto) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function AutotransporteSectionOptimizada({
  data,
  pesoTotalMercancias,
  onChange,
  onNext,
  onPrev
}: AutotransporteSectionOptimizadaProps) {
  
  const isDataValid = () => {
    return data.placa_vm &&
           data.num_permiso_sct &&
           data.asegura_resp_civil &&
           data.poliza_resp_civil &&
           // *** CORRECCIÓN: Validar peso bruto vehicular obligatorio ***
           data.peso_bruto_vehicular && data.peso_bruto_vehicular > 0;
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Información del Autotransporte</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <VehiculoSelector data={data} onChange={onChange} />
        
        <AutotransporteFormOptimizado data={data} onChange={onChange} />

        {/* *** NUEVA FUNCIONALIDAD: Alerta inteligente de capacidad *** */}
        {data.peso_bruto_vehicular && pesoTotalMercancias > 0 && (
          <AlertaCapacidadVehiculo
            pesoTotalMercancias={pesoTotalMercancias}
            capacidadVehiculoToneladas={data.peso_bruto_vehicular}
          />
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
