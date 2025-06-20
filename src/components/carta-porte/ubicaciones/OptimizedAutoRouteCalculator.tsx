
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Route, CheckCircle, AlertTriangle, MapPin, Clock, RefreshCw } from 'lucide-react';
import { useHybridRouteCalculation } from '@/hooks/useHybridRouteCalculation';
import { useAccurateGeocodingMexico } from '@/hooks/useAccurateGeocodingMexico';
import { Ubicacion } from '@/types/ubicaciones';
import { RouteCalculationStatus } from './RouteCalculationStatus';
import { RouteControls } from './RouteControls';
import { StableGoogleMap } from './StableGoogleMap';
import { toast } from 'sonner';

interface OptimizedAutoRouteCalculatorProps {
  ubicaciones: Ubicacion[];
  onDistanceCalculated: (distancia: number, tiempo: number, geometry: any) => void;
  distanciaTotal?: number;
  tiempoEstimado?: number;
}

export function OptimizedAutoRouteCalculator({
  ubicaciones,
  onDistanceCalculated,
  distanciaTotal,
  tiempoEstimado
}: OptimizedAutoRouteCalculatorProps) {
  const { calculateRoute, isCalculating, routeData, error } = useHybridRouteCalculation();
  const { geocodeByCodigoPostal } = useAccurateGeocodingMexico();
  
  const [calculationState, setCalculationState] = useState({
    autoCalculationDone: false,
    lastCalculationHash: '',
    showMap: false,
    isMapFullscreen: false,
    retryCount: 0,
  });

  const calculationTimeoutRef = useRef<NodeJS.Timeout>();
  const stableRef = useRef({ ubicaciones, distanciaTotal, tiempoEstimado });

  // Update stable ref
  useEffect(() => {
    stableRef.current = { ubicaciones, distanciaTotal, tiempoEstimado };
  }, [ubicaciones, distanciaTotal, tiempoEstimado]);

  // Safety check for ubicaciones
  const safeUbicaciones = ubicaciones || [];

  // Get valid origin and destination
  const origen = safeUbicaciones.find(u => u.tipoUbicacion === 'Origen');
  const destino = safeUbicaciones.find(u => u.tipoUbicacion === 'Destino');
  const intermedios = safeUbicaciones.filter(u => u.tipoUbicacion === 'Paso Intermedio');

  // Check if we can calculate
  const canCalculate = origen && destino && 
    origen.domicilio?.codigoPostal && origen.domicilio?.calle &&
    destino.domicilio?.codigoPostal && destino.domicilio?.calle;

  // Helper function to create location hash
  const createLocationHash = useCallback(() => {
    return safeUbicaciones
      .map(u => `${u.tipoUbicacion}-${u.domicilio?.codigoPostal}-${u.domicilio?.calle}`)
      .join('|');
  }, [safeUbicaciones]);

  // Stable geocoding function
  const geocodeLocation = useCallback(async (ubicacion: Ubicacion | undefined) => {
    if (!ubicacion || !ubicacion.domicilio) {
      console.warn('⚠️ Ubicación o domicilio no válido para geocodificación');
      return null;
    }
    
    // If it already has precise coordinates, use them
    if (ubicacion.coordenadas && ubicacion.coordenadas.latitud && ubicacion.coordenadas.longitud) {
      console.log('📍 Using existing coordinates:', ubicacion.coordenadas);
      return {
        lat: ubicacion.coordenadas.latitud,
        lng: ubicacion.coordenadas.longitud
      };
    }
    
    // Use the improved Mexican geocoding service
    try {
      const coords = geocodeByCodigoPostal(ubicacion.domicilio.codigoPostal);
      
      if (coords && coords.lat && coords.lng) {
        console.log(`📍 Coordinates obtained for CP ${ubicacion.domicilio.codigoPostal}:`, coords);
        return {
          lat: coords.lat,
          lng: coords.lng
        };
      }
    } catch (error) {
      console.error('❌ Error in geocoding:', error);
    }
    
    console.warn(`⚠️ Could not obtain coordinates for CP: ${ubicacion.domicilio.codigoPostal}`);
    return null;
  }, [geocodeByCodigoPostal]);

  // Optimized auto-calculation with better error handling and persistence
  useEffect(() => {
    if (!canCalculate || isCalculating || !safeUbicaciones.length) return;
    
    const currentHash = createLocationHash();
    
    // Only calculate if locations have changed and we don't have distance calculated
    if (currentHash !== calculationState.lastCalculationHash && 
        (!distanciaTotal || distanciaTotal === 0)) {
      
      console.log('🔄 Starting automatic route calculation');
      
      // Clear any existing timeout
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current);
      }

      // Debounce calculation to avoid excessive calls
      calculationTimeoutRef.current = setTimeout(async () => {
        try {
          setCalculationState(prev => ({ ...prev, retryCount: 0 }));

          // Geocode locations with improved error handling
          const origenCoords = await geocodeLocation(origen);
          const destinoCoords = await geocodeLocation(destino);
          
          if (!origenCoords || !destinoCoords) {
            console.warn('⚠️ Could not obtain coordinates for origin/destination');
            return;
          }

          console.log('📍 Origin coordinates:', origenCoords);
          console.log('📍 Destination coordinates:', destinoCoords);

          // Geocode intermediates if they exist
          const waypoints = [];
          for (const intermedio of intermedios) {
            const coords = await geocodeLocation(intermedio);
            if (coords) waypoints.push(coords);
          }

          console.log('🚀 Starting hybrid route calculation');

          // Calculate hybrid route
          const result = await calculateRoute(origenCoords, destinoCoords, waypoints);
          
          if (result && result.success) {
            console.log('✅ Route calculated successfully:', {
              distance: result.distance_km,
              time: result.duration_minutes
            });
            
            onDistanceCalculated(
              result.distance_km,
              result.duration_minutes,
              result
            );
            
            setCalculationState(prev => ({
              ...prev,
              autoCalculationDone: true,
              lastCalculationHash: currentHash,
              showMap: true,
              retryCount: 0,
            }));
          } else {
            console.warn('⚠️ Route calculation failed - trying backup methods');
            setCalculationState(prev => ({ 
              ...prev, 
              retryCount: prev.retryCount + 1 
            }));
          }
        } catch (error) {
          console.error('❌ Error in automatic calculation:', error);
          setCalculationState(prev => ({ 
            ...prev, 
            retryCount: prev.retryCount + 1 
          }));
          
          if (calculationState.retryCount >= 3) {
            toast.error('Error persistente calculando ruta. Intente manualmente.');
          }
        }
      }, 2000); // 2 second debounce
    }

    return () => {
      if (calculationTimeoutRef.current) {
        clearTimeout(calculationTimeoutRef.current);
      }
    };
  }, [safeUbicaciones, canCalculate, distanciaTotal, calculationState.lastCalculationHash, 
      isCalculating, createLocationHash, geocodeLocation, calculateRoute, onDistanceCalculated]);

  // Manual recalculation with improved error handling
  const handleManualRecalculation = useCallback(async () => {
    if (!canCalculate) return;
    
    console.log('🔄 Manual recalculation started');
    
    try {
      setCalculationState(prev => ({ ...prev, retryCount: 0 }));

      const origenCoords = await geocodeLocation(origen);
      const destinoCoords = await geocodeLocation(destino);
      
      if (!origenCoords || !destinoCoords) {
        console.error('❌ Cannot obtain coordinates for recalculation');
        toast.error('No se pueden obtener coordenadas para el cálculo');
        return;
      }

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
        
        setCalculationState(prev => ({
          ...prev,
          autoCalculationDone: true,
          lastCalculationHash: createLocationHash(),
          showMap: true,
        }));
        
        toast.success(`Ruta recalculada: ${result.distance_km} km`);
      }
    } catch (error) {
      console.error('❌ Error in manual recalculation:', error);
      toast.error('Error en el recálculo manual');
    }
  }, [canCalculate, geocodeLocation, calculateRoute, onDistanceCalculated, createLocationHash]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
          Cálculo de Ruta Estabilizado
          {calculationState.autoCalculationDone && !error && (
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
          {calculationState.retryCount > 0 && (
            <Badge variant="outline" className="ml-2">
              Reintentos: {calculationState.retryCount}
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-gray-600">
          Cálculos: Mapbox • Visualización: Google Maps • Geocodificación: México DB
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <RouteCalculationStatus
          isCalculating={isCalculating}
          hasUbicaciones={true}
          canCalculate={true}
        />

        {/* Error handling */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={handleManualRecalculation}
              disabled={isCalculating}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reintentar
            </Button>
          </div>
        )}

        {/* Route Metrics Display */}
        {(distanciaTotal && tiempoEstimado) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">Distancia Total</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {distanciaTotal} km
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Calculado automáticamente
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">Tiempo Estimado</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(tiempoEstimado)}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Tiempo de conducción
              </div>
            </div>
          </div>
        )}

        {/* Stable Google Map Component */}
        {calculationState.showMap && routeData && (
          <StableGoogleMap
            ubicaciones={safeUbicaciones}
            routeData={routeData}
            isFullscreen={calculationState.isMapFullscreen}
            onToggleFullscreen={() => setCalculationState(prev => ({ 
              ...prev, 
              isMapFullscreen: !prev.isMapFullscreen 
            }))}
          />
        )}

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
