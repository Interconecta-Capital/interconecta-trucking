
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Maximize2, Minimize2, Navigation } from 'lucide-react';
import { Ubicacion } from '@/types/ubicaciones';

interface EnhancedMapVisualizationProps {
  ubicaciones: Ubicacion[];
  routeGeometry?: any;
  distanciaTotal?: number;
  tiempoEstimado?: number;
  isVisible: boolean;
  onToggleFullscreen?: () => void;
  isFullscreen?: boolean;
}

export function EnhancedMapVisualization({
  ubicaciones,
  routeGeometry,
  distanciaTotal,
  tiempoEstimado,
  isVisible,
  onToggleFullscreen,
  isFullscreen = false
}: EnhancedMapVisualizationProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken] = useState<string>('pk.eyJ1IjoiaW50ZXJjb25lY3RhIiwiYSI6ImNtYndqcWFyajExYTIya3B1NG1oaXJ2YjIifQ.OVtTgnmv6ZA3En2trhim-Q');

  // Filtrar ubicaciones válidas con coordenadas
  const validUbicaciones = ubicaciones.filter(u => 
    u.domicilio?.codigoPostal && u.domicilio?.calle
  );

  // Inicializar mapa
  useEffect(() => {
    if (!isVisible || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-99.1332, 19.4326], // Centro de México
      zoom: 6
    });

    // Agregar controles de navegación
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Agregar control de pantalla completa
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isVisible, mapboxToken]);

  // Agregar marcadores para ubicaciones
  useEffect(() => {
    if (!map.current || validUbicaciones.length === 0) return;

    // Limpiar marcadores existentes
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Coordenadas simuladas basadas en código postal (mejorar con geocodificación real)
    const getCoordinatesForCP = (cp: string): [number, number] => {
      const cpMap: { [key: string]: [number, number] } = {
        '01000': [-99.1332, 19.4326], // CDMX Centro
        '03100': [-99.1588, 19.3927], // Del Valle
        '06700': [-99.1676, 19.4284], // Roma Norte
        '11000': [-99.1716, 19.4069], // San Miguel Chapultepec
      };
      return cpMap[cp] || [-99.1332, 19.4326]; // Default CDMX
    };

    const bounds = new mapboxgl.LngLatBounds();
    let hasValidCoords = false;

    validUbicaciones.forEach((ubicacion, index) => {
      const coords = getCoordinatesForCP(ubicacion.domicilio.codigoPostal);
      
      // Crear popup con información
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h4 class="font-semibold text-sm">${ubicacion.tipoUbicacion}</h4>
          <p class="text-xs">${ubicacion.nombreRemitenteDestinatario || 'Sin nombre'}</p>
          <p class="text-xs text-gray-600">${ubicacion.domicilio.calle} ${ubicacion.domicilio.numExterior || ''}</p>
          <p class="text-xs text-gray-600">${ubicacion.domicilio.municipio}, ${ubicacion.domicilio.estado}</p>
          <p class="text-xs text-gray-600">CP: ${ubicacion.domicilio.codigoPostal}</p>
          ${ubicacion.distanciaRecorrida ? `<p class="text-xs text-blue-600">Distancia: ${ubicacion.distanciaRecorrida} km</p>` : ''}
        </div>
      `);

      // Color del marcador según tipo
      let color = '#3b82f6'; // Azul por defecto
      if (ubicacion.tipoUbicacion === 'Origen') color = '#22c55e'; // Verde
      if (ubicacion.tipoUbicacion === 'Destino') color = '#ef4444'; // Rojo

      // Crear marcador
      new mapboxgl.Marker({ color })
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(map.current!);

      bounds.extend(coords);
      hasValidCoords = true;
    });

    // Ajustar vista del mapa para mostrar todos los marcadores
    if (hasValidCoords && validUbicaciones.length > 1) {
      map.current.fitBounds(bounds, { 
        padding: 50,
        maxZoom: 12
      });
    } else if (hasValidCoords) {
      const coords = getCoordinatesForCP(validUbicaciones[0].domicilio.codigoPostal);
      map.current.setCenter(coords);
      map.current.setZoom(12);
    }
  }, [validUbicaciones]);

  // Dibujar ruta si está disponible
  useEffect(() => {
    if (!map.current || !routeGeometry) return;

    // Esperar a que el mapa esté cargado
    const drawRoute = () => {
      if (!map.current) return;

      // Remover ruta existente
      if (map.current.getSource('route')) {
        map.current.removeLayer('route');
        map.current.removeSource('route');
      }

      // Agregar nueva ruta
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: routeGeometry
        }
      });

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

      // Ajustar vista para mostrar toda la ruta
      const coordinates = routeGeometry.coordinates;
      const bounds = new mapboxgl.LngLatBounds();
      coordinates.forEach((coord: number[]) => bounds.extend(coord as [number, number]));
      
      map.current.fitBounds(bounds, { 
        padding: 50,
        maxZoom: 12
      });
    };

    if (map.current.isStyleLoaded()) {
      drawRoute();
    } else {
      map.current.on('load', drawRoute);
    }
  }, [routeGeometry]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (!isVisible || validUbicaciones.length === 0) return null;

  return (
    <Card className={`transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Navigation className="h-5 w-5 text-blue-600" />
            Mapa de Ruta Calculada
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {distanciaTotal && tiempoEstimado && (
              <div className="text-sm text-gray-600 mr-2">
                <span className="font-medium">{distanciaTotal} km</span>
                <span className="mx-1">•</span>
                <span>{formatTime(tiempoEstimado)}</span>
              </div>
            )}
            
            {onToggleFullscreen && (
              <Button
                variant="outline"
                size="sm"
                onClick={onToggleFullscreen}
                className="h-8 w-8 p-0"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div 
          ref={mapContainer} 
          className={`rounded-lg border transition-all duration-300 ${
            isFullscreen ? 'h-[calc(100vh-200px)]' : 'h-96'
          }`}
          style={{ minHeight: isFullscreen ? '500px' : '384px' }}
        />
        
        {validUbicaciones.length > 0 && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Origen: {validUbicaciones.find(u => u.tipoUbicacion === 'Origen')?.nombreRemitenteDestinatario || 'Sin definir'}</span>
            </div>
            
            {validUbicaciones.filter(u => u.tipoUbicacion === 'Paso Intermedio').length > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Paradas: {validUbicaciones.filter(u => u.tipoUbicacion === 'Paso Intermedio').length}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Destino: {validUbicaciones.find(u => u.tipoUbicacion === 'Destino')?.nombreRemitenteDestinatario || 'Sin definir'}</span>
            </div>
          </div>
        )}
        
        <div className="mt-3 text-xs text-gray-500 bg-blue-50 p-2 rounded">
          <MapPin className="h-3 w-3 inline mr-1" />
          Esta ruta se calcula automáticamente y se usa para el PDF final de la Carta Porte.
          Haz clic en los marcadores para ver más detalles.
        </div>
      </CardContent>
    </Card>
  );
}
