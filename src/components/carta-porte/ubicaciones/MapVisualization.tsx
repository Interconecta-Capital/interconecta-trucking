
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Route, Maximize2, Minimize2, AlertCircle } from 'lucide-react';
import { Ubicacion } from '@/hooks/useUbicaciones';
import { Coordinates } from '@/services/mapService';

// Get token from environment variables
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface MapVisualizationProps {
  ubicaciones: Ubicacion[];
  ruta?: {
    geometry: any;
    distance: number;
    duration: number;
  };
  className?: string;
  height?: string;
}

export function MapVisualization({ 
  ubicaciones, 
  ruta, 
  className = "", 
  height = "400px" 
}: MapVisualizationProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);

  // Check if Mapbox token is configured
  const isConfigured = MAPBOX_ACCESS_TOKEN && MAPBOX_ACCESS_TOKEN !== 'your-mapbox-token-here';

  useEffect(() => {
    if (!mapContainer.current || map.current || !isConfigured) return;

    // Initialize Mapbox
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-99.1332, 19.4326], // Ciudad de México por defecto
      zoom: 6
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      setIsMapReady(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isConfigured]);

  // Actualizar marcadores cuando cambien las ubicaciones
  useEffect(() => {
    if (!map.current || !isMapReady || ubicaciones.length === 0) return;

    // Limpiar marcadores existentes
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Agregar nuevos marcadores
    ubicaciones.forEach((ubicacion, index) => {
      // Usar coordenadas si están disponibles, sino usar coordenadas por defecto
      const coords: Coordinates = ubicacion.coordenadas || { 
        lat: 19.4326 + index * 0.1, 
        lng: -99.1332 + index * 0.1 
      };

      // Crear elemento personalizado para el marcador
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.backgroundColor = ubicacion.tipoUbicacion === 'Origen' ? '#10b981' : 
                                ubicacion.tipoUbicacion === 'Destino' ? '#ef4444' : '#3b82f6';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

      // Crear popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h4 class="font-semibold">${ubicacion.tipoUbicacion}</h4>
          <p class="text-sm">${ubicacion.nombreRemitenteDestinatario}</p>
          <p class="text-xs text-gray-600">
            ${ubicacion.domicilio.calle} ${ubicacion.domicilio.numExterior}<br>
            ${ubicacion.domicilio.colonia}, ${ubicacion.domicilio.municipio}
          </p>
        </div>
      `);

      // Agregar marcador al mapa
      new mapboxgl.Marker(el)
        .setLngLat([coords.lng, coords.lat])
        .setPopup(popup)
        .addTo(map.current!);
    });

    // Ajustar vista para mostrar todos los marcadores
    if (ubicaciones.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      ubicaciones.forEach((ubicacion, index) => {
        const coords: Coordinates = ubicacion.coordenadas || { 
          lat: 19.4326 + index * 0.1, 
          lng: -99.1332 + index * 0.1 
        };
        bounds.extend([coords.lng, coords.lat]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [ubicaciones, isMapReady]);

  // Mostrar ruta cuando esté disponible
  useEffect(() => {
    if (!map.current || !isMapReady || !ruta) return;

    // Agregar fuente de la ruta
    if (map.current.getSource('route')) {
      map.current.removeLayer('route');
      map.current.removeSource('route');
    }

    map.current.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: ruta.geometry
      }
    });

    // Agregar capa de la ruta
    map.current.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': '#3b82f6',
        'line-width': 4,
        'line-opacity': 0.8
      }
    });
  }, [ruta, isMapReady]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Show configuration message if token is not set
  if (!isConfigured) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Configuración de Mapbox requerida</p>
                <p className="text-sm">
                  Para utilizar las funcionalidades de mapas, necesitas configurar tu token de Mapbox.
                </p>
                <ol className="text-sm list-decimal list-inside space-y-1">
                  <li>Ve a <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">mapbox.com</a> y crea una cuenta</li>
                  <li>Obtén tu token público en el dashboard</li>
                  <li>Agrega el token como variable de entorno <code className="bg-gray-100 px-1 rounded">VITE_MAPBOX_TOKEN</code></li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (ubicaciones.length === 0) {
    return (
      <Card className={`${className} border-dashed`}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Agrega ubicaciones para ver el mapa</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Route className="h-5 w-5" />
            <span>Visualización de Ruta</span>
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            {ruta && (
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">{ruta.distance} km</span>
                <span className="mx-2">•</span>
                <span>{ruta.duration} min</span>
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div 
          ref={mapContainer} 
          style={{ height: isFullscreen ? 'calc(100vh - 120px)' : height }}
          className="w-full rounded-b-lg"
        />
      </CardContent>
    </Card>
  );
}
