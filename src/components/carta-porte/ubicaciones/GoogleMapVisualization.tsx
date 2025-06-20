import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Route, Clock, Maximize2, Minimize2 } from 'lucide-react';
import { Ubicacion } from '@/types/ubicaciones';

interface GoogleMapVisualizationProps {
  ubicaciones: Ubicacion[];
  routeData?: {
    distance_km: number;
    duration_minutes: number;
    google_data?: {
      polyline: string;
      bounds: any;
      legs: any[];
    };
  };
  isVisible?: boolean;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

declare global {
  interface Window {
    google: any;
    initGoogleMap: () => void;
  }
}

export function GoogleMapVisualization({
  ubicaciones,
  routeData,
  isVisible = true,
  onToggleFullscreen,
  isFullscreen = false
}: GoogleMapVisualizationProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Load Google Maps API
  useEffect(() => {
    if (window.google) {
      setIsMapLoaded(true);
      return;
    }

    // Create script element to load Google Maps
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=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&libraries=geometry`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setIsMapLoaded(true);
    };

    script.onerror = () => {
      console.error('Error loading Google Maps API');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup if component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (!isMapLoaded || !window.google || !mapRef.current || !isVisible) return;

    console.log('🗺️ Initializing Google Map');

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

    console.log('✅ Google Map initialized');
  }, [isMapLoaded, isVisible]);

  // Add markers and route when ubicaciones change
  useEffect(() => {
    if (!mapInstanceRef.current || !ubicaciones.length || !window.google) return;

    console.log('📍 Adding markers and route to map');

    // Clear existing markers and routes
    // (In a real implementation, you'd keep track of markers to remove them)

    const bounds = new window.google.maps.LatLngBounds();
    const markers: any[] = [];

    // Add markers for each ubicacion
    ubicaciones.forEach((ubicacion, index) => {
      // Get coordinates (using mock for now)
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

        // Add info window
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

        markers.push(marker);
        bounds.extend(coords);
      }
    });

    // Add route if we have route data
    if (routeData && routeData.google_data?.polyline) {
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true, // We're using our custom markers
        polylineOptions: {
          strokeColor: '#2563eb',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });

      directionsRenderer.setMap(mapInstanceRef.current);

      // Decode and display the polyline
      const decodedPath = window.google.maps.geometry.encoding.decodePath(routeData.google_data.polyline);
      
      const routePath = new window.google.maps.Polyline({
        path: decodedPath,
        geodesic: true,
        strokeColor: '#2563eb',
        strokeOpacity: 0.8,
        strokeWeight: 4
      });

      routePath.setMap(mapInstanceRef.current);
    }

    // Fit map to bounds
    if (markers.length > 0) {
      mapInstanceRef.current.fitBounds(bounds);
      
      // Add some padding
      if (markers.length === 1) {
        mapInstanceRef.current.setZoom(15);
      }
    }

  }, [ubicaciones, routeData]);

  const getCoordinatesForUbicacion = (ubicacion: Ubicacion) => {
    // If ubicacion has coordinates, use them
    if (ubicacion.coordenadas) {
      return {
        lat: ubicacion.coordenadas.latitud,
        lng: ubicacion.coordenadas.longitud
      };
    }

    // Otherwise, use mock coordinates based on postal code
    const cpMap: { [key: string]: { lat: number; lng: number } } = {
      '01000': { lat: 19.4326, lng: -99.1332 },
      '03100': { lat: 19.3927, lng: -99.1588 },
      '06700': { lat: 19.4284, lng: -99.1676 },
      '11000': { lat: 19.4069, lng: -99.1716 },
      '62577': { lat: 18.8711, lng: -99.2211 },
      '22000': { lat: 32.5149, lng: -117.0382 },
    };

    return cpMap[ubicacion.domicilio.codigoPostal] || { lat: 19.4326, lng: -99.1332 };
  };

  const getMarkerIcon = (tipo: string) => {
    const iconMap = {
      'Origen': 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      'Destino': 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      'Paso Intermedio': 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
    };
    return iconMap[tipo as keyof typeof iconMap] || 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (!isVisible) return null;

  return (
    <Card className={`border-blue-200 ${isFullscreen ? 'fixed inset-4 z-50 bg-white' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Route className="h-5 w-5" />
            Mapa de Ruta - Google Maps
            {routeData && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Ruta Calculada
              </Badge>
            )}
          </CardTitle>
          {onToggleFullscreen && (
            <Button variant="outline" size="sm" onClick={onToggleFullscreen}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Route metrics */}
        {routeData && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Distancia</span>
              </div>
              <div className="text-xl font-bold text-blue-700">
                {routeData.distance_km} km
              </div>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Tiempo</span>
              </div>
              <div className="text-xl font-bold text-green-700">
                {formatTime(routeData.duration_minutes)}
              </div>
            </div>
          </div>
        )}

        {/* Google Map */}
        <div className={`bg-gray-100 rounded-lg overflow-hidden ${isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96'}`}>
          <div ref={mapRef} className="w-full h-full" />
          {!isMapLoaded && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Cargando Google Maps...</p>
              </div>
            </div>
          )}
        </div>

        {/* Ubicaciones summary */}
        <div className="grid grid-cols-1 gap-2">
          {ubicaciones.map((ubicacion, index) => (
            <div key={ubicacion.idUbicacion} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
              <div className={`w-3 h-3 rounded-full ${
                ubicacion.tipoUbicacion === 'Origen' ? 'bg-green-500' :
                ubicacion.tipoUbicacion === 'Destino' ? 'bg-red-500' : 'bg-yellow-500'
              }`} />
              <div className="flex-1">
                <div className="font-medium text-sm">{ubicacion.tipoUbicacion}</div>
                <div className="text-xs text-gray-600">
                  {ubicacion.domicilio.calle}, {ubicacion.domicilio.municipio}
                </div>
              </div>
              <Badge variant="outline">
                {index + 1}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
