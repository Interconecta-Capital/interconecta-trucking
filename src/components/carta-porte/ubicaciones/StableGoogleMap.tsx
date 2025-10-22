
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Maximize2, Minimize2, AlertTriangle, MapPin, Loader2, Settings, RefreshCw } from 'lucide-react';
import { useGoogleMapsAPI } from '@/hooks/useGoogleMapsAPI';

interface StableGoogleMapProps {
  ubicaciones: any[];
  routeData: any;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function StableGoogleMap({ 
  ubicaciones, 
  routeData, 
  isFullscreen, 
  onToggleFullscreen 
}: StableGoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const { isLoaded, error: apiError } = useGoogleMapsAPI();
  
  const [mapState, setMapState] = useState({
    isInitialized: false,
    error: '',
    retryCount: 0,
    containerReady: false,
    loadingMessage: 'Iniciando Google Maps...'
  });

  // Check if container is ready usando ResizeObserver (mejor performance)
  useEffect(() => {
    if (!mapRef.current) return;

    const checkContainer = () => {
      const container = mapRef.current;
      if (container && container.offsetWidth > 0 && container.offsetHeight > 0) {
        console.log('✅ Map container is ready');
        setMapState(prev => ({ ...prev, containerReady: true }));
        return true;
      }
      return false;
    };

    if (checkContainer()) return;

    const timeout = setTimeout(() => {
      if (!checkContainer()) {
        console.warn('⚠️ Container taking too long to be ready');
        setMapState(prev => ({ 
          ...prev, 
          containerReady: true,
          loadingMessage: 'Preparando contenedor...'
        }));
      }
    }, 2000);

    // Usar ResizeObserver para detectar cambios de tamaño sin forced reflows
    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          // Las dimensiones ya están disponibles en contentRect
          const { width, height } = entry.contentRect;
          
          if (entry.target === mapRef.current && width > 0 && height > 0) {
            console.log('✅ Map container is ready via ResizeObserver');
            setMapState(prev => ({ ...prev, containerReady: true }));
            resizeObserver.disconnect();
            clearTimeout(timeout);
          }
        }
      });

