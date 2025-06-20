
import React, { useState } from 'react';
import { UbicacionesSectionOptimizada } from '../../ubicaciones/UbicacionesSectionOptimizada';

interface UbicacionesSectionProps {
  data: any[];
  onChange: (data: any[]) => void;
}

export function UbicacionesSection({ data, onChange }: UbicacionesSectionProps) {
  const [distanciaTotal, setDistanciaTotal] = useState<number>(0);
  const [tiempoEstimado, setTiempoEstimado] = useState<number>(0);

  // Manejar cálculo de distancia desde la sección optimizada
  const handleDistanceCalculated = (distancia: number, tiempo: number) => {
    console.log('✅ Distancia calculada en UbicacionesSection:', { distancia, tiempo });
    
    setDistanciaTotal(distancia);
    setTiempoEstimado(tiempo);

    // Actualizar el destino con la distancia calculada
    const updatedData = data.map(ubicacion => {
      if (ubicacion.tipoUbicacion === 'Destino') {
        return {
          ...ubicacion,
          distanciaRecorrida: distancia
        };
      }
      return ubicacion;
    });

    onChange(updatedData);
  };

  return (
    <div className="space-y-6">
      {/* Sección optimizada de ubicaciones con calculadora híbrida integrada */}
      <UbicacionesSectionOptimizada
        data={data}
        onChange={onChange}
        onNext={() => {}}
        onPrev={() => {}}
        cartaPorteId={undefined}
        onDistanceCalculated={(datos) => {
          if (datos.distanciaTotal && datos.tiempoEstimado) {
            handleDistanceCalculated(datos.distanciaTotal, datos.tiempoEstimado);
          }
        }}
      />
    </div>
  );
}
