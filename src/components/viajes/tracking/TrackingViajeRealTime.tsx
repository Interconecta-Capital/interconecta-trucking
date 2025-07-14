import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Route, 
  Truck,
  User,
  Package,
  AlertTriangle,
  CheckCircle,
  Maximize2,
  ExternalLink
} from 'lucide-react';
import { Viaje, EventoViaje, useViajesEstados } from '@/hooks/useViajesEstados';
import { GoogleMapVisualization } from '@/components/carta-porte/ubicaciones/GoogleMapVisualization';
import { Ubicacion } from '@/types/ubicaciones';

interface TrackingViajeRealTimeProps {
  viaje: Viaje;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const TrackingViajeRealTime: React.FC<TrackingViajeRealTimeProps> = ({
  viaje,
  isFullscreen = false,
  onToggleFullscreen
}) => {
  const [eventos, setEventos] = useState<EventoViaje[]>([]);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [progreso, setProgreso] = useState(0);

  const { obtenerEventosViaje } = useViajesEstados();

  useEffect(() => {
    cargarEventosViaje();
    calcularProgreso();
    
    // Simular actualización cada 30 segundos
    const interval = setInterval(() => {
      cargarEventosViaje();
      actualizarTrackingSimulado();
    }, 30000);

    return () => clearInterval(interval);
  }, [viaje.id]);

  const cargarEventosViaje = async () => {
    try {
      const eventosData = await obtenerEventosViaje(viaje.id);
      setEventos(eventosData);
    } catch (error) {
      console.error('Error cargando eventos:', error);
    }
  };

  const calcularProgreso = () => {
    switch (viaje.estado) {
      case 'programado':
        setProgreso(10);
        break;
      case 'en_transito':
        // Calcular progreso basado en tiempo transcurrido
        if (viaje.fecha_inicio_real && viaje.fecha_fin_programada) {
          const inicio = new Date(viaje.fecha_inicio_real).getTime();
          const fin = new Date(viaje.fecha_fin_programada).getTime();
          const ahora = new Date().getTime();
          const tiempoTotal = fin - inicio;
          const tiempoTranscurrido = ahora - inicio;
          const progresoCalculado = Math.min(Math.max((tiempoTranscurrido / tiempoTotal) * 100, 20), 95);
          setProgreso(progresoCalculado);
        } else {
          setProgreso(50);
        }
        break;
      case 'completado':
        setProgreso(100);
        break;
      case 'cancelado':
        setProgreso(0);
        break;
      case 'retrasado':
        setProgreso(35);
        break;
      default:
        setProgreso(0);
    }
  };

  const actualizarTrackingSimulado = () => {
    // Simular datos de tracking en tiempo real
    const datosSimulados = {
      ubicacionActual: generateRandomLocation(),
      velocidad: Math.floor(Math.random() * 40) + 60, // 60-100 km/h
      ultimaActualizacion: new Date().toLocaleTimeString(),
      coordenadas: {
        lat: 19.4326 + (Math.random() - 0.5) * 0.1,
        lng: -99.1332 + (Math.random() - 0.5) * 0.1
      },
      tiempoEstimadoLlegada: calcularETA()
    };
    
    setTrackingData(datosSimulados);
  };

  const generateRandomLocation = () => {
    const ubicaciones = [
      "Carretera México-Guadalajara, Km 125",
      "Autopista Siglo XXI, Km 89",
      "Carretera Federal 15, Km 234",
      "Libramiento Sur, Morelia",
      "Caseta de peaje Irapuato"
    ];
    return ubicaciones[Math.floor(Math.random() * ubicaciones.length)];
  };

  const calcularETA = () => {
    if (viaje.fecha_fin_programada) {
      const eta = new Date(viaje.fecha_fin_programada);
      // Agregar variación aleatoria de ±2 horas
      eta.setHours(eta.getHours() + (Math.random() - 0.5) * 4);
      return eta.toLocaleString();
    }
    return 'No calculado';
  };

  const getStatusColor = () => {
    switch (viaje.estado) {
      case 'en_transito': return 'bg-green-500';
      case 'retrasado': return 'bg-orange-500';
      case 'completado': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (viaje.estado) {
      case 'en_transito': return <Truck className="h-5 w-5" />;
      case 'retrasado': return <AlertTriangle className="h-5 w-5" />;
      case 'completado': return <CheckCircle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  // Extraer datos reales del tracking_data del viaje
  const trackingRealData = viaje.tracking_data || {};
  const origenData = trackingRealData.origen || {};
  const destinoData = trackingRealData.destino || {};
  
  // Generar enlace de Google Maps
  const generateGoogleMapsLink = () => {
    const origenDir = origenData.direccion || viaje.origen;
    const destinoDir = destinoData.direccion || viaje.destino;
    if (!origenDir || !destinoDir) return null;
    const baseUrl = 'https://www.google.com/maps/dir/';
    const origenEncoded = encodeURIComponent(origenDir);
    const destinoEncoded = encodeURIComponent(destinoDir);
    return `${baseUrl}${origenEncoded}/${destinoEncoded}`;
  };

  const googleMapsUrl = generateGoogleMapsLink();

  // Fix the ubicaciones type to match Ubicacion interface with real data
  const ubicacionesParaMapa: Ubicacion[] = [
    {
      id: 'origen',
      idUbicacion: 'origen-001',
      tipoUbicacion: 'Origen',
      nombreRemitenteDestinatario: 'Origen',
      domicilio: { 
        calle: origenData.direccion || viaje.origen || 'Origen no especificado',
        pais: 'MEX',
        codigoPostal: origenData.codigoPostal || '01000',
        estado: origenData.estado || 'CDMX',
        municipio: origenData.municipio || 'Miguel Hidalgo',
        colonia: origenData.colonia || 'Centro'
      },
      coordenadas: { 
        latitud: origenData.coordenadas?.latitud || 19.4326, 
        longitud: origenData.coordenadas?.longitud || -99.1332 
      }
    },
    // Agregar paradas autorizadas al mapa
    ...(trackingRealData.paradasAutorizadas || []).map((parada: any, index: number) => ({
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
        latitud: parada.coordenadas?.latitud || 19.5, 
        longitud: parada.coordenadas?.longitud || -100.0 
      }
    })),
    {
      id: 'destino',
      idUbicacion: 'destino-001',
      tipoUbicacion: 'Destino',
      nombreRemitenteDestinatario: 'Destino',
      domicilio: { 
        calle: destinoData.direccion || viaje.destino || 'Destino no especificado',
        pais: 'MEX',
        codigoPostal: destinoData.codigoPostal || '44100',
        estado: destinoData.estado || 'JAL',
        municipio: destinoData.municipio || 'Guadalajara',
        colonia: destinoData.colonia || 'Centro'
      },
      coordenadas: { 
        latitud: destinoData.coordenadas?.latitud || 19.6924, 
        longitud: destinoData.coordenadas?.longitud || -101.2055 
      }
    }
  ];

  // Si hay tracking data, agregar ubicación actual
  if (trackingData?.coordenadas) {
    ubicacionesParaMapa.push({
      id: 'actual',
      idUbicacion: 'actual-001',
      tipoUbicacion: 'Paso Intermedio',
      nombreRemitenteDestinatario: 'Posición actual',
      domicilio: { 
        calle: trackingData.ubicacionActual || 'En tránsito',
        pais: 'MEX',
        codigoPostal: '50000',
        estado: 'MEX',
        municipio: 'Toluca',
        colonia: 'Centro'
      },
      coordenadas: { 
        latitud: trackingData.coordenadas.lat, 
        longitud: trackingData.coordenadas.lng 
      }
    });
  }

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-4 z-50 bg-white p-6 overflow-y-auto' : ''}`}>
      {/* Header con estado */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              {getStatusIcon()}
              Tracking - {viaje.carta_porte_id}
              <Badge className={`${getStatusColor()} text-white`}>
                {viaje.estado.replace('_', ' ').toUpperCase()}
              </Badge>
            </CardTitle>
            {onToggleFullscreen && (
              <Button variant="outline" size="sm" onClick={onToggleFullscreen}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Barra de progreso */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progreso del viaje</span>
                <span className="text-sm text-muted-foreground">{Math.round(progreso)}%</span>
              </div>
              <Progress value={progreso} className="w-full" />
            </div>

            {/* Información de ruta */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                 <div className="flex items-center gap-2">
                   <MapPin className="h-4 w-4 text-green-600" />
                   <span className="font-medium">Origen:</span>
                   <span className="text-sm">{origenData.direccion || viaje.origen || 'No especificado'}</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <MapPin className="h-4 w-4 text-red-600" />
                   <span className="font-medium">Destino:</span>
                   <span className="text-sm">{destinoData.direccion || viaje.destino || 'No especificado'}</span>
                 </div>
                 {trackingData && (
                   <div className="flex items-center gap-2">
                     <Navigation className="h-4 w-4 text-blue-600" />
                     <span className="font-medium">Ubicación actual:</span>
                     <span className="text-sm">{trackingData.ubicacionActual}</span>
                   </div>
                 )}
                 
                 {/* Botón de Google Maps */}
                 {googleMapsUrl && (
                   <div className="pt-2 border-t">
                     <Button 
                       variant="outline" 
                       size="sm"
                       onClick={() => window.open(googleMapsUrl, '_blank')}
                       className="w-full flex items-center gap-2"
                     >
                       <ExternalLink className="h-4 w-4" />
                       Ver ruta en Google Maps
                     </Button>
                   </div>
                 )}
              </div>

              <div className="space-y-2">
                {trackingData && (
                  <>
                    <div className="flex items-center gap-2">
                      <Route className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">Velocidad:</span>
                      <span className="text-sm">{trackingData.velocidad} km/h</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="font-medium">ETA:</span>
                      <span className="text-sm">{trackingData.tiempoEstimadoLlegada}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">Última actualización:</span>
                      <span className="text-sm">{trackingData.ultimaActualizacion}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mapa en tiempo real */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Visualización en Tiempo Real
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={isFullscreen ? 'h-96' : 'h-80'}>
            <GoogleMapVisualization
              ubicaciones={ubicacionesParaMapa}
              routeData={trackingRealData.rutaCalculada ? {
                distance_km: trackingRealData.rutaCalculada.distanciaKm || trackingRealData.distanciaRecorrida || 550,
                duration_minutes: trackingRealData.rutaCalculada.tiempoEstimadoMinutos || 420,
                google_data: trackingRealData.rutaCalculada.rutaOptimizada || {
                  polyline: 'route_data_not_available',
                  bounds: { 
                    north: Math.max(origenData.coordenadas?.latitud || 19.4326, destinoData.coordenadas?.latitud || 19.6924),
                    south: Math.min(origenData.coordenadas?.latitud || 19.4326, destinoData.coordenadas?.latitud || 19.6924),
                    east: Math.max(origenData.coordenadas?.longitud || -99.1332, destinoData.coordenadas?.longitud || -101.2055),
                    west: Math.min(origenData.coordenadas?.longitud || -99.1332, destinoData.coordenadas?.longitud || -101.2055)
                  },
                  legs: []
                }
              } : {
                distance_km: trackingRealData.distanciaRecorrida || 550,
                duration_minutes: 420,
                google_data: {
                  polyline: 'route_estimation_mode',
                  bounds: { 
                    north: Math.max(origenData.coordenadas?.latitud || 19.4326, destinoData.coordenadas?.latitud || 19.6924),
                    south: Math.min(origenData.coordenadas?.latitud || 19.4326, destinoData.coordenadas?.latitud || 19.6924),
                    east: Math.max(origenData.coordenadas?.longitud || -99.1332, destinoData.coordenadas?.longitud || -101.2055),
                    west: Math.min(origenData.coordenadas?.longitud || -99.1332, destinoData.coordenadas?.longitud || -101.2055)
                  },
                  legs: []
                }
              }}
              isVisible={true}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detalles del viaje */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información del transporte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Información del Transporte
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {viaje.vehiculo_id && (
              <div>
                <span className="font-medium">Vehículo:</span>
                <p className="text-sm text-muted-foreground">ID: {viaje.vehiculo_id}</p>
              </div>
            )}
            {viaje.conductor_id && (
              <div>
                <span className="font-medium">Conductor:</span>
                <p className="text-sm text-muted-foreground">ID: {viaje.conductor_id}</p>
              </div>
            )}
            <div>
              <span className="font-medium">Fecha inicio programada:</span>
              <p className="text-sm text-muted-foreground">
                {new Date(viaje.fecha_inicio_programada).toLocaleString()}
              </p>
            </div>
            {viaje.fecha_inicio_real && (
              <div>
                <span className="font-medium">Fecha inicio real:</span>
                <p className="text-sm text-muted-foreground">
                  {new Date(viaje.fecha_inicio_real).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Eventos recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Eventos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {eventos.slice(0, 5).map((evento) => (
                <div key={evento.id} className="flex items-start gap-3 p-2 border rounded">
                  <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{evento.descripcion}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(evento.timestamp).toLocaleString()}
                    </p>
                    {evento.ubicacion && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {evento.ubicacion}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              
              {eventos.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  No hay eventos registrados
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas del viaje */}
      {viaje.estado === 'retrasado' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Este viaje presenta retrasos. Contacta al conductor para más información.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
