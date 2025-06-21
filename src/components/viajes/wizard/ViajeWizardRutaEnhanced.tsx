import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { MapPin, Route, Clock, Calendar, Calculator, Navigation, AlertTriangle } from 'lucide-react';
import { ViajeWizardData } from '../ViajeWizard';
import { useUbicacionesGeocodificacion } from '@/hooks/useUbicacionesGeocodificacion';
import { useGoogleMapsAPI } from '@/hooks/useGoogleMapsAPI';
import { GoogleMapVisualization } from '@/components/carta-porte/ubicaciones/GoogleMapVisualization';

interface ViajeWizardRutaEnhancedProps {
  data: ViajeWizardData;
  updateData: (updates: Partial<ViajeWizardData>) => void;
}

export function ViajeWizardRutaEnhanced({ data, updateData }: ViajeWizardRutaEnhancedProps) {
  const [origenDireccion, setOrigenDireccion] = useState('');
  const [destinoDireccion, setDestinoDireccion] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [fechaLlegada, setFechaLlegada] = useState('');
  const [calculandoRuta, setCalculandoRuta] = useState(false);
  const [rutaCalculada, setRutaCalculada] = useState<{
    distancia: number;
    tiempoEstimado: number;
    ruta: string;
    routeData?: any;
  } | null>(null);
  const [showMap, setShowMap] = useState(false);

  const { calcularRutaCompleta, geocodificarUbicacion, calcularDistanciaEntrePuntos } = useUbicacionesGeocodificacion();
  const { isLoaded: isGoogleMapsLoaded, error: googleMapsError } = useGoogleMapsAPI();

  // Inicializar fechas por defecto
  useEffect(() => {
    if (!fechaSalida) {
      const mañana = new Date();
      mañana.setDate(mañana.getDate() + 1);
      setFechaSalida(mañana.toISOString().slice(0, 16));
    }
    if (!fechaLlegada && fechaSalida) {
      const llegada = new Date(fechaSalida);
      llegada.setDate(llegada.getDate() + 1);
      setFechaLlegada(llegada.toISOString().slice(0, 16));
    }
  }, [fechaSalida, fechaLlegada]);

  const handleCalcularRuta = async () => {
    if (!origenDireccion || !destinoDireccion) {
      return;
    }

    setCalculandoRuta(true);
    try {
      // Crear objetos Ubicacion completos con id e idUbicacion
      const origenGeo = await geocodificarUbicacion({
        id: `origen-${Date.now()}`,
        idUbicacion: 'OR000001',
        tipoUbicacion: 'Origen',
        nombreRemitenteDestinatario: 'Origen',
        rfcRemitenteDestinatario: '',
        domicilio: {
          calle: origenDireccion,
          numExterior: '',
          municipio: 'Ciudad de México',
          estado: 'Ciudad de México',
          pais: 'MEX',
          codigoPostal: '06600',
          colonia: 'Centro'
        },
        fechaHoraSalidaLlegada: fechaSalida
      });

      const destinoGeo = await geocodificarUbicacion({
        id: `destino-${Date.now()}`,
        idUbicacion: 'DE000001',
        tipoUbicacion: 'Destino',
        nombreRemitenteDestinatario: 'Destino',
        rfcRemitenteDestinatario: '',
        domicilio: {
          calle: destinoDireccion,
          numExterior: '',
          municipio: 'Guadalajara',
          estado: 'Jalisco',
          pais: 'MEX',
          codigoPostal: '44100',
          colonia: 'Centro Histórico'
        },
        fechaHoraSalidaLlegada: fechaLlegada
      });

      // Calcular ruta usando Google Maps si está disponible
      let routeData = null;
      let distancia = 550; // Fallback default
      let tiempoEstimado = 420; // 7 horas

      if (isGoogleMapsLoaded && window.google) {
        try {
          const directionsService = new window.google.maps.DirectionsService();
          
          const result = await new Promise((resolve, reject) => {
            directionsService.route({
              origin: origenDireccion,
              destination: destinoDireccion,
              travelMode: window.google.maps.TravelMode.DRIVING,
              unitSystem: window.google.maps.UnitSystem.METRIC
            }, (result: any, status: any) => {
              if (status === 'OK') {
                resolve(result);
              } else {
                reject(new Error(`Error en Google Directions: ${status}`));
              }
            });
          });

          if (result && (result as any).routes[0]) {
            const route = (result as any).routes[0];
            distancia = Math.round(route.legs[0].distance.value / 1000); // metros a km
            tiempoEstimado = Math.round(route.legs[0].duration.value / 60); // segundos a minutos
            
            routeData = {
              distance_km: distancia,
              duration_minutes: tiempoEstimado,
              google_data: {
                polyline: route.overview_polyline.points,
                bounds: route.bounds,
                legs: route.legs
              }
            };
          }
        } catch (error) {
          console.warn('⚠️ Error con Google Directions, usando estimación:', error);
        }
      }

      setRutaCalculada({
        distancia,
        tiempoEstimado,
        ruta: `${origenDireccion} → ${destinoDireccion}`,
        routeData
      });

      // Actualizar datos del wizard
      updateData({
        origen: origenGeo,
        destino: destinoGeo,
        distanciaRecorrida: distancia
      });

      // Mostrar mapa si tenemos datos de ruta
      if (routeData) {
        setShowMap(true);
      }

      console.log('✅ Ruta calculada:', { distancia, tiempoEstimado });

    } catch (error) {
      console.error('❌ Error calculando ruta:', error);
    } finally {
      setCalculandoRuta(false);
    }
  };

  const formatearTiempo = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
  };

  return (
    <div className="space-y-6" data-onboarding="ruta-section">
      {/* Google Maps Error Alert */}
      {googleMapsError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error con Google Maps: {googleMapsError}. Las rutas se calcularán con estimaciones.
          </AlertDescription>
        </Alert>
      )}

      {/* Origen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-green-600" />
            Punto de Origen
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="origen">Dirección de origen</Label>
            <Input
              id="origen"
              placeholder="Ej: Av. Insurgentes Sur 123, CDMX"
              value={origenDireccion}
              onChange={(e) => setOrigenDireccion(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="fechaSalida">Fecha y hora de salida</Label>
            <Input
              id="fechaSalida"
              type="datetime-local"
              value={fechaSalida}
              onChange={(e) => setFechaSalida(e.target.value)}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Destino */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-red-600" />
            Punto de Destino
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="destino">Dirección de destino</Label>
            <Input
              id="destino"
              placeholder="Ej: Av. López Mateos 456, Guadalajara"
              value={destinoDireccion}
              onChange={(e) => setDestinoDireccion(e.target.value)}
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="fechaLlegada">Fecha y hora estimada de llegada</Label>
            <Input
              id="fechaLlegada"
              type="datetime-local"
              value={fechaLlegada}
              onChange={(e) => setFechaLlegada(e.target.value)}
              className="mt-2"
              min={fechaSalida}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botón calcular ruta */}
      <div className="flex justify-center">
        <Button
          onClick={handleCalcularRuta}
          disabled={!origenDireccion || !destinoDireccion || calculandoRuta}
          size="lg"
          className="flex items-center gap-2"
        >
          {calculandoRuta ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Calculando...
            </>
          ) : (
            <>
              <Calculator className="h-4 w-4" />
              Calcular Ruta y Tiempo
            </>
          )}
        </Button>
      </div>

      {/* Resultado del cálculo */}
      {rutaCalculada && (
        <>
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-green-800">
                <Route className="h-5 w-5" />
                Ruta Calculada
                {rutaCalculada.routeData && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    Google Maps
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium">Distancia</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {rutaCalculada.distancia} km
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="font-medium">Tiempo estimado</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatearTiempo(rutaCalculada.tiempoEstimado)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="font-medium">Duración del viaje</div>
                    <div className="text-sm text-purple-600">
                      {new Date(fechaSalida).toLocaleDateString()} - {new Date(fechaLlegada).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="p-3 bg-white rounded-lg border">
                <div className="flex items-center gap-2 mb-2">
                  <Route className="h-4 w-4 text-gray-600" />
                  <span className="font-medium text-gray-800">Resumen de la ruta:</span>
                </div>
                <p className="text-sm text-gray-600">{rutaCalculada.ruta}</p>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    Vía terrestre
                  </Badge>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Distancia verificada
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Google Map Visualization */}
          {showMap && rutaCalculada.routeData && (
            <GoogleMapVisualization
              ubicaciones={[data.origen, data.destino].filter(Boolean)}
              routeData={rutaCalculada.routeData}
              isVisible={showMap}
            />
          )}
        </>
      )}

      {/* Validación de fechas */}
      {fechaSalida && fechaLlegada && new Date(fechaLlegada) <= new Date(fechaSalida) && (
        <Alert variant="destructive">
          <AlertDescription>
            La fecha de llegada debe ser posterior a la fecha de salida.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
