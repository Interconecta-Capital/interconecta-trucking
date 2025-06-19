
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Route, CheckCircle } from 'lucide-react';
import { useRouteCalculation } from '@/hooks/useRouteCalculation';
import { Ubicacion } from '@/types/ubicaciones';
import { RouteCalculationStatus } from './RouteCalculationStatus';
import { RouteMetricsDisplay } from './RouteMetricsDisplay';
import { RouteControls } from './RouteControls';

interface AutoRouteCalculatorProps {
  ubicaciones: Ubicacion[];
  onDistanceCalculated: (distancia: number, tiempo: number, geometry: any) => void;
  distanciaTotal?: number;
  tiempoEstimado?: number;
}

export function AutoRouteCalculator({
  ubicaciones,
  onDistanceCalculated,
  distanciaTotal,
  tiempoEstimado
}: AutoRouteCalculatorProps) {
  const { calculateRoute, isCalculating, routeData } = useRouteCalculation();
  const [autoCalculationDone, setAutoCalculationDone] = useState(false);
  const [lastCalculationHash, setLastCalculationHash] = useState<string>('');

  // Add safety check for ubicaciones
  const safeUbicaciones = ubicaciones || [];

  // Obtener origen y destino válidos
  const origen = safeUbicaciones.find(u => u.tipoUbicacion === 'Origen');
  const destino = safeUbicaciones.find(u => u.tipoUbicacion === 'Destino');
  const intermedios = safeUbicaciones.filter(u => u.tipoUbicacion === 'Paso Intermedio');

  // Verificar si tenemos datos suficientes para calcular
  const canCalculate = origen && destino && 
    origen.domicilio?.codigoPostal && origen.domicilio?.calle &&
    destino.domicilio?.codigoPostal && destino.domicilio?.calle;

  // Crear hash de ubicaciones para detectar cambios
  const createLocationHash = () => {
    if (!canCalculate) return '';
    
    const locationData = {
      origen: `${origen.domicilio.calle}-${origen.domicilio.codigoPostal}`,
      destino: `${destino.domicilio.calle}-${destino.domicilio.codigoPostal}`,
      intermedios: intermedios.map(i => `${i.domicilio?.calle}-${i.domicilio?.codigoPostal}`).join('|')
    };
    
    return JSON.stringify(locationData);
  };

  // Función de geocodificación simplificada para coordenadas
  const geocodeLocation = async (ubicacion: Ubicacion): Promise<{ lat: number; lng: number } | null> => {
    // Si ya tiene coordenadas, usarlas
    if (ubicacion.coordenadas) {
      return {
        lat: ubicacion.coordenadas.latitud,
        lng: ubicacion.coordenadas.longitud
      };
    }

    // Simulación de coordenadas basadas en código postal (esto se puede mejorar)
    // En un caso real, harías geocodificación aquí
    const cpMap: { [key: string]: { lat: number; lng: number } } = {
      '01000': { lat: 19.4326, lng: -99.1332 }, // CDMX Centro
      '03100': { lat: 19.3927, lng: -99.1588 }, // Del Valle
      '06700': { lat: 19.4284, lng: -99.1676 }, // Roma Norte
      '11000': { lat: 19.4069, lng: -99.1716 }, // San Miguel Chapultepec
    };

    const coords = cpMap[ubicacion.domicilio.codigoPostal];
    if (coords) {
      return coords;
    }

    // Coordenadas por defecto para México si no se encuentra
    return { lat: 19.4326, lng: -99.1332 };
  };

  // Auto-calcular cuando cambian las ubicaciones
  useEffect(() => {
    const performAutoCalculation = async () => {
      if (!canCalculate || isCalculating || !safeUbicaciones.length) return;
      
      const currentHash = createLocationHash();
      
      // Solo calcular si las ubicaciones han cambiado y no tenemos distancia calculada
      if (currentHash !== lastCalculationHash && (!distanciaTotal || distanciaTotal === 0)) {
        console.log('🔄 Auto-calculando ruta por cambio en ubicaciones');
        
        try {
          // Geocodificar ubicaciones
          const origenCoords = await geocodeLocation(origen);
          const destinoCoords = await geocodeLocation(destino);
          
          if (!origenCoords || !destinoCoords) {
            console.warn('No se pudieron obtener coordenadas para origen/destino');
            return;
          }

          // Geocodificar intermedios si existen
          const waypoints = [];
          for (const intermedio of intermedios) {
            const coords = await geocodeLocation(intermedio);
            if (coords) waypoints.push(coords);
          }

          // Calcular ruta
          const result = await calculateRoute(origenCoords, destinoCoords, waypoints);
          
          if (result && result.success) {
            onDistanceCalculated(
              result.distance_km,
              result.duration_minutes,
              result.route_geometry
            );
            setAutoCalculationDone(true);
            setLastCalculationHash(currentHash);
          }
        } catch (error) {
          console.error('Error en auto-cálculo:', error);
        }
      }
    };

    // Delay para evitar cálculos excesivos
    const timeoutId = setTimeout(performAutoCalculation, 1000);
    return () => clearTimeout(timeoutId);
  }, [safeUbicaciones, canCalculate, distanciaTotal, lastCalculationHash]);

  // Recalcular manualmente
  const handleManualRecalculation = async () => {
    if (!canCalculate) return;
    
    try {
      const origenCoords = await geocodeLocation(origen);
      const destinoCoords = await geocodeLocation(destino);
      
      if (!origenCoords || !destinoCoords) return;

      const waypoints = [];
      for (const intermedio of intermedios) {
        const coords = await geocodeLocation(intermedio);
        if (coords) waypoints.push(coords);
      }

      const result = await calculateRoute(origenCoords, destinoCoords, waypoints);
      
      if (result && result.success) {
        onDistanceCalculated(
          result.distance_km,
          result.duration_minutes,
          result.route_geometry
        );
        setAutoCalculationDone(true);
        setLastCalculationHash(createLocationHash());
      }
    } catch (error) {
      console.error('Error en recálculo manual:', error);
    }
  };

  // Check if we should show the status component instead of the main calculator
  if (!safeUbicaciones.length || !canCalculate) {
    return (
      <RouteCalculationStatus
        isCalculating={isCalculating}
        hasUbicaciones={safeUbicaciones.length > 0}
        canCalculate={!!canCalculate}
      />
    );
  }

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Route className="h-5 w-5" />
          Cálculo Automático de Ruta
          {autoCalculationDone && (
            <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Calculada
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <RouteCalculationStatus
          isCalculating={isCalculating}
          hasUbicaciones={true}
          canCalculate={true}
        />

        <RouteMetricsDisplay
          distanciaTotal={distanciaTotal || 0}
          tiempoEstimado={tiempoEstimado || 0}
        />

        <RouteControls
          origen={origen}
          destino={destino}
          intermedios={intermedios}
          isCalculating={isCalculating}
          onRecalculate={handleManualRecalculation}
        />
      </CardContent>
    </Card>
  );
}
