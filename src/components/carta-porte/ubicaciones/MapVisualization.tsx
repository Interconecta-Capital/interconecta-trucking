
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, AlertTriangle, Camera, Download, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MapVisualizationProps {
  ubicaciones: any[];
  rutaCalculada?: any;
  isVisible: boolean;
  onClose?: () => void;
  onScreenshotSaved?: (screenshotUrl: string) => void;
}

export function MapVisualization({ 
  ubicaciones, 
  rutaCalculada, 
  isVisible, 
  onClose,
  onScreenshotSaved 
}: MapVisualizationProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken] = useState<string>('pk.eyJ1IjoiaW50ZXJjb25lY3RhIiwiYSI6ImNtYndqcWFyajExYTIya3B1NG1oaXJ2YjIifQ.OVtTgnmv6ZA3En2trhim-Q');
  const [tokenConfigured] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoadingMap, setIsLoadingMap] = useState(true);
  const [isTakingScreenshot, setIsTakingScreenshot] = useState(false);
  const { toast } = useToast();

  // Initialize map when component mounts
  useEffect(() => {
    if (!isVisible || !tokenConfigured || !mapContainer.current || map.current) return;

    setIsLoadingMap(true);
    setMapError(null);

    try {
      mapboxgl.accessToken = mapboxToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-99.1332, 19.4326], // Mexico City default
        zoom: 10
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        setIsLoadingMap(false);
        console.log('Mapa cargado exitosamente');
      });

      map.current.on('error', (e) => {
        console.error('Error del mapa:', e);
        setMapError('Error cargando el mapa. Verifica la conexión a internet.');
        setIsLoadingMap(false);
      });

    } catch (error) {
      console.error('Error inicializando mapa:', error);
      setMapError('Error inicializando el mapa. Token de Mapbox inválido.');
      setIsLoadingMap(false);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [isVisible, tokenConfigured, mapboxToken]);

  // Add markers for ubicaciones
  useEffect(() => {
    if (!map.current || !tokenConfigured || mapError) return;

    try {
      // Clear existing markers
      const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
      existingMarkers.forEach(marker => marker.remove());

      const bounds = new mapboxgl.LngLatBounds();
      let validCoordinates = 0;

      ubicaciones.forEach((ubicacion, index) => {
        if (ubicacion.coordenadas && ubicacion.coordenadas.lng && ubicacion.coordenadas.lat) {
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div class="p-2">
              <h4 class="font-semibold">${ubicacion.nombreRemitenteDestinatario || 'Sin nombre'}</h4>
              <p class="text-sm">${ubicacion.domicilio?.calle || ''} ${ubicacion.domicilio?.numExterior || ''}</p>
              <p class="text-sm">${ubicacion.domicilio?.municipio || ''}, ${ubicacion.domicilio?.estado || ''}</p>
              <p class="text-xs text-gray-600">${ubicacion.tipoUbicacion || ''}</p>
            </div>`
          );

          const markerColor = index === 0 ? '#22c55e' : 
                             index === ubicaciones.length - 1 ? '#ef4444' : '#3b82f6';

          new mapboxgl.Marker({ color: markerColor })
            .setLngLat([ubicacion.coordenadas.lng, ubicacion.coordenadas.lat])
            .setPopup(popup)
            .addTo(map.current!);

          bounds.extend([ubicacion.coordenadas.lng, ubicacion.coordenadas.lat]);
          validCoordinates++;
        }
      });

      // Fit map to show all markers
      if (validCoordinates > 1) {
        map.current.fitBounds(bounds, { padding: 50 });
      } else if (validCoordinates === 1) {
        map.current.setZoom(14);
      }

    } catch (error) {
      console.error('Error agregando marcadores:', error);
      setMapError('Error agregando ubicaciones al mapa');
    }
  }, [ubicaciones, tokenConfigured, mapError]);

  // Draw route if available
  useEffect(() => {
    if (!map.current || !rutaCalculada || !tokenConfigured || mapError) return;

    try {
      const drawRoute = () => {
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
      };

      if (map.current.isStyleLoaded()) {
        drawRoute();
      } else {
        map.current.on('load', drawRoute);
      }

    } catch (error) {
      console.error('Error dibujando ruta:', error);
    }
  }, [rutaCalculada, tokenConfigured, mapError]);

  const takeScreenshot = async () => {
    if (!map.current || isTakingScreenshot) return;

    setIsTakingScreenshot(true);
    try {
      // Wait a moment for the map to settle
      await new Promise(resolve => setTimeout(resolve, 1000));

      const canvas = map.current.getCanvas();
      const dataURL = canvas.toDataURL('image/png');
      
      // Create a download link
      const link = document.createElement('a');
      link.download = `ruta-carta-porte-${Date.now()}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Notify parent component
      if (onScreenshotSaved) {
        onScreenshotSaved(dataURL);
      }

      toast({
        title: "Captura guardada",
        description: "La imagen de la ruta se ha guardado exitosamente",
      });
    } catch (error) {
      console.error('Error tomando captura:', error);
      toast({
        title: "Error",
        description: "No se pudo tomar la captura de la ruta",
        variant: "destructive"
      });
    } finally {
      setIsTakingScreenshot(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Mapa de Ruta - Carta Porte
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={takeScreenshot}
                disabled={isTakingScreenshot || mapError !== null}
                variant="outline"
                size="sm"
              >
                <Camera className="h-4 w-4 mr-2" />
                {isTakingScreenshot ? 'Capturando...' : 'Capturar'}
              </Button>
              {onClose && (
                <Button onClick={onClose} variant="outline" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-6">
          {mapError ? (
            <Alert className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{mapError}</AlertDescription>
            </Alert>
          ) : null}
          
          {isLoadingMap && !mapError && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p>Cargando mapa...</p>
              </div>
            </div>
          )}
          
          <div 
            ref={mapContainer} 
            className={`w-full h-96 rounded-lg border ${mapError ? 'hidden' : ''}`}
            style={{ minHeight: '400px' }}
          />
          
          {rutaCalculada && !mapError && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Distancia Total:</span>
                  <span className="ml-2 font-medium">{rutaCalculada.distance || 0} km</span>
                </div>
                <div>
                  <span className="text-gray-600">Tiempo Estimado:</span>
                  <span className="ml-2 font-medium">{rutaCalculada.duration || 0} min</span>
                </div>
                <div>
                  <span className="text-gray-600">Ubicaciones:</span>
                  <span className="ml-2 font-medium">{ubicaciones.length}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
