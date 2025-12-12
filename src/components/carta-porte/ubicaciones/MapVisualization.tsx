import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import DOMPurify from 'dompurify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  const [mapboxToken] = useState<string>('pk.eyJ1IjoiaW50ZXJjb25lY3RhIiwiYSI6ImNtYndqcWFyajExYTIya3B1NG1oaXJ2YjIifQ.OVtTgnmv6ZA3En2trhim-Q');
  const [tokenConfigured] = useState(true);

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
        // Sanitize user-provided data to prevent XSS
        const sanitizedName = DOMPurify.sanitize(ubicacion.nombreRemitenteDestinatario || '');
        const sanitizedCalle = DOMPurify.sanitize(ubicacion.domicilio?.calle || '');
        const sanitizedNumExterior = DOMPurify.sanitize(ubicacion.domicilio?.numExterior || '');
        const sanitizedMunicipio = DOMPurify.sanitize(ubicacion.domicilio?.municipio || '');
        const sanitizedEstado = DOMPurify.sanitize(ubicacion.domicilio?.estado || '');

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div>
            <h4>${sanitizedName}</h4>
            <p>${sanitizedCalle} ${sanitizedNumExterior}</p>
            <p>${sanitizedMunicipio}, ${sanitizedEstado}</p>
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
      </CardContent>
    </Card>
  );
}
