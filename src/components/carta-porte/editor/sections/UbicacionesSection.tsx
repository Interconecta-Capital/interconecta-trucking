
import React, { useState } from 'react';
import { AutoRouteCalculator } from '../../ubicaciones/AutoRouteCalculator';
import { EnhancedMapVisualization } from '../../ubicaciones/EnhancedMapVisualization';
import { UbicacionesSectionOptimizada } from '../../ubicaciones/UbicacionesSectionOptimizada';

interface UbicacionesSectionProps {
  data: any[];
  onChange: (data: any[]) => void;
}

export function UbicacionesSection({ data, onChange }: UbicacionesSectionProps) {
  const [showMap, setShowMap] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [routeGeometry, setRouteGeometry] = useState<any>(null);
  const [distanciaTotal, setDistanciaTotal] = useState<number>(0);
  const [tiempoEstimado, setTiempoEstimado] = useState<number>(0);

  // Manejar cálculo de distancia desde AutoRouteCalculator
  const handleDistanceCalculated = (distancia: number, tiempo: number, geometry: any) => {
    console.log('✅ Distancia calculada en UbicacionesSection:', { distancia, tiempo });
    
    setDistanciaTotal(distancia);
    setTiempoEstimado(tiempo);
    setRouteGeometry(geometry);
    setShowMap(true);

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
            handleDistanceCalculated(datos.distanciaTotal, datos.tiempoEstimado, routeGeometry);
          }
        }}
      />

      {/* Mapa mejorado con ruta (solo si hay datos de ruta) */}
      {showMap && (
        <EnhancedMapVisualization
          ubicaciones={data}
          routeGeometry={routeGeometry}
          distanciaTotal={distanciaTotal}
          tiempoEstimado={tiempoEstimado}
          isVisible={showMap}
          onToggleFullscreen={() => setIsMapFullscreen(!isMapFullscreen)}
          isFullscreen={isMapFullscreen}
        />
      )}
    </div>
  );
}
