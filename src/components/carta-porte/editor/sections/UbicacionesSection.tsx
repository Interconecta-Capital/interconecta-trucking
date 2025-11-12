
import React, { useState } from 'react';
import { UbicacionesSectionOptimizada } from '../../ubicaciones/UbicacionesSectionOptimizada';

interface UbicacionesSectionProps {
  data: any[];
  onChange: (data: any[]) => void;
  onValidationChange?: () => void;
}

export function UbicacionesSection({ data, onChange, onValidationChange }: UbicacionesSectionProps) {
  const [distanciaTotal, setDistanciaTotal] = useState<number>(0);
  const [tiempoEstimado, setTiempoEstimado] = useState<number>(0);

  // Manejar cálculo de distancia desde la sección optimizada
  const handleDistanceCalculated = (datos: { distanciaTotal?: number; tiempoEstimado?: number; forceValidation?: boolean }) => {
    console.log('✅ [UbicacionesSection] Distancia recibida:', datos);
    
    if (datos.distanciaTotal !== undefined) {
      setDistanciaTotal(datos.distanciaTotal);
    }
    if (datos.tiempoEstimado !== undefined) {
      setTiempoEstimado(datos.tiempoEstimado);
    }

    // Actualizar el destino con la distancia calculada
    if (datos.distanciaTotal !== undefined) {
      const updatedData = data.map(ubicacion => {
        if (ubicacion.tipoUbicacion === 'Destino' || ubicacion.tipo_ubicacion === 'Destino') {
          return {
            ...ubicacion,
            distancia_recorrida: datos.distanciaTotal,
            distanciaRecorrida: datos.distanciaTotal
          };
        }
        return ubicacion;
      });

      onChange(updatedData);
      
      // Forzar recálculo de validación si se solicita
      if (datos.forceValidation && onValidationChange) {
        setTimeout(() => {
          onValidationChange();
        }, 100);
      }
    }
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
        onDistanceCalculated={handleDistanceCalculated}
      />
    </div>
  );
}
