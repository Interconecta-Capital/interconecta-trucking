import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { MapPin, Route, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { useRutasPrecisas } from '@/hooks/useRutasPrecisas';
import { useGoogleMapsAPI } from '@/hooks/useGoogleMapsAPI';
import { GoogleMapVisualization } from '@/components/carta-porte/ubicaciones/GoogleMapVisualization';
import { toast } from 'sonner';

interface CotizacionRouteProps {
  formData: any;
  updateFormData: (updates: any) => void;
}

export function CotizacionRoute({ formData, updateFormData }: CotizacionRouteProps) {
  const [origenDireccion, setOrigenDireccion] = useState('');
  const [destinoDireccion, setDestinoDireccion] = useState('');
  const [showMap, setShowMap] = useState(false);
  
  const {
    calculandoRuta,
    rutaActual,
    error: errorRuta,
    calcularRutaOptimizada,
    tieneRutaValida
  } = useRutasPrecisas();
  
  const { isLoaded: mapsLoaded, error: googleMapsError } = useGoogleMapsAPI();

  // Cargar datos existentes
  useEffect(() => {
    if (formData.origen) {
      setOrigenDireccion(formData.origen);
    }
    if (formData.destino) {
      setDestinoDireccion(formData.destino);
    }
  }, [formData.origen, formData.destino]);

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
          evitarAutopistas: false
        }
      );

      if (rutaCalculada) {
        // Actualizar formData con la ruta calculada
        updateFormData({
          origen: origenDireccion,
          destino: destinoDireccion,
          distancia_total: rutaCalculada.distanciaKm,
          tiempo_estimado: rutaCalculada.tiempoEstimadoMinutos,
          mapa_datos: {
            origen: rutaCalculada.origen,
            destino: rutaCalculada.destino,
            routeData: rutaCalculada.rutaOptimizada
          }
        });

        setShowMap(true);
        
        toast.success(`Ruta calculada: ${rutaCalculada.distanciaKm} km - ${Math.round(rutaCalculada.tiempoEstimadoMinutos / 60)}h ${rutaCalculada.tiempoEstimadoMinutos % 60}m`);
        
        console.log('✅ Ruta calculada exitosamente:', {
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

  return (
    <div className="space-y-6">
      {/* Mostrar errores de Google Maps */}
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
            {rutaActual?.origen?.validadaGoogleMaps && (
              <Badge variant="outline" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Validado
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="origen">Dirección de origen</Label>
            <Input
              id="origen"
              placeholder="Ej: Av. Insurgentes Sur 123, CDMX"
              value={origenDireccion}
              onChange={(e) => setOrigenDireccion(e.target.value)}
              className="mt-2"
            />
            {rutaActual?.origen?.precision && (
              <div className="mt-1 text-xs text-gray-600">
                Precisión: {rutaActual.origen.precision} • CP: {rutaActual.origen.codigoPostal}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Destino */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-red-600" />
            Punto de Destino
            {rutaActual?.destino?.validadaGoogleMaps && (
              <Badge variant="outline" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Validado
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="destino">Dirección de destino</Label>
            <Input
              id="destino"
              placeholder="Ej: Av. López Mateos 456, Guadalajara"
              value={destinoDireccion}
              onChange={(e) => setDestinoDireccion(e.target.value)}
              className="mt-2"
            />
            {rutaActual?.destino?.precision && (
              <div className="mt-1 text-xs text-gray-600">
                Precisión: {rutaActual.destino.precision} • CP: {rutaActual.destino.codigoPostal}
              </div>
            )}
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
              Calculando ruta...
            </>
          ) : (
            <>
              <Route className="h-4 w-4" />
              Calcular Ruta
            </>
          )}
        </Button>
      </div>

      {/* Información de la ruta calculada */}
      {rutaActual && tieneRutaValida && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="h-5 w-5 text-blue-600" />
              Información de la Ruta
              <Badge variant="outline" className="bg-blue-100 text-blue-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Calculada
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {rutaActual.distanciaKm} km
                </div>
                <div className="text-sm text-gray-600">Distancia Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatearTiempo(rutaActual.tiempoEstimadoMinutos)}
                </div>
                <div className="text-sm text-gray-600">Tiempo Estimado</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {rutaActual.origen?.nombre || origenDireccion}
                </div>
                <div className="text-sm text-gray-600">Origen</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {rutaActual.destino?.nombre || destinoDireccion}
                </div>
                <div className="text-sm text-gray-600">Destino</div>
              </div>
            </div>

            {/* Mostrar precisión de la ruta */}
            {rutaActual.precision && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Precisión: {rutaActual.precision}%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Mapa de la ruta */}
      {showMap && rutaActual && mapsLoaded && formData.mapa_datos && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Visualización de la Ruta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 w-full rounded-lg overflow-hidden">
              <GoogleMapVisualization
                ubicaciones={[
                  {
                    lat: formData.mapa_datos.origen?.coordenadas?.lat || 0,
                    lng: formData.mapa_datos.origen?.coordenadas?.lng || 0,
                    nombre: formData.mapa_datos.origen?.nombre || origenDireccion,
                    tipo: 'origen'
                  },
                  {
                    lat: formData.mapa_datos.destino?.coordenadas?.lat || 0,
                    lng: formData.mapa_datos.destino?.coordenadas?.lng || 0,
                    nombre: formData.mapa_datos.destino?.nombre || destinoDireccion,
                    tipo: 'destino'
                  }
                ]}
                routeData={formData.mapa_datos.routeData}
                isVisible={true}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}