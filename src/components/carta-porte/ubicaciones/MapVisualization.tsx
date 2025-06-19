import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, AlertTriangle } from 'lucide-react';

interface MapVisualizationProps {
  ubicaciones: any[];
  rutaCalculada?: any;
  isVisible: boolean;
}

export function MapVisualization({ ubicaciones, rutaCalculada, isVisible }: MapVisualizationProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const mapboxToken: string = import.meta.env.VITE_MAPBOX_TOKEN || '';
  const tokenConfigured = mapboxToken.length > 0;

  // Initialize map when component mounts
  useEffect(() => {
    if (!isVisible || !tokenConfigured || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-99.1332, 19.4326], // Mexico City default
      zoom: 10
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isVisible, tokenConfigured, mapboxToken]);

  // Add markers for ubicaciones
  useEffect(() => {
    if (!map.current || !tokenConfigured) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    ubicaciones.forEach((ubicacion, index) => {
      if (ubicacion.coordenadas) {
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div>
            <h4>${ubicacion.nombreRemitenteDestinatario}</h4>
            <p>${ubicacion.domicilio.calle} ${ubicacion.domicilio.numExterior}</p>
            <p>${ubicacion.domicilio.municipio}, ${ubicacion.domicilio.estado}</p>
          </div>`
        );

        new mapboxgl.Marker({ color: index === 0 ? '#22c55e' : index === ubicaciones.length - 1 ? '#ef4444' : '#3b82f6' })
          .setLngLat([ubicacion.coordenadas.lng, ubicacion.coordenadas.lat])
          .setPopup(popup)
          .addTo(map.current!);
      }
    });

    // Fit map to show all markers
    if (ubicaciones.length > 0) {
      const validCoordinates = ubicaciones
        .filter(u => u.coordenadas)
        .map(u => [u.coordenadas.lng, u.coordenadas.lat] as [number, number]);

      if (validCoordinates.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        validCoordinates.forEach(coord => {
          bounds.extend(coord);
        });

        map.current.fitBounds(bounds, { padding: 50 });
      } else if (validCoordinates.length === 1) {
        map.current.setCenter(validCoordinates[0]);
        map.current.setZoom(14);
      }
    }
  }, [ubicaciones, tokenConfigured]);

  // Draw route if available
  useEffect(() => {
    if (!map.current || !rutaCalculada || !tokenConfigured) return;

    map.current.on('load', () => {
      if (rutaCalculada.geometry) {
        if (map.current!.getSource('route')) {
          map.current!.removeLayer('route');
          map.current!.removeSource('route');
        }

        map.current!.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: rutaCalculada.geometry
          }
        });

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
            'line-width': 5,
            'line-opacity': 0.75
          }
        });
      }
    });
  }, [rutaCalculada, tokenConfigured]);

  if (!isVisible) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Mapa de Ruta
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!tokenConfigured ? (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Se debe configurar la variable <code>VITE_MAPBOX_TOKEN</code> para mostrar el mapa.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div
              ref={mapContainer}
              className="w-full h-96 rounded-lg border"
              style={{ minHeight: '400px' }}
            />
            {rutaCalculada && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Distancia Total:</span>
                    <span className="ml-2 font-medium">{rutaCalculada.distance} km</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tiempo Estimado:</span>
                    <span className="ml-2 font-medium">{rutaCalculada.duration} min</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
