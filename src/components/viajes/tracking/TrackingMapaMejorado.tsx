import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Route, 
  Clock, 
  Navigation, 
  ExternalLink,
  Maximize2,
  Minimize2,
  RefreshCw,
  MapIcon,
  Truck,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { GoogleMapVisualization } from '@/components/carta-porte/ubicaciones/GoogleMapVisualization';
import { Ubicacion } from '@/types/ubicaciones';
import { Viaje } from '@/types/viaje';

interface TrackingMapaMejoradoProps {
  viaje: Viaje;
  ubicacionActual?: { lat: number; lng: number };
  enTiempoReal?: boolean;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const TrackingMapaMejorado: React.FC<TrackingMapaMejoradoProps> = ({
  viaje,
  ubicacionActual,
  enTiempoReal = false,
  isFullscreen = false,
  onToggleFullscreen
}) => {
  const [mapFullscreen, setMapFullscreen] = useState(false);
  const [mapaKey, setMapaKey] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Extraer datos del tracking_data
  const trackingData = viaje.tracking_data || {};
  const origenData = trackingData.origen || {};
  const destinoData = trackingData.destino || {};
  
  // Buscar paradas en diferentes ubicaciones posibles
  const paradasData = trackingData.paradasAutorizadas || 
                      trackingData.paradas || 
                      trackingData.ubicacionesIntermedias || 
                      (trackingData.ubicaciones || []).filter((u: any) => u.tipoUbicacion === 'Paso Intermedio') ||
                      [];
  
  const rutaCalculada = trackingData.rutaCalculada || {};

  // Debug: Ver qué coordenadas estamos recibiendo
  console.log('🗺️ TrackingMapa - Datos recibidos:', {
    origenCoordenadas: origenData.coordenadas,
    destinoCoordenadas: destinoData.coordenadas,
    paradasCoordenadas: paradasData.map((p: any) => ({ 
      direccion: p.direccion, 
      coordenadas: p.coordenadas 
    }))
  });

  // Refrescar mapa cada 30 segundos si está en tiempo real
  useEffect(() => {
    if (enTiempoReal) {
      const interval = setInterval(() => {
        setMapaKey(prev => prev + 1);
        setLastUpdate(new Date());
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [enTiempoReal]);

  // Generar enlace de Google Maps con ruta completa
  const generateGoogleMapsLink = () => {
    const origenDir = origenData.direccion || viaje.origen;
    const destinoDir = destinoData.direccion || viaje.destino;
    
    if (!origenDir || !destinoDir) return null;
    
    let url = 'https://www.google.com/maps/dir/';
    url += encodeURIComponent(origenDir);
    
    // Agregar paradas como waypoints
    if (paradasData.length > 0) {
      paradasData.forEach((parada: any) => {
        url += '/' + encodeURIComponent(parada.direccion);
      });
    }
    
    url += '/' + encodeURIComponent(destinoDir);
    return url;
  };

  // Preparar ubicaciones para el mapa (solo las que tienen coordenadas válidas)
  const ubicacionesParaMapa: Ubicacion[] = [];
  
  // Agregar origen si tiene coordenadas
  if (origenData.coordenadas) {
    // Manejar diferentes formatos de coordenadas
    const coordenadas = origenData.coordenadas;
    const latitud = coordenadas.latitud || coordenadas.lat;
    const longitud = coordenadas.longitud || coordenadas.lng;
    
    if (latitud && longitud) {
      ubicacionesParaMapa.push({
        id: 'origen',
        idUbicacion: 'origen-001',
        tipoUbicacion: 'Origen',
        nombreRemitenteDestinatario: 'Punto de Origen',
        domicilio: { 
          calle: origenData.direccion || viaje.origen || 'Origen no especificado',
          pais: 'MEX',
          codigoPostal: origenData.codigoPostal || '01000',
          estado: origenData.estado || 'CDMX',
          municipio: origenData.municipio || 'Miguel Hidalgo',
          colonia: origenData.colonia || 'Centro'
        },
        coordenadas: { 
          latitud: latitud, 
          longitud: longitud 
        }
      });
    }
  }
  
  // Agregar paradas (con geocodificación si es necesario)
  paradasData.forEach((parada: any, index: number) => {
    console.log(`🗺️ Procesando parada ${index + 1}:`, parada);
    
    if (parada.coordenadas) {
      // Manejar diferentes formatos de coordenadas
      const coordenadas = parada.coordenadas;
      const latitud = coordenadas.latitud || coordenadas.lat;
      const longitud = coordenadas.longitud || coordenadas.lng;
      
      if (latitud && longitud) {
        ubicacionesParaMapa.push({
          id: parada.id || `parada-${index}`,
          idUbicacion: `parada-${index + 1}`,
          tipoUbicacion: 'Paso Intermedio',
          nombreRemitenteDestinatario: parada.nombre || `Parada ${index + 1}`,
          domicilio: { 
            calle: parada.direccion || 'Parada autorizada',
            pais: 'MEX',
            codigoPostal: parada.codigoPostal || '50000',
            estado: 'MEX',
            municipio: 'Ubicación intermedia',
            colonia: 'Centro'
          },
          coordenadas: { 
            latitud: latitud, 
            longitud: longitud 
          }
        });
      }
    } else if (parada.direccion) {
      // Si no hay coordenadas pero hay dirección, usar coordenadas aproximadas del centro de México
      console.log(`🗺️ Parada sin coordenadas: ${parada.direccion}`);
      
      // Usar coordenadas del centro de México como placeholder
      // El GoogleMapVisualization puede geocodificar usando la dirección en el domicilio
      ubicacionesParaMapa.push({
        id: parada.id || `parada-${index}`,
        idUbicacion: `parada-${index + 1}`,
        tipoUbicacion: 'Paso Intermedio',
        nombreRemitenteDestinatario: parada.nombre || `Parada ${index + 1}`,
        domicilio: { 
          calle: parada.direccion,
          pais: 'MEX',
          codigoPostal: parada.codigoPostal || '50000',
          estado: 'MEX',
          municipio: 'Ubicación intermedia',
          colonia: 'Centro'
        },
        coordenadas: { 
          latitud: 19.4326, // Coordenadas del centro de CDMX como placeholder
          longitud: -99.1332 // Se geocodificará usando la dirección del domicilio
        }
      });
    }
  });
  
  // Agregar destino si tiene coordenadas
  if (destinoData.coordenadas) {
    // Manejar diferentes formatos de coordenadas
    const coordenadas = destinoData.coordenadas;
    const latitud = coordenadas.latitud || coordenadas.lat;
    const longitud = coordenadas.longitud || coordenadas.lng;
    
    if (latitud && longitud) {
      ubicacionesParaMapa.push({
        id: 'destino',
        idUbicacion: 'destino-001',
        tipoUbicacion: 'Destino',
        nombreRemitenteDestinatario: 'Punto de Destino',
        domicilio: { 
          calle: destinoData.direccion || viaje.destino || 'Destino no especificado',
          pais: 'MEX',
          codigoPostal: destinoData.codigoPostal || '44100',
          estado: destinoData.estado || 'JAL',
          municipio: destinoData.municipio || 'Guadalajara',
          colonia: destinoData.colonia || 'Centro'
        },
        coordenadas: { 
          latitud: latitud, 
          longitud: longitud 
        }
      });
    }
  }

  // Agregar ubicación actual si está disponible
  if (ubicacionActual) {
    ubicacionesParaMapa.push({
      id: 'actual',
      idUbicacion: 'actual-001',
      tipoUbicacion: 'Paso Intermedio',
      nombreRemitenteDestinatario: 'Ubicación Actual',
      domicilio: { 
        calle: 'En tránsito',
        pais: 'MEX',
        codigoPostal: '50000',
        estado: 'MEX',
        municipio: 'En ruta',
        colonia: 'Centro'
      },
      coordenadas: { 
        latitud: ubicacionActual.lat, 
        longitud: ubicacionActual.lng 
      }
    });
  }

  const googleMapsUrl = generateGoogleMapsLink();
  const distanciaTotal = rutaCalculada.distanciaKm || viaje.tracking_data?.distanciaRecorrida || 0;

  if (mapFullscreen) {
    return (
      <div className="fixed inset-4 z-50 bg-white flex flex-col shadow-2xl rounded-lg">
        {/* Header del mapa para fullscreen */}
        <Card className="flex-shrink-0">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <MapIcon className="h-5 w-5 text-primary" />
                Mapa de Ruta - {viaje.carta_porte_id}
                {enTiempoReal && (
                  <Badge className="bg-success text-success-foreground animate-pulse">
                    EN VIVO
                  </Badge>
                )}
              </CardTitle>
              <div className="flex gap-2">
                {enTiempoReal && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setMapaKey(prev => prev + 1);
                      setLastUpdate(new Date());
                    }}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setMapFullscreen(false)}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Mapa principal en fullscreen */}
        <Card className="flex-1 min-h-0">
          <CardContent className="p-0 h-full">
            <div className="h-full w-full">
              <GoogleMapVisualization
                key={mapaKey}
                ubicaciones={ubicacionesParaMapa}
                routeData={{
                  distance_km: distanciaTotal,
                  duration_minutes: 420,
                  google_data: {
                    polyline: 'route_with_waypoints',
                    bounds: ubicacionesParaMapa.length > 0 ? { 
                      north: Math.max(...ubicacionesParaMapa.map(u => u.coordenadas.latitud)),
                      south: Math.min(...ubicacionesParaMapa.map(u => u.coordenadas.latitud)),
                      east: Math.max(...ubicacionesParaMapa.map(u => u.coordenadas.longitud)),
                      west: Math.min(...ubicacionesParaMapa.map(u => u.coordenadas.longitud))
                    } : undefined,
                    legs: []
                  }
                }}
                isVisible={true}
              />
            </div>
          </CardContent>
        </Card>

        {/* Información de la ruta en fullscreen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-primary" />
            <div>
              <div className="text-sm font-medium">Distancia</div>
              <div className="text-lg font-bold text-primary">{distanciaTotal} km</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Route className="h-4 w-4 text-secondary-foreground" />
            <div>
              <div className="text-sm font-medium">Paradas</div>
              <div className="text-lg font-bold text-secondary-foreground">{paradasData.length}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-accent-foreground" />
            <div>
              <div className="text-sm font-medium">Estado</div>
              <div className="text-lg font-bold text-accent-foreground capitalize">
                {viaje.estado.replace('_', ' ')}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {enTiempoReal ? (
              <Truck className="h-4 w-4 text-success" />
            ) : (
              <MapPin className="h-4 w-4 text-muted-foreground" />
            )}
            <div>
              <div className="text-sm font-medium">Actualización</div>
              <div className="text-xs text-muted-foreground">
                {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>

        {/* Lista de paradas en fullscreen */}
        {paradasData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-5 w-5" />
                Paradas Programadas ({paradasData.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paradasData.map((parada: any, index: number) => (
                  <div key={parada.id || index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-purple-700">{index + 1}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {parada.nombre || `Parada ${index + 1}`}
                      </div>
                      <div className="text-xs text-gray-600">{parada.direccion}</div>
                    </div>
                    <div className="flex-shrink-0">
                      {parada.completada ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header del mapa */}
      <Card className="flex-shrink-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <MapIcon className="h-5 w-5 text-primary" />
              Mapa de Ruta - {viaje.carta_porte_id}
              {enTiempoReal && (
                <Badge className="bg-success text-success-foreground animate-pulse">
                  EN VIVO
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              {enTiempoReal && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setMapaKey(prev => prev + 1);
                    setLastUpdate(new Date());
                  }}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setMapFullscreen(true)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Información de la ruta */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Navigation className="h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-medium">Distancia</div>
                <div className="text-lg font-bold text-primary">{distanciaTotal} km</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-secondary-foreground" />
              <div>
                <div className="text-sm font-medium">Paradas</div>
                <div className="text-lg font-bold text-secondary-foreground">{paradasData.length}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent-foreground" />
              <div>
                <div className="text-sm font-medium">Estado</div>
                <div className="text-lg font-bold text-accent-foreground capitalize">
                  {viaje.estado.replace('_', ' ')}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {enTiempoReal ? (
                <Truck className="h-4 w-4 text-success" />
              ) : (
                <MapPin className="h-4 w-4 text-muted-foreground" />
              )}
              <div>
                <div className="text-sm font-medium">Actualización</div>
                <div className="text-xs text-muted-foreground">
                  {lastUpdate.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>

          {/* Botón de Google Maps */}
          {googleMapsUrl && (
            <div className="mb-4">
              <Button 
                variant="outline" 
                className="w-full flex items-center gap-2"
                onClick={() => window.open(googleMapsUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
                Abrir ruta completa en Google Maps
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mapa principal */}
      <Card className="flex-1 min-h-0">
        <CardContent className="p-0 h-full">
          <div className="h-full w-full">
            <GoogleMapVisualization
              key={mapaKey}
              ubicaciones={ubicacionesParaMapa}
              routeData={{
                distance_km: distanciaTotal,
                duration_minutes: 420,
                google_data: {
                  polyline: 'route_with_waypoints',
                  bounds: ubicacionesParaMapa.length > 0 ? { 
                    north: Math.max(...ubicacionesParaMapa.map(u => u.coordenadas.latitud)),
                    south: Math.min(...ubicacionesParaMapa.map(u => u.coordenadas.latitud)),
                    east: Math.max(...ubicacionesParaMapa.map(u => u.coordenadas.longitud)),
                    west: Math.min(...ubicacionesParaMapa.map(u => u.coordenadas.longitud))
                  } : undefined,
                  legs: []
                }
              }}
              isVisible={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de paradas */}
      {paradasData.length > 0 && (
        <Card className="flex-shrink-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5" />
              Paradas Programadas ({paradasData.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paradasData.map((parada: any, index: number) => (
                <div key={parada.id || index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-700">{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {parada.nombre || `Parada ${index + 1}`}
                    </div>
                    <div className="text-xs text-gray-600">{parada.direccion}</div>
                  </div>
                  <div className="flex-shrink-0">
                    {parada.completada ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};