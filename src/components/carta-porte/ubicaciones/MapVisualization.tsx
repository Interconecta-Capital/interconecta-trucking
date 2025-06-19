
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle, ZoomIn, ZoomOut, Maximize2, RotateCcw } from 'lucide-react';

interface MapVisualizationProps {
  ubicaciones: any[];
  rutaCalculada?: any;
  isVisible: boolean;
  distanciaTotal?: number;
  tiempoEstimado?: number;
}

export function MapVisualization({ 
  ubicaciones, 
  rutaCalculada, 
  isVisible, 
  distanciaTotal, 
  tiempoEstimado 
}: MapVisualizationProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const mapboxToken: string = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoiaW50ZXJjb25lY3RhIiwiYSI6ImNtYndqcWFyajExYTIya3B1NG1oaXJ2YjIifQ.OVtTgnmv6ZA3En2trhim-Q';
  const tokenConfigured = mapboxToken.length > 0;
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v12');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize map when component mounts
  useEffect(() => {
    if (!isVisible || !tokenConfigured || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [-99.1332, 19.4326], // Mexico City default
      zoom: 6
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    // Add scale control
    map.current.addControl(new mapboxgl.ScaleControl({
      maxWidth: 80,
      unit: 'metric'
    }), 'bottom-left');

    console.log('✅ Mapa inicializado correctamente');

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isVisible, tokenConfigured, mapboxToken, mapStyle]);

  // Clear existing markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  // Add markers for ubicaciones
  useEffect(() => {
    if (!map.current || !tokenConfigured || !isVisible) return;

    clearMarkers();

    const validUbicaciones = ubicaciones.filter(ubicacion => ubicacion.coordenadas);
    
    if (validUbicaciones.length === 0) return;

    validUbicaciones.forEach((ubicacion, index) => {
      const isOrigen = ubicacion.tipoUbicacion === 'Origen';
      const isDestino = ubicacion.tipoUbicacion === 'Destino';
      
      // Crear elemento personalizado para el marcador
      const markerElement = document.createElement('div');
      markerElement.className = 'custom-marker';
      markerElement.innerHTML = `
        <div style="
          width: 30px; 
          height: 30px; 
          border-radius: 50%; 
          background-color: ${isOrigen ? '#22c55e' : isDestino ? '#ef4444' : '#3b82f6'};
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">
          ${isOrigen ? 'O' : isDestino ? 'D' : index}
        </div>
      `;

      // Crear popup con información detallada
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        closeButton: true,
        closeOnClick: false
      }).setHTML(
        `<div style="max-width: 250px; padding: 8px;">
          <div style="font-weight: bold; color: ${isOrigen ? '#22c55e' : isDestino ? '#ef4444' : '#3b82f6'}; margin-bottom: 4px;">
            ${ubicacion.tipoUbicacion}
          </div>
          <div style="font-weight: 600; margin-bottom: 8px;">
            ${ubicacion.nombreRemitenteDestinatario || 'Sin nombre'}
          </div>
          <div style="font-size: 12px; color: #666; line-height: 1.4;">
            <div><strong>Dirección:</strong></div>
            <div>${ubicacion.domicilio.calle} ${ubicacion.domicilio.numExterior || ''}</div>
            <div>${ubicacion.domicilio.colonia}</div>
            <div>${ubicacion.domicilio.municipio}, ${ubicacion.domicilio.estado}</div>
            <div>CP: ${ubicacion.domicilio.codigoPostal}</div>
            ${ubicacion.distanciaRecorrida ? `<div style="margin-top: 8px; padding: 4px 8px; background: #f0f0f0; border-radius: 4px;"><strong>Distancia recorrida:</strong> ${ubicacion.distanciaRecorrida} km</div>` : ''}
          </div>
        </div>`
      );

      const marker = new mapboxgl.Marker({ element: markerElement })
        .setLngLat([ubicacion.coordenadas.longitud, ubicacion.coordenadas.latitud])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });

    // Ajustar vista para mostrar todos los marcadores
    if (validUbicaciones.length > 0) {
      const coordinates = validUbicaciones.map(u => [u.coordenadas.longitud, u.coordenadas.latitud] as [number, number]);

      if (coordinates.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach(coord => bounds.extend(coord));
        
        map.current.fitBounds(bounds, { 
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 14
        });
      } else if (coordinates.length === 1) {
        map.current.setCenter(coordinates[0]);
        map.current.setZoom(12);
      }
    }

    console.log(`✅ ${validUbicaciones.length} marcadores agregados al mapa`);
  }, [ubicaciones, tokenConfigured, isVisible]);

  // Draw route if available
  useEffect(() => {
    if (!map.current || !rutaCalculada || !tokenConfigured || !isVisible) return;

    // Wait for map to load
    const addRoute = () => {
      if (rutaCalculada.geometry) {
        // Remove existing route
        if (map.current!.getSource('route')) {
          map.current!.removeLayer('route');
          map.current!.removeSource('route');
        }

        // Add route source
        map.current!.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: rutaCalculada.geometry
          }
        });

        // Add route layer
        map.current!.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#3b82f6',
            'line-width': [
              'interpolate',
              ['linear'],
              ['zoom'],
              10, 3,
              15, 8
            ],
            'line-opacity': 0.8
          }
        });

        console.log('✅ Ruta dibujada en el mapa');
      }
    };

    if (map.current.isStyleLoaded()) {
      addRoute();
    } else {
      map.current.on('styledata', addRoute);
    }

    return () => {
      if (map.current && map.current.getSource('route')) {
        map.current.removeLayer('route');
        map.current.removeSource('route');
      }
    };
  }, [rutaCalculada, tokenConfigured, isVisible]);

  const handleStyleChange = (newStyle: string) => {
    if (map.current) {
      map.current.setStyle(newStyle);
      setMapStyle(newStyle);
    }
  };

  const handleZoomIn = () => {
    if (map.current) {
      map.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (map.current) {
      map.current.zoomOut();
    }
  };

  const handleResetView = () => {
    if (map.current && ubicaciones.length > 0) {
      const validCoordinates = ubicaciones
        .filter(u => u.coordenadas)
        .map(u => [u.coordenadas.longitud, u.coordenadas.latitud] as [number, number]);

      if (validCoordinates.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        validCoordinates.forEach(coord => bounds.extend(coord));
        map.current.fitBounds(bounds, { padding: 50 });
      }
    }
  };

  if (!isVisible) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Visualización de Ruta
            {ubicaciones.length > 0 && (
              <Badge variant="outline">{ubicaciones.length} ubicaciones</Badge>
            )}
          </div>
          
          {/* Style selector */}
          <div className="flex gap-2">
            <Button
              variant={mapStyle.includes('streets') ? "default" : "outline"}
              size="sm"
              onClick={() => handleStyleChange('mapbox://styles/mapbox/streets-v12')}
            >
              Calles
            </Button>
            <Button
              variant={mapStyle.includes('satellite') ? "default" : "outline"}
              size="sm"
              onClick={() => handleStyleChange('mapbox://styles/mapbox/satellite-v9')}
            >
              Satélite
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {!tokenConfigured ? (
          <Alert variant="destructive" className="m-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Se debe configurar la variable <code>VITE_MAPBOX_TOKEN</code> para mostrar el mapa.
              <br />
              <a href="https://account.mapbox.com/" target="_blank" rel="noopener noreferrer" className="underline">
                Obtén tu token en Mapbox
              </a>
            </AlertDescription>
          </Alert>
        ) : (
          <div className="relative">
            {/* Map container */}
            <div
              ref={mapContainer}
              className={`w-full rounded-b-lg border-t ${isFullscreen ? 'h-screen' : 'h-96'}`}
              style={{ minHeight: '400px' }}
            />
            
            {/* Map controls overlay */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleZoomIn}
                className="w-10 h-10 p-0"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleZoomOut}
                className="w-10 h-10 p-0"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleResetView}
                className="w-10 h-10 p-0"
                title="Restablecer vista"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* Route info overlay */}
            {(distanciaTotal || tiempoEstimado) && (
              <div className="absolute bottom-4 left-4 right-4 z-10">
                <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg border shadow-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {distanciaTotal && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-600">Distancia Total:</span>
                        <span className="font-medium">{distanciaTotal} km</span>
                      </div>
                    )}
                    {tiempoEstimado && (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">Tiempo Estimado:</span>
                        <span className="font-medium">{Math.round(tiempoEstimado / 60)}h {tiempoEstimado % 60}m</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