      resizeObserver.observe(mapRef.current);
      return () => {
        resizeObserver.disconnect();
        clearTimeout(timeout);
      };
    }

    return () => clearTimeout(timeout);
  }, []);

  // Initialize map when ready
  useEffect(() => {
    if (!isLoaded || 
        !mapState.containerReady ||
        !window.google || 
        !mapRef.current || 
        mapState.isInitialized ||
        apiError) {
      return;
    }

    const initializeMap = () => {
      try {
        console.log('🗺️ Initializing Google Map...');
        setMapState(prev => ({ ...prev, loadingMessage: 'Inicializando mapa...' }));

        const container = mapRef.current;
        
        // Batch de lecturas
        const hasWidth = container && container.offsetWidth > 0;
        const hasHeight = container && container.offsetHeight > 0;
        
        // Batch de escrituras en requestAnimationFrame
        if (!hasWidth || !hasHeight) {
          console.warn('⚠️ Map container not ready yet, forcing dimensions');
          requestAnimationFrame(() => {
            if (container) {
              container.style.width = '100%';
              container.style.height = '100%';
              container.style.minHeight = '400px';
            }
          });
        }

        const defaultCenter = { lat: 19.4326, lng: -99.1332 };

        mapInstanceRef.current = new window.google.maps.Map(container, {
          zoom: 6,
          center: defaultCenter,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          gestureHandling: 'greedy',
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          mapTypeControlOptions: {
            style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: window.google.maps.ControlPosition.TOP_CENTER
          }
        });

        // Enhanced map load detection
        const mapLoadTimeout = setTimeout(() => {
          console.log('🗺️ Map initialization timeout, assuming ready');
          if (!mapState.isInitialized) {
            setMapState(prev => ({ 
              ...prev, 
              isInitialized: true,
              loadingMessage: 'Mapa listo'
            }));
            if (ubicaciones && ubicaciones.length > 0) {
              setTimeout(() => addMarkersAndRoute(), 1000);
            }
          }
        }, 8000);

        window.google.maps.event.addListenerOnce(mapInstanceRef.current, 'idle', () => {
          console.log('🗺️ Map fully loaded and ready');
          clearTimeout(mapLoadTimeout);
          
          setMapState(prev => ({ 
            ...prev, 
            isInitialized: true,
            loadingMessage: 'Mapa completamente cargado'
          }));

          if (ubicaciones && ubicaciones.length > 0) {
            setTimeout(() => addMarkersAndRoute(), 500);
          }
        });

        window.google.maps.event.addListener(mapInstanceRef.current, 'bounds_changed', () => {
          if (!mapState.isInitialized) {
            console.log('🗺️ Map bounds changed - assuming ready');
            setMapState(prev => ({ 
              ...prev, 
              isInitialized: true,
              loadingMessage: 'Mapa interactivo'
            }));
          }
        });

      } catch (error) {
        console.error('❌ Error initializing Google Maps:', error);
        setMapState(prev => ({ 
          ...prev, 
          error: 'Error inicializando el mapa: ' + (error instanceof Error ? error.message : 'Error desconocido'),
          retryCount: prev.retryCount + 1,
          loadingMessage: 'Error de inicialización'
        }));
      }
    };

    const initTimeout = setTimeout(initializeMap, 100);
    return () => clearTimeout(initTimeout);
  }, [isLoaded, mapState.containerReady, apiError]);

  const addMarkersAndRoute = () => {
    if (!mapInstanceRef.current || !window.google || !window.google.maps) {
      console.warn('⚠️ Google Maps not ready for markers');
      return;
    }

    try {
      console.log('📍 Adding markers and route to map');
      const bounds = new window.google.maps.LatLngBounds();

      ubicaciones.forEach((ubicacion, index) => {
        const coords = getCoordinatesForUbicacion(ubicacion);
        
        if (coords) {
          const marker = new window.google.maps.Marker({
            position: coords,
            map: mapInstanceRef.current,
            title: ubicacion.nombreRemitenteDestinatario || `${ubicacion.tipoUbicacion} ${index + 1}`,
            icon: {
              url: getMarkerIcon(ubicacion.tipoUbicacion),
              scaledSize: new window.google.maps.Size(32, 32)
            },
            animation: window.google.maps.Animation.DROP
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 8px; max-width: 200px;">
                <h3 style="margin: 0 0 4px 0; font-weight: bold; font-size: 14px;">${ubicacion.tipoUbicacion}</h3>
                <p style="margin: 0 0 4px 0; font-size: 12px;">${ubicacion.nombreRemitenteDestinatario || 'Sin nombre'}</p>
                <p style="margin: 0; font-size: 11px; color: #666;">${ubicacion.domicilio?.calle || ''}, ${ubicacion.domicilio?.municipio || ''}</p>
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

    } catch (error) {
      console.error('❌ Error adding markers and route:', error);
    }
  };

  const getCoordinatesForUbicacion = (ubicacion: any) => {
    if (ubicacion.coordenadas) {
      return {
        lat: ubicacion.coordenadas.latitud,
        lng: ubicacion.coordenadas.longitud
      };
    }

    // Fallback coordinates by postal code
    const cpMap: { [key: string]: { lat: number; lng: number } } = {
      '01000': { lat: 19.4326, lng: -99.1332 },
      '03100': { lat: 19.3927, lng: -99.1588 },
      '06700': { lat: 19.4284, lng: -99.1676 },
      '11000': { lat: 19.4069, lng: -99.1716 },
      '62577': { lat: 18.8711, lng: -99.2211 },
      '22000': { lat: 32.5149, lng: -117.0382 },
    };

    return cpMap[ubicacion.domicilio?.codigoPostal] || { lat: 19.4326, lng: -99.1332 };
  };

  const getMarkerIcon = (tipo: string) => {
    const iconMap = {
      'Origen': 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
      'Destino': 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
      'Paso Intermedio': 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png'
    };
    return iconMap[tipo as keyof typeof iconMap] || 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
  };

  const handleRetry = () => {
    console.log('🔄 Retrying Google Maps initialization');
    setMapState(prev => ({ 
      ...prev, 
      error: '', 
      retryCount: prev.retryCount + 1,
      isInitialized: false,
      loadingMessage: 'Reintentando...'
    }));
  };

  if (apiError) {
    return (
      <Card className={`border-red-200 ${isFullscreen ? 'fixed inset-4 z-50 bg-white' : ''}`}>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error de configuración</h3>
          <p className="text-red-600 mb-4">{apiError}</p>
          <p className="text-sm text-gray-600">
            Configure GOOGLE_MAPS_API_KEY en los secretos de Edge Functions para usar el mapa.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-blue-200 ${isFullscreen ? 'fixed inset-4 z-50 bg-white' : ''}`}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-3 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Mapa de Google</span>
            {mapState.isInitialized && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Listo
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {mapState.error && (
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Reintentar
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onToggleFullscreen}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {/* Map Container */}
        <div className={`bg-gray-100 overflow-hidden ${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-96'}`}>
          {mapState.error ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center p-4">
                <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-600 mb-2">{mapState.error}</p>
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reintentar
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div ref={mapRef} className="w-full h-full" />
              {!mapState.isInitialized && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
                    <p className="text-sm text-gray-600">{mapState.loadingMessage}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
