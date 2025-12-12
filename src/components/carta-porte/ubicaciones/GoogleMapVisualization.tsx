import React, { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Maximize2, Minimize2, Loader2, AlertTriangle } from 'lucide-react';
import { useGoogleMapsAPI } from '@/hooks/useGoogleMapsAPI';

interface GoogleMapVisualizationProps {
  ubicaciones: any[];
  routeData: any;
  isVisible: boolean;
}

export function GoogleMapVisualization({ ubicaciones, routeData, isVisible }: GoogleMapVisualizationProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const { isLoaded, error } = useGoogleMapsAPI();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!isVisible || !isLoaded || !mapRef.current || !window.google || error) return;

    console.log('🗺️ Initializing Google Map visualization...');

    try {
      const defaultCenter = { lat: 19.4326, lng: -99.1332 }; // Mexico City

      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        zoom: 6,
        center: defaultCenter,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        gestureHandling: 'greedy',
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true
      });

      setMapReady(true);

      // Add markers and route
      addMarkersAndRoute();

    } catch (error) {
      console.error('❌ Error initializing Google Map:', error);
    }
  }, [isVisible, isLoaded, error]);

  const addMarkersAndRoute = () => {
    if (!mapInstanceRef.current || !window.google) return;

    console.log('📍 Adding markers and route to map');
    const bounds = new window.google.maps.LatLngBounds();
    const geocoder = (window.google.maps as any).Geocoder ? new (window.google.maps as any).Geocoder() : null;

    const addMarker = (ubicacion: any, index: number, coords: any) => {
      const marker = new window.google.maps.Marker({
        position: coords,
        map: mapInstanceRef.current,
        title: ubicacion.nombreRemitenteDestinatario || `${ubicacion.tipoUbicacion} ${index + 1}`,
        icon: {
          url: getMarkerIcon(ubicacion.tipoUbicacion),
          scaledSize: new window.google.maps.Size(32, 32)
        }
      });

      // Sanitize user-provided data to prevent XSS
      const sanitizedTipo = DOMPurify.sanitize(ubicacion.tipoUbicacion || '');
      const sanitizedName = DOMPurify.sanitize(ubicacion.nombreRemitenteDestinatario || 'Sin nombre');
      const sanitizedCalle = DOMPurify.sanitize(ubicacion.domicilio?.calle || '');
      const sanitizedMunicipio = DOMPurify.sanitize(ubicacion.domicilio?.municipio || '');

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 4px 0; font-weight: bold;">${sanitizedTipo}</h3>
            <p style="margin: 0 0 4px 0;">${sanitizedName}</p>
            <p style="margin: 0; font-size: 12px; color: #666;">${sanitizedCalle}, ${sanitizedMunicipio}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      bounds.extend(coords);
    };

    // Process each location
    ubicaciones.forEach((ubicacion, index) => {
      const coords = getCoordinatesForLocation(ubicacion);
      
      // Check if coordinates are valid (not placeholder coordinates)
      const isPlaceholder = (coords.lat === 19.4326 && coords.lng === -99.1332) || 
                           (coords.lat === 0 && coords.lng === 0);
      
      if (coords && !isPlaceholder) {
        // Use valid coordinates directly
        addMarker(ubicacion, index, coords);
      } else if (ubicacion.domicilio?.calle && geocoder) {
        // Try to geocode the address
        console.log(`🔍 Geocoding address: ${ubicacion.domicilio.calle}`);
        
        geocoder.geocode({ 
          address: ubicacion.domicilio.calle 
        }, (results: any, status: any) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;
            const geocodedCoords = {
              lat: location.lat(),
              lng: location.lng()
            };
            console.log(`✅ Geocoded ${ubicacion.tipoUbicacion}: ${ubicacion.domicilio.calle}`, geocodedCoords);
            addMarker(ubicacion, index, geocodedCoords);
            
            // Adjust bounds if this is the first successful geocoding
            if (ubicaciones.length <= 3) {
              mapInstanceRef.current?.fitBounds(bounds);
            }
          } else {
            console.warn(`❌ Geocoding failed for ${ubicacion.tipoUbicacion}: ${ubicacion.domicilio.calle}`, status);
            // Use placeholder coordinates as fallback
            addMarker(ubicacion, index, coords);
          }
        });
      } else {
        // Use placeholder coordinates as last resort
        addMarker(ubicacion, index, coords);
      }
    });

    // Add route if available
    if (routeData?.google_data?.polyline && window.google.maps.geometry?.encoding) {
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
      } catch (error) {
        console.error('❌ Error displaying route:', error);
      }
    }

    // Fit map to bounds
    if (ubicaciones.length > 0) {
      mapInstanceRef.current.fitBounds(bounds);
      
      if (ubicaciones.length === 1) {
        mapInstanceRef.current.setZoom(15);
      }
    }
  };

  const getCoordinatesForLocation = (ubicacion: any) => {
    // Verificar diferentes formatos de coordenadas
    if (ubicacion.coordenadas) {
      // Formato del hook useRutasPrecisas: { lat, lng }
      if (typeof ubicacion.coordenadas.lat === 'number' && typeof ubicacion.coordenadas.lng === 'number') {
        return {
          lat: ubicacion.coordenadas.lat,
          lng: ubicacion.coordenadas.lng
        };
      }
      // Formato alternativo: { latitud, longitud }
      if (typeof ubicacion.coordenadas.latitud === 'number' && typeof ubicacion.coordenadas.longitud === 'number') {
        return {
          lat: ubicacion.coordenadas.latitud,
          lng: ubicacion.coordenadas.longitud
        };
      }
      // Formato alternativo: { latitude, longitude }
      if (typeof ubicacion.coordenadas.latitude === 'number' && typeof ubicacion.coordenadas.longitude === 'number') {
        return {
          lat: ubicacion.coordenadas.latitude,
          lng: ubicacion.coordenadas.longitude
        };
      }
    }
    
    console.warn('⚠️ Coordenadas inválidas para ubicación:', ubicacion);
    // Fallback coordinates (Mexico City)
    return { lat: 19.4326, lng: -99.1332 };
  };

  const getMarkerIcon = (tipo: string) => {
    const iconMap = {
      'Origen': 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      'Destino': 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      'Paso Intermedio': 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
    };
    return iconMap[tipo as keyof typeof iconMap] || 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
  };

  if (!isVisible) return null;

  if (error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error de Google Maps</h3>
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-blue-200 ${isFullscreen ? 'fixed inset-4 z-50 bg-white' : ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Visualización de Ruta
            {mapReady && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Mapa Listo
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className={`bg-gray-100 ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-96'}`}>
          {!isLoaded ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
                <p className="text-sm text-gray-600">Cargando Google Maps...</p>
              </div>
            </div>
          ) : (
            <div ref={mapRef} className="w-full h-full" />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
