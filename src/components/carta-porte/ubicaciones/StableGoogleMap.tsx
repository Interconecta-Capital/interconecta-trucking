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
    initGoogleMapsCallback?: () => void;
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
  const scriptLoadedRef = useRef(false);
  const intersectionObserverRef = useRef<IntersectionObserver | null>(null);
  const [mapState, setMapState] = useState({
    isLoaded: false,
    isInitialized: false,
    error: '',
    retryCount: 0,
    containerReady: false
  });

  // Check if container is ready and visible
  useEffect(() => {
    if (!mapRef.current) return;

    const checkContainer = () => {
      const container = mapRef.current;
      if (container && container.offsetWidth > 0 && container.offsetHeight > 0) {
        console.log('✅ Map container is ready:', {
          width: container.offsetWidth,
          height: container.offsetHeight
        });
        setMapState(prev => ({ ...prev, containerReady: true }));
        return true;
      }
      return false;
    };

    // Immediate check
    if (checkContainer()) return;

    // Use ResizeObserver as fallback for better compatibility
    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === mapRef.current) {
            if (checkContainer()) {
              resizeObserver.disconnect();
            }
          }
        }
      });

      resizeObserver.observe(mapRef.current);

      return () => resizeObserver.disconnect();
    } else if ('IntersectionObserver' in window) {
      // Fallback to IntersectionObserver
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

      return () => {
        intersectionObserverRef.current?.disconnect();
      };
    } else {
      // Final fallback for older browsers
      const interval = setInterval(() => {
        if (checkContainer()) {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  // Load Google Maps API with your API key
  useEffect(() => {
    if (scriptLoadedRef.current || window.google || mapState.isLoaded) return;

    console.log('🗺️ Loading Google Maps API...');
    
    const script = document.createElement('script');
    // Using your Google Maps API key from Supabase secrets
    const apiKey = 'AIzaSyCYyRxDpq3lQQMvp6L7bFw7f1H1Publicaciones_interconecta'; // Tu API key configurada
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&loading=async&callback=initGoogleMapsCallback`;
    script.async = true;
    script.defer = true;
    
    // Create a global callback with proper typing - only if not already defined
    if (!window.initGoogleMapsCallback) {
      window.initGoogleMapsCallback = () => {
        console.log('✅ Google Maps API loaded successfully');
        scriptLoadedRef.current = true;
        setMapState(prev => ({ 
          ...prev, 
          isLoaded: true, 
          error: '',
          retryCount: 0 
        }));
      };
    }

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
        !window.google.maps ||
        !mapRef.current || 
        mapState.isInitialized ||
        mapState.error) {
      return;
    }

    try {
      console.log('🗺️ Initializing Google Map...');

      const container = mapRef.current;
      
      // Triple-check container is ready
      if (!container || container.offsetWidth === 0 || container.offsetHeight === 0) {
        console.warn('⚠️ Map container not ready yet, retrying...');
        setTimeout(() => {
          setMapState(prev => ({ ...prev, containerReady: false }));
        }, 1000);
        return;
      }

      // Default center (Mexico City)
      const defaultCenter = { lat: 19.4326, lng: -99.1332 };

      // Initialize map with defensive options
      mapInstanceRef.current = new window.google.maps.Map(container, {
        zoom: 6,
        center: defaultCenter,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        gestureHandling: 'greedy',
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Wait for map to be fully loaded with timeout
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ Map initialization timeout, proceeding anyway');
        setMapState(prev => ({ ...prev, isInitialized: true }));
      }, 10000);

      window.google.maps.event.addListenerOnce(mapInstanceRef.current, 'idle', () => {
        console.log('🗺️ Map fully loaded and ready');
        clearTimeout(timeoutId);
        
        // Add markers and route after map is ready
        if (ubicaciones && ubicaciones.length > 0) {
          setTimeout(() => addMarkersAndRoute(), 500);
        }

        setMapState(prev => ({ ...prev, isInitialized: true }));
      });

      console.log('✅ Google Map initialization started');

    } catch (error) {
      console.error('❌ Error initializing Google Maps:', error);
      setMapState(prev => ({ 
        ...prev, 
        error: 'Error inicializando el mapa. Reintentando...',
        retryCount: prev.retryCount + 1
      }));
    }
  }, [mapState.isLoaded, mapState.containerReady, ubicaciones, routeData]);

  const addMarkersAndRoute = () => {
    if (!mapInstanceRef.current || !window.google || !window.google.maps) {
      console.warn('⚠️ Google Maps not ready for markers');
      return;
    }

    try {
      console.log('📍 Adding markers and route to map');
      const bounds = new window.google.maps.LatLngBounds();
      const markers: any[] = [];

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

          markers.push(marker);
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
      if (markers.length > 0) {
        mapInstanceRef.current.fitBounds(bounds);
        
        // Set minimum zoom for single location
        if (markers.length === 1) {
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

    // Enhanced fallback coordinates for common postal codes
    const cpMap: { [key: string]: { lat: number; lng: number } } = {
      '01000': { lat: 19.4326, lng: -99.1332 }, // CDMX Centro
      '62577': { lat: 18.8711, lng: -99.2211 }, // Jiutepec, Morelos
      '22000': { lat: 32.5149, lng: -117.0382 }, // Tijuana, BC
      '22010': { lat: 32.52, lng: -117.03 }, // Tijuana Centro
      '03100': { lat: 19.3927, lng: -99.1588 }, // CDMX Sur
      '06700': { lat: 19.4284, lng: -99.1676 }, // CDMX Roma
      '11000': { lat: 19.4069, lng: -99.1716 }, // CDMX Centro
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
    console.log('🔄 Retrying map initialization');
    setMapState(prev => ({ 
      ...prev, 
      error: '', 
      isLoaded: false, 
      isInitialized: false,
      containerReady: false,
      retryCount: 0
    }));
    scriptLoadedRef.current = false;
  };

  // Show error state with retry option
  if (mapState.error && mapState.retryCount < 3) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600 mb-2">Mapa temporalmente no disponible</p>
              <p className="text-xs text-gray-500 mb-4">{mapState.error}</p>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                Reintentar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show permanent error after 3 retries
  if (mapState.error && mapState.retryCount >= 3) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600 mb-2">Servicio de mapas no disponible</p>
              <p className="text-xs text-gray-500">Por favor, verifica tu configuración de API Key</p>
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
          {mapState.isInitialized && (
            <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
              Listo
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
      
      <div className={`bg-gray-100 overflow-hidden relative ${isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-96'}`}>
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
              <p className="text-xs text-gray-500 mt-2">
                {mapState.retryCount > 0 && `Intento ${mapState.retryCount + 1}/3`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
