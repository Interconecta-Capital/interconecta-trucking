
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Route, CheckCircle, AlertTriangle } from 'lucide-react';
import { useHybridRouteCalculation } from '@/hooks/useHybridRouteCalculation';
import { useAccurateGeocodingMexico } from '@/hooks/useAccurateGeocodingMexico';
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
  const { calculateRoute, isCalculating, routeData, error } = useHybridRouteCalculation();
  const { geocodeByCodigoPostal } = useAccurateGeocodingMexico();
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

  // Función de geocodificación mejorada para coordenadas precisas
  const geocodeLocation = async (ubicacion: Ubicacion): Promise<{ lat: number; lng: number } | null> => {
    // Si ya tiene coordenadas, usarlas
    if (ubicacion.coordenadas) {
      return {
        lat: ubicacion.coordenadas.latitud,
        lng: ubicacion.coordenadas.longitud
      };
    }

    // Usar geocodificación precisa por código postal
    const coords = geocodeByCodigoPostal(ubicacion.domicilio.codigoPostal);
    if (coords) {
      console.log(`📍 Coordenadas precisas para CP ${ubicacion.domicilio.codigoPostal}:`, coords);
      return {
        lat: coords.lat,
        lng: coords.lng
      };
    }

    console.warn(`⚠️ No se pudieron obtener coordenadas para CP ${ubicacion.domicilio.codigoPostal}`);
    return null;
  };

  // Auto-calcular cuando cambian las ubicaciones (solo una vez por cambio)
  useEffect(() => {
    const performAutoCalculation = async () => {
      if (!canCalculate || isCalculating || !safeUbicaciones.length) return;
      
      const currentHash = createLocationHash();
      
      // Solo calcular si las ubicaciones han cambiado y no tenemos distancia calculada
      if (currentHash !== lastCalculationHash && (!distanciaTotal || distanciaTotal === 0)) {
        console.log('🔄 Auto-calculando ruta híbrida (Mapbox para distancia + Google Maps para visualización)');
        
        try {
          // Geocodificar ubicaciones con datos precisos
          const origenCoords = await geocodeLocation(origen);
          const destinoCoords = await geocodeLocation(destino);
          
          if (!origenCoords || !destinoCoords) {
            console.warn('⚠️ No se pudieron obtener coordenadas precisas para origen/destino');
            return;
          }

          console.log('📍 Coordenadas origen:', origenCoords);
          console.log('📍 Coordenadas destino:', destinoCoords);

          // Geocodificar intermedios si existen
          const waypoints = [];
          for (const intermedio of intermedios) {
            const coords = await geocodeLocation(intermedio);
            if (coords) waypoints.push(coords);
          }

          console.log('🚀 Iniciando cálculo híbrido con coordenadas precisas');

          // Calcular ruta híbrida
          const result = await calculateRoute(origenCoords, destinoCoords, waypoints);
          
          if (result && result.success) {
            console.log('✅ Ruta híbrida calculada exitosamente:', {
              distancia: result.distance_km,
              tiempo: result.duration_minutes
            });
            
            onDistanceCalculated(
              result.distance_km,
              result.duration_minutes,
              result
            );
            setAutoCalculationDone(true);
            setLastCalculationHash(currentHash);
          } else {
            console.warn('⚠️ Cálculo de ruta híbrida falló');
          }
        } catch (error) {
          console.error('❌ Error en auto-cálculo híbrido:', error);
        }
      }
    };

    // Delay para evitar cálculos excesivos
    const timeoutId = setTimeout(performAutoCalculation, 1500);
    return () => clearTimeout(timeoutId);
  }, [safeUbicaciones, canCalculate, distanciaTotal, lastCalculationHash, isCalculating]);

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
          result
        );
        setAutoCalculationDone(true);
        setLastCalculationHash(createLocationHash());
      }
    } catch (error) {
      console.error('❌ Error en recálculo manual híbrido:', error);
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
          Cálculo Híbrido de Ruta
          {autoCalculationDone && !error && (
            <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Calculada
            </Badge>
          )}
          {error && (
            <Badge variant="destructive" className="ml-auto">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Error
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Distancia y tiempo: Mapbox • Ruta visual: Google Maps
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <RouteCalculationStatus
          isCalculating={isCalculating}
          hasUbicaciones={true}
          canCalculate={true}
        />

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              {error}
            </p>
          </div>
        )}

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
