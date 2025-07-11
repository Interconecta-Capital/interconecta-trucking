import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { MapPin, Route, Clock, Calendar, Calculator, Navigation, AlertTriangle, CheckCircle } from 'lucide-react';
import { ViajeWizardData } from '../ViajeWizard';
import { useUbicacionesGeocodificacion } from '@/hooks/useUbicacionesGeocodificacion';
import { useGoogleMapsAPI } from '@/hooks/useGoogleMapsAPI';
import { useRutasPrecisas } from '@/hooks/useRutasPrecisas';
import { GoogleMapVisualization } from '@/components/carta-porte/ubicaciones/GoogleMapVisualization';
import { toast } from 'sonner';

interface ViajeWizardRutaEnhancedProps {
  data: ViajeWizardData;
  updateData: (updates: Partial<ViajeWizardData>) => void;
}

export function ViajeWizardRutaEnhanced({ data, updateData }: ViajeWizardRutaEnhancedProps) {
  const [origenDireccion, setOrigenDireccion] = useState('');
  const [destinoDireccion, setDestinoDireccion] = useState('');
  const [fechaSalida, setFechaSalida] = useState('');
  const [fechaLlegada, setFechaLlegada] = useState('');
  const [showMap, setShowMap] = useState(false);
  
  // Hooks para manejo de rutas precisas
  const {
    calculandoRuta,
    rutaActual,
    error: errorRuta,
    calcularRutaOptimizada,
    tieneRutaValida,
    precisenEsAlta
  } = useRutasPrecisas();
  
  const { isLoaded: mapsLoaded, error: googleMapsError } = useGoogleMapsAPI();

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

  // Cargar datos existentes del wizard
  useEffect(() => {
    if (data.origen?.direccion) {
      setOrigenDireccion(data.origen.direccion);
    }
    if (data.destino?.direccion) {
      setDestinoDireccion(data.destino.direccion);
    }
    if (data.origen?.fechaHoraSalidaLlegada) {
      setFechaSalida(new Date(data.origen.fechaHoraSalidaLlegada).toISOString().slice(0, 16));
    }
    if (data.destino?.fechaHoraSalidaLlegada) {
      setFechaLlegada(new Date(data.destino.fechaHoraSalidaLlegada).toISOString().slice(0, 16));
    }
  }, [data.origen, data.destino]);

  // Calcular ruta automáticamente cuando se tienen origen y destino
  const calcularRuta = async () => {
    if (!origenDireccion || !destinoDireccion) {
      toast.error('Debes especificar origen y destino');
      return;
    }

    try {
      const rutaCalculada = await calcularRutaOptimizada(
        origenDireccion,
        destinoDireccion,
        {
          evitarPeajes: false,
          evitarAutopistas: false,
          vehiculo: data.vehiculo ? {
            tipo: data.vehiculo.tipo_carroceria || 'C2',
            rendimiento: data.vehiculo.rendimiento || 8
          } : undefined
        }
      );

      if (rutaCalculada) {
        // Actualizar datos del wizard con información precisa
        updateData({
          origen: {
            nombre: rutaCalculada.origen.nombre,
            direccion: rutaCalculada.origen.direccion,
            coordenadas: rutaCalculada.origen.coordenadas,
            codigoPostal: rutaCalculada.origen.codigoPostal,
            fechaHoraSalidaLlegada: fechaSalida || new Date().toISOString(),
            precision: rutaCalculada.origen.precision,
            validadaGoogleMaps: rutaCalculada.origen.validadaGoogleMaps
          },
          destino: {
            nombre: rutaCalculada.destino.nombre,
            direccion: rutaCalculada.destino.direccion,
            coordenadas: rutaCalculada.destino.coordenadas,
            codigoPostal: rutaCalculada.destino.codigoPostal,
            fechaHoraSalidaLlegada: fechaLlegada || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            precision: rutaCalculada.destino.precision,
            validadaGoogleMaps: rutaCalculada.destino.validadaGoogleMaps
          },
          distanciaRecorrida: rutaCalculada.distanciaKm
        });

        setShowMap(true);
        
        console.log('✅ Datos de ruta actualizados en wizard:', {
          distancia: rutaCalculada.distanciaKm,
          tiempo: rutaCalculada.tiempoEstimadoMinutos,
          precision: rutaCalculada.precision
        });
      }
      
    } catch (error) {
      console.error('Error calculando ruta:', error);
      toast.error('Error calculando la ruta. Intenta con direcciones más específicas.');
    }
  };

  const formatearTiempo = (minutos: number) => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
  };

  const formatearCosto = (costo: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(costo);
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

      {/* Error de ruta */}
      {errorRuta && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {errorRuta}
          </AlertDescription>
        </Alert>
      )}

      {/* Origen */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-green-600" />
            Punto de Origen
            {data.origen?.validadaGoogleMaps && (
              <Badge variant="outline" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Validado
              </Badge>
            )}
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
            {data.origen?.precision && (
              <div className="mt-1 text-xs text-gray-600">
                Precisión: {data.origen.precision} • CP: {data.origen.codigoPostal}
              </div>
            )}
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
            {data.destino?.validadaGoogleMaps && (
              <Badge variant="outline" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Validado
              </Badge>
            )}
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
            {data.destino?.precision && (
              <div className="mt-1 text-xs text-gray-600">
                Precisión: {data.destino.precision} • CP: {data.destino.codigoPostal}
              </div>
            )}
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
          onClick={calcularRuta}
          disabled={!origenDireccion || !destinoDireccion || calculandoRuta}
          size="lg"
          className="flex items-center gap-2"
        >
          {calculandoRuta ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Calculando ruta optimizada...
            </>
          ) : (
            <>
              <Calculator className="h-4 w-4" />
              Calcular Ruta Optimizada
            </>
          )}
        </Button>
      </div>

      {/* Resultado del cálculo */}
      {rutaActual && (
        <>
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-green-800">
                <Route className="h-5 w-5" />
                Ruta Calculada
                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                  Google Maps
                </Badge>
                {precisenEsAlta && (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Alta Precisión
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium">Distancia</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {rutaActual.distanciaKm} km
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="font-medium">Tiempo estimado</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {formatearTiempo(rutaActual.tiempoEstimadoMinutos)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="font-medium">Combustible</div>
                    <div className="text-lg font-bold text-purple-600">
                      {formatearCosto(rutaActual.costoCombustible)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium">Precisión</div>
                    <div className="text-lg font-bold text-green-600">
                      {rutaActual.precision}%
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
                <p className="text-sm text-gray-600 mb-2">
                  {rutaActual.origen.nombre} → {rutaActual.destino.nombre}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>Peajes estimados: {formatearCosto(rutaActual.peajes)}</div>
                  <div>Costo total estimado: {formatearCosto(rutaActual.costoCombustible + rutaActual.peajes)}</div>
                </div>
                <div className="mt-2 flex gap-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    Vía terrestre
                  </Badge>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Distancia verificada
                  </Badge>
                  {precisenEsAlta && (
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                      Optimizada
                    </Badge>
                  )}
                </div>
              </div>

              {/* Costos detallados */}
              {rutaActual.costoCombustible > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg border">
                  <div className="text-sm font-medium text-blue-800 mb-2">💰 Desglose de costos estimados:</div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Combustible: <span className="font-bold">{formatearCosto(rutaActual.costoCombustible)}</span></div>
                    <div>Peajes: <span className="font-bold">{formatearCosto(rutaActual.peajes)}</span></div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-blue-200">
                    <div className="font-bold">Total estimado: {formatearCosto(rutaActual.costoCombustible + rutaActual.peajes)}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Google Map Visualization */}
          {showMap && data.origen && data.destino && (
            <GoogleMapVisualization
              ubicaciones={[data.origen, data.destino]}
              routeData={rutaActual.rutaOptimizada}
              isVisible={showMap}
            />
          )}
        </>
      )}

      {/* Validación de fechas */}
      {fechaSalida && fechaLlegada && new Date(fechaLlegada) <= new Date(fechaSalida) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            La fecha de llegada debe ser posterior a la fecha de salida.
          </AlertDescription>
        </Alert>
      )}

      {/* Indicadores de estado */}
      {tieneRutaValida && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✅ Ruta validada y lista para continuar. La información será incluida automáticamente en la carta porte.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}