
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
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
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [tokenConfigured, setTokenConfigured] = useState(false);

  // Check if Mapbox token is configured
  useEffect(() => {
    const token = import.meta.env.VITE_MAPBOX_TOKEN || localStorage.getItem('mapbox_token') || '';
    if (token && token !== 'your-mapbox-token-here') {
      setMapboxToken(token);
      setTokenConfigured(true);
    }
  }, []);

  // Initialize map when token is available
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
      const coordinates = ubicaciones
        .filter(u => u.coordenadas)
        .map(u => [u.coordenadas.lng, u.coordenadas.lat]);

      if (coordinates.length > 1) {
        const bounds = coordinates.reduce((bounds, coord) => {
          return bounds.extend(coord as mapboxgl.LngLatLike);
        }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

        map.current.fitBounds(bounds, { padding: 50 });
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

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const token = formData.get('token') as string;
    
    if (token) {
      localStorage.setItem('mapbox_token', token);
      setMapboxToken(token);
      setTokenConfigured(true);
    }
  };

  if (!isVisible) return null;

  if (!tokenConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Configuración de Mapbox
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Para visualizar el mapa y las rutas, necesitas configurar tu token de Mapbox.
              Puedes obtenerlo gratis en{' '}
              <a 
                href="https://mapbox.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                mapbox.com
              </a>
            </AlertDescription>
          </Alert>
          
          <form onSubmit={handleTokenSubmit} className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium mb-2">
                Token de Mapbox (público)
              </label>
              <input
                type="text"
                name="token"
                id="token"
                placeholder="pk.eyJ1IjoibXl1c2VybmFtZSIsImEiOiJjazE..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <Button type="submit">
              Configurar Mapbox
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

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
