
import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Route, CheckCircle, AlertTriangle, MapPin, Clock, Maximize2, Minimize2 } from 'lucide-react';
import { useHybridRouteCalculation } from '@/hooks/useHybridRouteCalculation';
import { useAccurateGeocodingMexico } from '@/hooks/useAccurateGeocodingMexico';
import { Ubicacion } from '@/types/ubicaciones';
import { RouteCalculationStatus } from './RouteCalculationStatus';
import { RouteControls } from './RouteControls';

interface AutoRouteCalculatorProps {
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
  const [showMap, setShowMap] = useState(false);
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string>('');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

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

  // Helper function to create location hash
  const createLocationHash = () => {
    return safeUbicaciones
      .map(u => `${u.tipoUbicacion}-${u.domicilio?.codigoPostal}-${u.domicilio?.calle}`)
      .join('|');
  };

  // Improved geocoding function with better error handling
  const geocodeLocation = async (ubicacion: Ubicacion | undefined) => {
    if (!ubicacion || !ubicacion.domicilio) {
      console.warn('⚠️ Ubicación o domicilio no válido para geocodificación');
      return null;
    }
    
    // Si ya tiene coordenadas precisas, usarlas
    if (ubicacion.coordenadas && ubicacion.coordenadas.latitud && ubicacion.coordenadas.longitud) {
      console.log('📍 Usando coordenadas existentes:', ubicacion.coordenadas);
      return {
        lat: ubicacion.coordenadas.latitud,
        lng: ubicacion.coordenadas.longitud
      };
    }
    
    // Usar el servicio de geocodificación mexicano mejorado
    try {
      const coords = geocodeByCodigoPostal(ubicacion.domicilio.codigoPostal);
      
      if (coords && coords.lat && coords.lng) {
        console.log(`📍 Coordenadas obtenidas para CP ${ubicacion.domicilio.codigoPostal}:`, coords);
        return {
          lat: coords.lat,
          lng: coords.lng
        };
      }
    } catch (error) {
      console.error('❌ Error en geocodificación:', error);
    }
    
    console.warn(`⚠️ No se pudieron obtener coordenadas para CP: ${ubicacion.domicilio.codigoPostal}`);
    return null;
  };

  // Load Google Maps API with better error handling
  useEffect(() => {
    if (window.google) {
      setIsMapLoaded(true);
      return;
    }

    // Only load Google Maps if we have route data to display
    if (!routeData) return;

    const script = document.createElement('script');
    // Use a valid API key placeholder - user needs to configure this
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=geometry`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('✅ Google Maps API cargada exitosamente');
      setIsMapLoaded(true);
      setMapError('');
    };

    script.onerror = () => {
      console.error('❌ Error cargando Google Maps API - Verifique la API key');
      setMapError('Error cargando Google Maps. Verifique la configuración de la API key.');
      setIsMapLoaded(false);
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [routeData]);

  // Initialize map only when everything is ready
  useEffect(() => {
    if (!isMapLoaded || !window.google || !mapRef.current || !showMap || !routeData || mapError) return;

    console.log('🗺️ Inicializando mapa de Google con datos de ruta');

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

      // Add markers for each ubicacion
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
          console.log('✅ Ruta mostrada en el mapa');
        } catch (mapError) {
          console.error('❌ Error mostrando ruta en el mapa:', mapError);
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
      console.error('❌ Error inicializando Google Maps:', error);
      setMapError('Error inicializando el mapa.');
    }

  }, [isMapLoaded, showMap, routeData, safeUbicaciones, mapError]);

  const getCoordinatesForUbicacion = (ubicacion: Ubicacion) => {
    if (ubicacion.coordenadas) {
      return {
        lat: ubicacion.coordenadas.latitud,
        lng: ubicacion.coordenadas.longitud
      };
    }

    const coords = geocodeByCodigoPostal(ubicacion.domicilio.codigoPostal);
    return coords ? { lat: coords.lat, lng: coords.lng } : { lat: 19.4326, lng: -99.1332 };
  };

  const getMarkerIcon = (tipo: string) => {
    const iconMap = {
      'Origen': 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      'Destino': 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      'Paso Intermedio': 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
    };
    return iconMap[tipo as keyof typeof iconMap] || 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
  };

  // Optimized auto-calculation with better error handling
  useEffect(() => {
    const performAutoCalculation = async () => {
      if (!canCalculate || isCalculating || !safeUbicaciones.length) return;
      
      const currentHash = createLocationHash();
      
      // Solo calcular si las ubicaciones han cambiado y no tenemos distancia calculada
      if (currentHash !== lastCalculationHash && (!distanciaTotal || distanciaTotal === 0)) {
        console.log('🔄 Iniciando cálculo automático de ruta');
        
        try {
          // Geocodificar ubicaciones con manejo de errores mejorado
          const origenCoords = await geocodeLocation(origen);
          const destinoCoords = await geocodeLocation(destino);
          
          if (!origenCoords || !destinoCoords) {
            console.warn('⚠️ No se pudieron obtener coordenadas para origen/destino');
            console.log('Origen coords:', origenCoords);
            console.log('Destino coords:', destinoCoords);
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

          console.log('🚀 Iniciando cálculo híbrido de ruta');

          // Calcular ruta híbrida
          const result = await calculateRoute(origenCoords, destinoCoords, waypoints);
          
          if (result && result.success) {
            console.log('✅ Ruta calculada exitosamente:', {
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
            setShowMap(true);
          } else {
            console.warn('⚠️ Cálculo de ruta falló - usando Mapbox únicamente');
          }
        } catch (error) {
          console.error('❌ Error en cálculo automático:', error);
        }
      }
    };

    // Delay para evitar cálculos excesivos
    const timeoutId = setTimeout(performAutoCalculation, 2000);
    return () => clearTimeout(timeoutId);
  }, [safeUbicaciones, canCalculate, distanciaTotal, lastCalculationHash, isCalculating]);

  // Manual recalculation with improved error handling
  const handleManualRecalculation = async () => {
    if (!canCalculate) return;
    
    console.log('🔄 Recálculo manual iniciado');
    
    try {
      const origenCoords = await geocodeLocation(origen);
      const destinoCoords = await geocodeLocation(destino);
      
      if (!origenCoords || !destinoCoords) {
        console.error('❌ No se pueden obtener coordenadas para recálculo');
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
        setAutoCalculationDone(true);
        setLastCalculationHash(createLocationHash());
        setShowMap(true);
      }
    } catch (error) {
      console.error('❌ Error en recálculo manual:', error);
    }
  };

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
          Cálculo de Ruta Mejorado
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
          Cálculos: Mapbox • Visualización: Google Maps (requiere configuración)
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <RouteCalculationStatus
          isCalculating={isCalculating}
          hasUbicaciones={true}
          canCalculate={true}
        />

        {/* Error handling */}
        {(error || mapError) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              {error || mapError}
            </p>
            {mapError && (
              <p className="text-xs text-red-600 mt-1">
                Para usar el mapa visual, configure una API key válida de Google Maps
              </p>
            )}
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
        {showMap && routeData && (
          <div className={`border border-blue-200 rounded-lg overflow-hidden ${isMapFullscreen ? 'fixed inset-4 z-50 bg-white' : ''}`}>
            <div className="flex items-center justify-between p-3 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Visualización de Ruta</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsMapFullscreen(!isMapFullscreen)}>
                {isMapFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className={`bg-gray-100 overflow-hidden ${isMapFullscreen ? 'h-[calc(100vh-120px)]' : 'h-96'}`}>
              {mapError ? (
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
                  {!isMapLoaded && (
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
