
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Maximize2, Minimize2, AlertTriangle, MapPin, Loader2 } from 'lucide-react';

interface StableGoogleMapProps {
  ubicaciones: any[];
  routeData: any;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

declare global {
  interface Window {
    google: any;
  }
}

export function StableGoogleMap({ 
  ubicaciones, 
  routeData, 
  isFullscreen, 
  onToggleFullscreen 
}: StableGoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const [mapState, setMapState] = useState({
    isLoaded: false,
    isInitialized: false,
    error: '',
    retryCount: 0,
    containerReady: false
  });

  // Check if container is ready
  useEffect(() => {
    if (!mapRef.current) return;

    const checkContainer = () => {
      const container = mapRef.current;
      if (container && container.offsetWidth > 0 && container.offsetHeight > 0) {
        setMapState(prev => ({ ...prev, containerReady: true }));
        return true;
      }
      return false;
    };

    // Immediate check
    if (checkContainer()) return;

    // Use IntersectionObserver to detect when container becomes visible
    if ('IntersectionObserver' in window) {
      intersectionObserverRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.target === mapRef.current) {
              if (checkContainer()) {
                intersectionObserverRef.current?.disconnect();
              }
            }
          });
        },
        { threshold: 0.1 }
      );

      intersectionObserverRef.current.observe(mapRef.current);
    } else {
      // Fallback for browsers without IntersectionObserver
      const interval = setInterval(() => {
        if (checkContainer()) {
          clearInterval(interval);
        }
      }, 500);

      return () => clearInterval(interval);
    }

    return () => {
      intersectionObserverRef.current?.disconnect();
    };
  }, []);

  // Load Google Maps API
  useEffect(() => {
    if (window.google || mapState.isLoaded) return;

    console.log('🗺️ Loading Google Maps API...');
    
    const script = document.createElement('script');
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyBpZVhEF9lJbBg1cQhF2jQzPxF8cQhF2jQ';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&loading=async`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('✅ Google Maps API loaded successfully');
      setMapState(prev => ({ 
        ...prev, 
        isLoaded: true, 
        error: '',
        retryCount: 0 
      }));
    };

    script.onerror = (error) => {
      console.error('❌ Error loading Google Maps API:', error);
      setMapState(prev => ({ 
        ...prev, 
        error: 'Error cargando Google Maps. Verifica la configuración de la API Key.',
        retryCount: prev.retryCount + 1 
      }));
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [mapState.retryCount]);

  // Initialize map when everything is ready
  useEffect(() => {
    if (!mapState.isLoaded || 
        !mapState.containerReady ||
        !window.google || 
        !mapRef.current || 
        mapState.isInitialized ||
        mapState.error) {
      return;
    }

    try {
      console.log('🗺️ Initializing Google Map...');

      const container = mapRef.current;
      
      // Double-check container is ready
      if (!container || container.offsetWidth === 0 || container.offsetHeight === 0) {
        console.warn('⚠️ Map container not ready yet, waiting...');
        setTimeout(() => {
          setMapState(prev => ({ ...prev, containerReady: false }));
        }, 1000);
        return;
      }

      // Default center (Mexico City)
      const defaultCenter = { lat: 19.4326, lng: -99.1332 };

      // Initialize map with safer options
      mapInstanceRef.current = new window.google.maps.Map(container, {
        zoom: 6,
        center: defaultCenter,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        gestureHandling: 'greedy',
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Wait for map to be fully loaded
      window.google.maps.event.addListenerOnce(mapInstanceRef.current, 'idle', () => {
        console.log('🗺️ Map fully loaded');
        
        // Add markers and route
        if (ubicaciones && ubicaciones.length > 0) {
          addMarkersAndRoute();
        }

        setMapState(prev => ({ ...prev, isInitialized: true }));
      });

      console.log('✅ Google Map initialization started');

    } catch (error) {
      console.error('❌ Error initializing Google Maps:', error);
      setMapState(prev => ({ 
        ...prev, 
        error: 'Error inicializando el mapa. Por favor, recarga la página.',
        retryCount: prev.retryCount + 1
      }));
    }
  }, [mapState.isLoaded, mapState.containerReady, ubicaciones, routeData]);

  const addMarkersAndRoute = () => {
    if (!mapInstanceRef.current || !window.google) return;

    try {
      const bounds = new window.google.maps.LatLngBounds();

      // Add markers for each location
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
            }
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

      // Add route if available and geometry library is loaded
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
          console.warn('⚠️ Error displaying route on map:', error);
        }
      }

      // Fit map to bounds
      if (ubicaciones.length > 0) {
        mapInstanceRef.current.fitBounds(bounds);
        
        // Set minimum zoom for single location
        if (ubicaciones.length === 1) {
          setTimeout(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.setZoom(15);
            }
          }, 100);
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

    // Fallback coordinates for common postal codes
    const cpMap: { [key: string]: { lat: number; lng: number } } = {
      '01000': { lat: 19.4326, lng: -99.1332 }, // CDMX Centro
      '62577': { lat: 18.8711, lng: -99.2211 }, // Jiutepec, Morelos
      '22000': { lat: 32.5149, lng: -117.0382 }, // Tijuana, BC
      '22010': { lat: 32.52, lng: -117.03 }, // Tijuana Centro
    };

    const cp = ubicacion.domicilio?.codigoPostal;
    return cpMap[cp] || { lat: 19.4326, lng: -99.1332 };
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
    setMapState(prev => ({ 
      ...prev, 
      error: '', 
      isLoaded: false, 
      isInitialized: false,
      containerReady: false
    }));
  };

  if (mapState.error) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600 mb-2">Mapa no disponible</p>
              <p className="text-xs text-gray-500 mb-4">{mapState.error}</p>
              {mapState.retryCount < 3 && (
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  Reintentar
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`border border-blue-200 rounded-lg overflow-hidden ${isFullscreen ? 'fixed inset-4 z-50 bg-white' : ''}`}>
      <div className="flex items-center justify-between p-3 bg-blue-50 border-b border-blue-200">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Visualización de Ruta</span>
          {!mapState.isInitialized && mapState.isLoaded && (
            <Badge variant="outline" className="ml-2">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Inicializando
            </Badge>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? 
            <Minimize2 className="h-4 w-4" /> : 
            <Maximize2 className="h-4 w-4" />
          }
        </Button>
      </div>
      
      <div className={`bg-gray-100 overflow-hidden ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-96'}`}>
        <div ref={mapRef} className="w-full h-full" />
        {(!mapState.isInitialized || !mapState.containerReady) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
              <p className="text-sm text-gray-600">
                {!mapState.isLoaded ? 'Cargando Google Maps...' : 
                 !mapState.containerReady ? 'Preparando contenedor...' : 
                 'Inicializando mapa...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
