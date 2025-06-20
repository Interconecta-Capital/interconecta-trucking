
import { useState, useEffect, useCallback } from 'react';
import { Ubicacion } from '@/types/ubicaciones';
import { useGoogleRouteCalculation } from '@/hooks/useGoogleRouteCalculation';
import { useRouteGeocoding } from './useRouteGeocoding';

interface UseAutoRouteCalculationProps {
  ubicaciones: Ubicacion[];
  onDistanceCalculated: (distancia: number, tiempo: number, geometry: any) => void;
  distanciaTotal?: number;
  tiempoEstimado?: number;
}

export function useAutoRouteCalculation({
  ubicaciones,
  onDistanceCalculated,
  distanciaTotal,
  tiempoEstimado
}: UseAutoRouteCalculationProps) {
  const { calculateRoute, isCalculating, routeData, error } = useGoogleRouteCalculation();
  const { geocodeMultipleLocations } = useRouteGeocoding();
  const [autoCalculationDone, setAutoCalculationDone] = useState(false);
  const [lastCalculationHash, setLastCalculationHash] = useState<string>('');

  // Add safety check for ubicaciones
  const safeUbicaciones = ubicaciones || [];

  // Obtener origen y destino válidos
  const origen = safeUbicaciones.find(u => u.tipoUbicacion === 'Origen');
  const destino = safeUbicaciones.find(u => u.tipoUbicacion === 'Destino');

  // Verificar si tenemos datos suficientes para calcular
  const canCalculate = origen && destino && 
    origen.domicilio?.codigoPostal && origen.domicilio?.calle &&
    destino.domicilio?.codigoPostal && destino.domicilio?.calle;

  // Crear hash de ubicaciones para detectar cambios
  const createLocationHash = useCallback(() => {
    if (!canCalculate) return '';
    
    const intermedios = safeUbicaciones.filter(u => u.tipoUbicacion === 'Paso Intermedio');
    const locationData = {
      origen: `${origen.domicilio.calle}-${origen.domicilio.codigoPostal}`,
      destino: `${destino.domicilio.calle}-${destino.domicilio.codigoPostal}`,
      intermedios: intermedios.map(i => `${i.domicilio?.calle}-${i.domicilio?.codigoPostal}`).join('|')
    };
    
    return JSON.stringify(locationData);
  }, [canCalculate, origen, destino, safeUbicaciones]);

  // Auto-calcular cuando cambian las ubicaciones
  useEffect(() => {
    const performAutoCalculation = async () => {
      if (!canCalculate || isCalculating || !safeUbicaciones.length) return;
      
      const currentHash = createLocationHash();
      
      // Solo calcular si las ubicaciones han cambiado y no tenemos distancia calculada
      if (currentHash !== lastCalculationHash && (!distanciaTotal || distanciaTotal === 0)) {
        console.log('🔄 Auto-calculando ruta con Google Maps por cambio en ubicaciones');
        
        try {
          const { origenCoords, destinoCoords, waypoints } = await geocodeMultipleLocations(safeUbicaciones);
          
          if (!origenCoords || !destinoCoords) {
            console.warn('⚠️ No se pudieron obtener coordenadas para origen/destino');
            return;
          }

          console.log('🚀 Iniciando cálculo con Google Maps:', { origenCoords, destinoCoords, waypoints });

          // Calcular ruta
          const result = await calculateRoute(origenCoords, destinoCoords, waypoints);
          
          if (result && result.success) {
            console.log('✅ Ruta calculada exitosamente con Google Maps, notificando componente padre');
            onDistanceCalculated(
              result.distance_km,
              result.duration_minutes,
              result
            );
            setAutoCalculationDone(true);
            setLastCalculationHash(currentHash);
          } else {
            console.warn('⚠️ Cálculo de ruta falló, pero manteniendo ubicaciones');
          }
        } catch (error) {
          console.error('❌ Error en auto-cálculo con Google Maps (no crítico):', error);
          // No lanzamos el error para evitar que se pierdan las ubicaciones
        }
      }
    };

    // Delay para evitar cálculos excesivos
    const timeoutId = setTimeout(performAutoCalculation, 1500);
    return () => clearTimeout(timeoutId);
  }, [safeUbicaciones, canCalculate, distanciaTotal, lastCalculationHash, isCalculating, createLocationHash, geocodeMultipleLocations, calculateRoute, onDistanceCalculated]);

  // Recalcular manualmente
  const handleManualRecalculation = useCallback(async () => {
    if (!canCalculate) return;
    
    try {
      const { origenCoords, destinoCoords, waypoints } = await geocodeMultipleLocations(safeUbicaciones);
      
      if (!origenCoords || !destinoCoords) return;

      const result = await calculateRoute(origenCoords, destinoCoords, waypoints);
      
      if (result && result.success) {
        onDistanceCalculated(
          result.distance_km,
          result.duration_minutes,
          result
        );
        setAutoCalculationDone(true);
        setLastCalculationHash(createLocationHash());
      }
    } catch (error) {
      console.error('❌ Error en recálculo manual con Google Maps:', error);
    }
  }, [canCalculate, geocodeMultipleLocations, safeUbicaciones, calculateRoute, onDistanceCalculated, createLocationHash]);

  return {
    safeUbicaciones,
    origen,
    destino,
    canCalculate,
    isCalculating,
    routeData,
    error,
    autoCalculationDone,
    handleManualRecalculation
  };
}
