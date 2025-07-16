import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Route, Clock, Calculator, Navigation, AlertTriangle, CheckCircle, Plus, X, ExternalLink } from 'lucide-react';
import { useRutasPrecisas } from '@/hooks/useRutasPrecisas';
import { useGoogleMapsAPI } from '@/hooks/useGoogleMapsAPI';
import { useRutaConParadas, ParadaAutorizada } from '@/hooks/useRutaConParadas';
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
  const [nuevaParada, setNuevaParada] = useState('');
  const [rutaConParadas, setRutaConParadas] = useState<any>(null);
  
  const {
    calculandoRuta,
    rutaActual,
    error: errorRuta,
    calcularRutaOptimizada,
    tieneRutaValida
  } = useRutasPrecisas();

  const {
    calcularRutaCompleta,
    calculando: calculandoParadas,
    error: errorParadas
  } = useRutaConParadas();
  
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
      // Si hay paradas, usar el sistema con paradas
      if (formData.tieneParadasAutorizadas && formData.ubicaciones_intermedias?.length > 0) {
        const paradasParaCalculo: ParadaAutorizada[] = formData.ubicaciones_intermedias.map((parada, index) => ({
          id: parada.id,
          direccion: parada.direccion,
          tiempoServicio: 30,
          orden: parada.orden || index + 1,
          tipo: 'carga',
          obligatoria: true,
          nombre: parada.nombre
        }));

        console.log('🛣️ Calculando ruta con paradas:', paradasParaCalculo.length);
        
        const rutaCompleta = await calcularRutaCompleta(
          origenDireccion,
          destinoDireccion,
          paradasParaCalculo
        );

        if (rutaCompleta) {
          setRutaConParadas(rutaCompleta);
          
          updateFormData({
            origen: origenDireccion,
            destino: destinoDireccion,
            distancia_total: rutaCompleta.distanciaTotal,
            tiempo_estimado: rutaCompleta.tiempoTotal,
            mapa_datos: {
              origen: rutaCompleta.origen,
              destino: rutaCompleta.destino,
              paradas: rutaCompleta.paradas,
              routeData: rutaCompleta.rutaOptimizada
            }
          });

          setShowMap(true);
          toast.success(`Ruta calculada con ${rutaCompleta.paradas.length} paradas - ${rutaCompleta.distanciaTotal} km`);
          return;
        }
      }

      // Fallback al sistema original
      const rutaCalculada = await calcularRutaOptimizada(
        origenDireccion,
        destinoDireccion,
        {
          evitarPeajes: false,
          evitarAutopistas: false
        }
      );

      if (rutaCalculada) {
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
        toast.success(`Ruta calculada: ${rutaCalculada.distanciaKm} km - ${formatearTiempo(rutaCalculada.tiempoEstimadoMinutos)}`);
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

  const handleTieneParadasChange = (checked: boolean) => {
    updateFormData({ 
      tieneParadasAutorizadas: checked,
      ubicaciones_intermedias: checked ? formData.ubicaciones_intermedias || [] : []
    });
  };

  const agregarParada = async () => {
    if (!nuevaParada.trim()) {
      toast.error('Ingresa una dirección para la parada');
      return;
    }

    const nuevaParadaObj = {
      id: crypto.randomUUID(),
      nombre: `Parada ${(formData.ubicaciones_intermedias?.length || 0) + 1}`,
      direccion: nuevaParada.trim(),
      orden: (formData.ubicaciones_intermedias?.length || 0) + 1
    };

    const paradasActualizadas = [...(formData.ubicaciones_intermedias || []), nuevaParadaObj];
    
    updateFormData({
      ubicaciones_intermedias: paradasActualizadas
    });

    setNuevaParada('');
    toast.success(`Parada agregada: ${nuevaParadaObj.direccion}`);
    
    if (origenDireccion && destinoDireccion) {
      setTimeout(() => {
        calcularRuta();
      }, 500);
    }
  };

  const eliminarParada = (id: string) => {
    updateFormData({
      ubicaciones_intermedias: formData.ubicaciones_intermedias?.filter(p => p.id !== id)
    });
    toast.success('Parada eliminada');
  };

  const abrirEnGoogleMaps = () => {
    if (!formData.mapa_datos?.origen && !formData.mapa_datos?.destino) {
      toast.error('Primero calcula la ruta');
      return;
    }

    let url = 'https://www.google.com/maps/dir/';
    url += encodeURIComponent(origenDireccion);
    
    if (formData.ubicaciones_intermedias?.length > 0) {
      formData.ubicaciones_intermedias.forEach(parada => {
        url += '/' + encodeURIComponent(parada.direccion);
      });
    }
    
    url += '/' + encodeURIComponent(destinoDireccion);
    
    window.open(url, '_blank');
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
      {(errorRuta || errorParadas) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {errorRuta || errorParadas}
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

      {/* Paradas autorizadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Route className="h-5 w-5 text-purple-600" />
            Paradas Autorizadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tieneParadas"
              checked={formData.tieneParadasAutorizadas || false}
              onCheckedChange={handleTieneParadasChange}
            />
            <Label htmlFor="tieneParadas" className="font-medium">
              Esta cotización incluye paradas intermedias
            </Label>
          </div>

          {formData.tieneParadasAutorizadas && (
            <div className="space-y-4 border-l-4 border-purple-200 pl-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ej: Centro de Distribución Querétaro"
                  value={nuevaParada}
                  onChange={(e) => setNuevaParada(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && agregarParada()}
                />
                <Button onClick={agregarParada} size="sm">
                  <Plus className="h-4 w-4" />
                  Agregar
                </Button>
              </div>

              {formData.ubicaciones_intermedias && formData.ubicaciones_intermedias.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Paradas programadas ({formData.ubicaciones_intermedias.length})
                  </Label>
                  {formData.ubicaciones_intermedias.map((parada) => (
                    <div key={parada.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{parada.nombre}</div>
                        <div className="text-xs text-gray-600">{parada.direccion}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarParada(parada.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botón calcular ruta */}
      <div className="flex justify-center">
        <div className="flex gap-4">
          <Button
            onClick={calcularRuta}
            disabled={!origenDireccion || !destinoDireccion || calculandoRuta || calculandoParadas}
            size="lg"
            className="flex items-center gap-2"
          >
            {(calculandoRuta || calculandoParadas) ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {formData.tieneParadasAutorizadas && formData.ubicaciones_intermedias?.length > 0 
                  ? 'Calculando ruta con paradas...' 
                  : 'Calculando ruta...'}
              </>
            ) : (
              <>
                <Route className="h-4 w-4" />
                Calcular Ruta
              </>
            )}
          </Button>

          {(rutaActual && tieneRutaValida) || rutaConParadas ? (
            <Button
              variant="outline"
              onClick={abrirEnGoogleMaps}
              size="lg"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Ver en Google Maps
            </Button>
          ) : null}
        </div>
      </div>

      {/* Información de la ruta calculada */}
      {((rutaActual && tieneRutaValida) || rutaConParadas) && (
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
                  {rutaConParadas ? rutaConParadas.distanciaTotal : rutaActual.distanciaKm} km
                </div>
                <div className="text-sm text-gray-600">Distancia Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {rutaConParadas ? formatearTiempo(rutaConParadas.tiempoTotal) : formatearTiempo(rutaActual.tiempoEstimadoMinutos)}
                </div>
                <div className="text-sm text-gray-600">Tiempo Estimado</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">
                  {rutaActual?.origen?.nombre || origenDireccion}
                </div>
                <div className="text-sm text-gray-600">Origen</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">
                  {rutaActual?.destino?.nombre || destinoDireccion}
                </div>
                <div className="text-sm text-gray-600">Destino</div>
              </div>
            </div>

            {/* Mostrar información de paradas si existen */}
            {rutaConParadas && rutaConParadas.paradas?.length > 0 && (
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-sm mb-2">
                  <Route className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Paradas Intermedias: {rutaConParadas.paradas.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {rutaConParadas.paradas.map((parada, index) => (
                    <div key={parada.id} className="bg-white p-2 rounded">
                      <span className="font-medium">{index + 1}. {parada.nombre}</span>
                      <div className="text-gray-600 truncate">{parada.direccion}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mostrar precisión de la ruta */}
            {rutaActual?.precision && (
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
      {showMap && mapsLoaded && formData.mapa_datos && (
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
                ubicaciones={(() => {
                  const ubicaciones = [
                    {
                      lat: formData.mapa_datos.origen?.coordenadas?.lat || formData.mapa_datos.origen?.lat || 0,
                      lng: formData.mapa_datos.origen?.coordenadas?.lng || formData.mapa_datos.origen?.lng || 0,
                      nombre: formData.mapa_datos.origen?.nombre || origenDireccion,
                      tipo: 'origen'
                    }
                  ];

                  // Agregar paradas si existen
                  if (formData.mapa_datos.paradas?.length > 0) {
                    formData.mapa_datos.paradas.forEach((parada, index) => {
                      ubicaciones.push({
                        lat: parada.coordenadas?.lat || 0,
                        lng: parada.coordenadas?.lng || 0,
                        nombre: parada.nombre || `Parada ${index + 1}`,
                        tipo: 'parada'
                      });
                    });
                  }

                  ubicaciones.push({
                    lat: formData.mapa_datos.destino?.coordenadas?.lat || formData.mapa_datos.destino?.lat || 0,
                    lng: formData.mapa_datos.destino?.coordenadas?.lng || formData.mapa_datos.destino?.lng || 0,
                    nombre: formData.mapa_datos.destino?.nombre || destinoDireccion,
                    tipo: 'destino'
                  });

                  return ubicaciones;
                })()}
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