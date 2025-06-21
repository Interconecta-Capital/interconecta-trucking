
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Maximize2, Minimize2, AlertTriangle, MapPin, Loader2, Settings, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
  const [mapState, setMapState] = useState({
    isLoaded: false,
    isInitialized: false,
    error: '',
    retryCount: 0,
    containerReady: false,
    apiKeyValid: false,
    loadingMessage: 'Iniciando Google Maps...'
  });

  // Check if container is ready
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
          containerReady: true, // Force ready state
          loadingMessage: 'Preparando contenedor...'
        }));
      }
    }, 2000);

    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          if (entry.target === mapRef.current && checkContainer()) {
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

  // Load Google Maps API with robust error handling
  useEffect(() => {
    if (scriptLoadedRef.current || window.google || mapState.isLoaded) return;

    const loadGoogleMaps = async () => {
      try {
        console.log('🗺️ Loading Google Maps API...');
        setMapState(prev => ({ ...prev, loadingMessage: 'Obteniendo clave API...' }));
        
        // Get API key from Supabase secrets with retry logic
        let apiKey: string | null = null;
        let attempts = 0;
        const maxAttempts = 3;

        while (!apiKey && attempts < maxAttempts) {
          attempts++;
          try {
            const { data, error } = await supabase.functions.invoke('get-google-maps-key', {
              headers: {
                'Content-Type': 'application/json',
              }
            });
            
            if (error) {
              console.warn(`⚠️ Intento ${attempts} falló:`, error);
              if (attempts === maxAttempts) {
                throw new Error(`Failed to get API key after ${maxAttempts} attempts: ${error.message}`);
              }
              await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Exponential backoff
              continue;
            }
            
            if (data?.apiKey) {
              apiKey = data.apiKey;
              console.log('✅ API Key obtenida exitosamente');
            } else {
              throw new Error('No API key in response');
            }
          } catch (error) {
            console.warn(`⚠️ Error en intento ${attempts}:`, error);
            if (attempts === maxAttempts) {
              throw error;
            }
            await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
          }
        }

        if (!apiKey) {
          throw new Error('No se pudo obtener la clave API después de múltiples intentos');
        }

        setMapState(prev => ({ 
          ...prev, 
          apiKeyValid: true,
          loadingMessage: 'Cargando biblioteca de Google Maps...'
        }));

        // Check if script already exists and remove it
        const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
        if (existingScript) {
          existingScript.remove();
          window.google = undefined;
        }

        // Create global callback with error handling
        window.initGoogleMapsCallback = () => {
          console.log('✅ Google Maps API loaded successfully');
          scriptLoadedRef.current = true;
          setMapState(prev => ({ 
            ...prev, 
            isLoaded: true, 
            error: '',
            retryCount: 0,
            loadingMessage: 'API cargada exitosamente'
          }));
        };

        // Load script with enhanced error handling
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&loading=async&callback=initGoogleMapsCallback`;
        script.async = true;
        script.defer = true;
        
        let scriptTimeout: NodeJS.Timeout;
        
        script.onload = () => {
          console.log('📦 Google Maps script loaded');
          clearTimeout(scriptTimeout);
        };
        
        script.onerror = (event) => {
          console.error('❌ Error loading Google Maps script:', event);
          clearTimeout(scriptTimeout);
          setMapState(prev => ({ 
            ...prev, 
            error: 'Error cargando Google Maps. Verifica la conexión a internet.',
            retryCount: prev.retryCount + 1,
            apiKeyValid: false,
            loadingMessage: 'Error de carga'
          }));
        };

        // Set timeout for script loading
        scriptTimeout = setTimeout(() => {
          console.error('⏰ Google Maps script load timeout');
          setMapState(prev => ({ 
            ...prev, 
            error: 'Tiempo de espera agotado cargando Google Maps',
            retryCount: prev.retryCount + 1,
            loadingMessage: 'Tiempo agotado'
          }));
        }, 10000);

        document.head.appendChild(script);

      } catch (error) {
        console.error('❌ Error inicializando Google Maps:', error);
        setMapState(prev => ({ 
          ...prev, 
          error: error instanceof Error ? error.message : 'Error de inicialización',
          apiKeyValid: false,
          loadingMessage: 'Error de inicialización'
        }));
      }
    };

    loadGoogleMaps();
  }, [mapState.retryCount]);

  // Initialize map when ready with enhanced error handling
  useEffect(() => {
    if (!mapState.isLoaded || 
        !mapState.containerReady ||
        !window.google || 
        !mapRef.current || 
        mapState.isInitialized ||
        mapState.error ||
        !mapState.apiKeyValid) {
      return;
    }

    const initializeMap = () => {
      try {
        console.log('🗺️ Initializing Google Map...');
        setMapState(prev => ({ ...prev, loadingMessage: 'Inicializando mapa...' }));

        const container = mapRef.current;
        
        if (!container || container.offsetWidth === 0 || container.offsetHeight === 0) {
          console.warn('⚠️ Map container not ready yet, forcing dimensions');
          container!.style.width = '100%';
          container!.style.height = '100%';
          container!.style.minHeight = '400px';
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

        // Additional event listeners for better error detection
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

    // Delay initialization slightly to ensure DOM is ready
    const initTimeout = setTimeout(initializeMap, 100);
    return () => clearTimeout(initTimeout);
  }, [mapState.isLoaded, mapState.containerReady, mapState.apiKeyValid]);

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

          markers.push(marker);
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
          console.warn('⚠️ Error displaying route on map:', error);
        }
      }

      // Fit map to bounds with padding
      if (markers.length > 0) {
        if (markers.length === 1) {
          mapInstanceRef.current.setCenter(bounds.getCenter());
          mapInstanceRef.current.setZoom(15);
        } else {
          mapInstanceRef.current.fitBounds(bounds, { padding: 50 });
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
      '44100': { lat: 20.6597, lng: -103.3496 }, // Guadalajara Centro
      '64000': { lat: 25.6866, lng: -100.3161 }, // Monterrey Centro
      '20000': { lat: 20.9674, lng: -89.5926 }, // Mérida Centro
      '80000': { lat: 25.7903, lng: -108.9850 }, // Culiacán Centro
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
      retryCount: 0,
      apiKeyValid: false,
      loadingMessage: 'Reintentando...'
    }));
    scriptLoadedRef.current = false;
    
    // Remove existing script
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.remove();
    }
    window.google = undefined;
  };

  // Configuration needed state
  if (!mapState.apiKeyValid && mapState.error && mapState.retryCount >= 3) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <Settings className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-sm text-yellow-800 mb-2">Google Maps requiere configuración</p>
              <p className="text-xs text-yellow-700 mb-4">
                Configure su Google Maps API key en Supabase Edge Function Secrets
              </p>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="h-4 w-4 mr-1" />
                Verificar configuración
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error with retry
  if (mapState.error && mapState.retryCount < 3) {
    return (
      <Card className="border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm text-red-600 mb-2">Mapa temporalmente no disponible</p>
              <p className="text-xs text-gray-500 mb-4">{mapState.error}</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={handleRetry}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Reintentar ({3 - mapState.retryCount} intentos restantes)
                </Button>
              </div>
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
              {mapState.loadingMessage}
            </Badge>
          )}
          {mapState.isInitialized && (
            <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
              ✓ Listo
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
        <div ref={mapRef} className="w-full h-full" style={{ minHeight: '400px' }} />
        {(!mapState.isInitialized) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
              <p className="text-sm text-gray-600">
                {mapState.loadingMessage}
              </p>
              {mapState.retryCount > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Intento {mapState.retryCount + 1} de 3
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
