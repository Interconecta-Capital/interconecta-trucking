
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Route, CheckCircle, AlertTriangle, MapPin, Clock, Maximize2, Minimize2, RefreshCw } from 'lucide-react';
import { useHybridRouteCalculation } from '@/hooks/useHybridRouteCalculation';
import { useAccurateGeocodingMexico } from '@/hooks/useAccurateGeocodingMexico';
import { Ubicacion } from '@/types/ubicaciones';
import { RouteCalculationStatus } from './RouteCalculationStatus';
import { RouteControls } from './RouteControls';
import { toast } from 'sonner';

interface OptimizedAutoRouteCalculatorProps {
  ubicaciones: Ubicacion[];
  onDistanceCalculated: (distancia: number, tiempo: number, geometry: any) => void;
  distanciaTotal?: number;
  tiempoEstimado?: number;
}

declare global {
  interface Window {
    google: any;
  }
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
    isMapLoaded: false,
    mapError: '',
    retryCount: 0,
  });

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
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

  // Load Google Maps API with better error handling
  useEffect(() => {
    if (window.google || !routeData) {
      if (window.google) {
        setCalculationState(prev => ({ ...prev, isMapLoaded: true, mapError: '' }));
      }
      return;
    }

    console.log('🗺️ Loading Google Maps API...');
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=geometry`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('✅ Google Maps API loaded successfully');
      setCalculationState(prev => ({ 
        ...prev, 
        isMapLoaded: true, 
        mapError: '',
        showMap: true 
      }));
    };

    script.onerror = () => {
      console.error('❌ Error loading Google Maps API - Check API key');
      setCalculationState(prev => ({ 
        ...prev, 
        mapError: 'Error loading Google Maps. Please verify API key configuration.',
        isMapLoaded: false 
      }));
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [routeData]);

  // Initialize map when everything is ready
  useEffect(() => {
    if (!calculationState.isMapLoaded || 
        !window.google || 
        !mapRef.current || 
        !calculationState.showMap || 
        !routeData || 
        calculationState.mapError) {
      return;
    }

    console.log('🗺️ Initializing Google Map with route data');

    try {
      // Default center (Mexico City)
      const defaultCenter = { lat: 19.4326, lng: -99.1332 };

      // Initialize map
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        zoom: 6,
        center: defaultCenter,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Add markers and route
      const bounds = new window.google.maps.LatLngBounds();

      // Add markers for each location
      safeUbicaciones.forEach((ubicacion, index) => {
        const coords = getCoordinatesForUbicacion(ubicacion);
        
        if (coords) {
          const marker = new window.google.maps.Marker({
            position: coords,
            map: mapInstanceRef.current,
            title: ubicacion.nombreRemitenteDestinatario || `${ubicacion.tipoUbicacion} ${index + 1}`,
            icon: {
              url: getMarkerIcon(ubicacion.tipoUbicacion),
              scaledSize: new window.google.maps.Size(32, 32)
            }
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="font-bold">${ubicacion.tipoUbicacion}</h3>
                <p class="text-sm">${ubicacion.nombreRemitenteDestinatario || 'Sin nombre'}</p>
                <p class="text-xs text-gray-600">${ubicacion.domicilio.calle}, ${ubicacion.domicilio.municipio}</p>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstanceRef.current, marker);
          });

          bounds.extend(coords);
        }
      });

      // Add route if available
      if (routeData.google_data?.polyline) {
        try {
          const decodedPath = window.google.maps.geometry.encoding.decodePath(routeData.google_data.polyline);
          
          const routePath = new window.google.maps.Polyline({
            path: decodedPath,
            geodesic: true,
            strokeColor: '#2563eb',
            strokeOpacity: 0.8,
            strokeWeight: 4
          });

          routePath.setMap(mapInstanceRef.current);
          console.log('✅ Route displayed on map');
        } catch (mapError) {
          console.error('❌ Error displaying route on map:', mapError);
        }
      }

      // Fit map to bounds
      if (safeUbicaciones.length > 0) {
        mapInstanceRef.current.fitBounds(bounds);
        
        if (safeUbicaciones.length === 1) {
          mapInstanceRef.current.setZoom(15);
        }
      }

    } catch (error) {
      console.error('❌ Error initializing Google Maps:', error);
      setCalculationState(prev => ({ 
        ...prev, 
        mapError: 'Error initializing map.' 
      }));
    }

  }, [calculationState.isMapLoaded, calculationState.showMap, routeData, safeUbicaciones, calculationState.mapError]);

  const getCoordinatesForUbicacion = useCallback((ubicacion: Ubicacion) => {
    if (ubicacion.coordenadas) {
      return {
        lat: ubicacion.coordenadas.latitud,
        lng: ubicacion.coordenadas.longitud
      };
    }

    const coords = geocodeByCodigoPostal(ubicacion.domicilio.codigoPostal);
    return coords ? { lat: coords.lat, lng: coords.lng } : { lat: 19.4326, lng: -99.1332 };
  }, [geocodeByCodigoPostal]);

  const getMarkerIcon = (tipo: string) => {
    const iconMap = {
      'Origen': 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      'Destino': 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      'Paso Intermedio': 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
    };
    return iconMap[tipo as keyof typeof iconMap] || 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
  };

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
            console.log('Origin coords:', origenCoords);
            console.log('Destination coords:', destinoCoords);
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
        {(error || calculationState.mapError) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {error || calculationState.mapError}
            </p>
            {calculationState.mapError && (
              <p className="text-xs text-red-600 mt-1">
                Para usar el mapa visual, configure una API key válida de Google Maps
              </p>
            )}
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

        {/* Integrated Google Map */}
        {calculationState.showMap && routeData && (
          <div className={`border border-blue-200 rounded-lg overflow-hidden ${calculationState.isMapFullscreen ? 'fixed inset-4 z-50 bg-white' : ''}`}>
            <div className="flex items-center justify-between p-3 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Visualización de Ruta</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCalculationState(prev => ({ 
                  ...prev, 
                  isMapFullscreen: !prev.isMapFullscreen 
                }))}
              >
                {calculationState.isMapFullscreen ? 
                  <Minimize2 className="h-4 w-4" /> : 
                  <Maximize2 className="h-4 w-4" />
                }
              </Button>
            </div>
            
            <div className={`bg-gray-100 overflow-hidden ${calculationState.isMapFullscreen ? 'h-[calc(100vh-120px)]' : 'h-96'}`}>
              {calculationState.mapError ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center p-4">
                    <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">Mapa no disponible</p>
                    <p className="text-xs text-gray-500">Configure la API key de Google Maps</p>
                  </div>
                </div>
              ) : (
                <>
                  <div ref={mapRef} className="w-full h-full" />
                  {!calculationState.isMapLoaded && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-sm text-gray-600">Cargando Google Maps...</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
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
