
import React, { useEffect, useRef, useState } from 'react';
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

    // Add location markers
    ubicaciones.forEach((ubicacion, index) => {
      const coords = getCoordinatesForLocation(ubicacion);
      
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
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 4px 0; font-weight: bold;">${ubicacion.tipoUbicacion}</h3>
              <p style="margin: 0 0 4px 0;">${ubicacion.nombreRemitenteDestinatario || 'Sin nombre'}</p>
              <p style="margin: 0; font-size: 12px; color: #666;">${ubicacion.domicilio?.calle || ''}, ${ubicacion.domicilio?.municipio || ''}</p>
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
    if (ubicacion.coordenadas) {
      return {
        lat: ubicacion.coordenadas.latitud,
        lng: ubicacion.coordenadas.longitud
      };
    }
    
    // Fallback coordinates
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
