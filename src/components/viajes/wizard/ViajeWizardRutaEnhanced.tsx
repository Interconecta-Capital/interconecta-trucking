import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Route, Clock, Calendar, Calculator, Navigation, AlertTriangle, CheckCircle, Plus, X } from 'lucide-react';
import { ViajeWizardData } from '../ViajeWizard';
import { useUbicacionesGeocodificacion } from '@/hooks/useUbicacionesGeocodificacion';
import { useGoogleMapsAPI } from '@/hooks/useGoogleMapsAPI';
import { useRutasPrecisas } from '@/hooks/useRutasPrecisas';
import { useRutaConParadas, ParadaAutorizada } from '@/hooks/useRutaConParadas';
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
  const [nuevaParada, setNuevaParada] = useState('');
  const [rutaConParadas, setRutaConParadas] = useState<any>(null);
  
  // Estados de control para evitar ciclos infinitos
  const [fechasInicializadas, setFechasInicializadas] = useState(false);
  const fechasModificadasPorUsuario = useRef(false);
  
  // Hooks para manejo de rutas precisas
  const {
    calculandoRuta,
    rutaActual,
    error: errorRuta,
    calcularRutaOptimizada,
    tieneRutaValida,
    precisenEsAlta
  } = useRutasPrecisas();

  const {
    calcularRutaCompleta,
    calculando: calculandoParadas,
    error: errorParadas
  } = useRutaConParadas();
  
  const { isLoaded: mapsLoaded, error: googleMapsError } = useGoogleMapsAPI();

  // Inicializar fechas por defecto (solo una vez al montar)
  useEffect(() => {
    if (!fechasInicializadas && !fechaSalida && !fechaLlegada) {
      const mañana = new Date();
      mañana.setDate(mañana.getDate() + 1);
      const salidaInicial = mañana.toISOString().slice(0, 16);
      
      const llegada = new Date(mañana);
      llegada.setDate(llegada.getDate() + 1);
      const llegadaInicial = llegada.toISOString().slice(0, 16);
      
      setFechaSalida(salidaInicial);
      setFechaLlegada(llegadaInicial);
      setFechasInicializadas(true);
    }
  }, []); // Sin dependencias - solo se ejecuta al montar

  // Cargar datos existentes del wizard (solo si usuario NO ha modificado manualmente)
  useEffect(() => {
    // Si el usuario ya modificó las fechas, no sobrescribir
    if (fechasModificadasPorUsuario.current) return;
    
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
    // Cargar fechas del wizard principal si existen
    if (data.fechaInicio) {
      setFechaSalida(new Date(data.fechaInicio).toISOString().slice(0, 16));
    }
    if (data.fechaFin) {
      setFechaLlegada(new Date(data.fechaFin).toISOString().slice(0, 16));
    }
  }, [data.origen, data.destino, data.fechaInicio, data.fechaFin]);

  // Sincronizar fechas con el wizard principal (solo si hay cambios reales)
  useEffect(() => {
    if (fechaSalida && fechaLlegada) {
      // Normalizar fechas para comparación
      const fechaInicioActual = data.fechaInicio ? new Date(data.fechaInicio).toISOString().slice(0, 16) : '';
      const fechaFinActual = data.fechaFin ? new Date(data.fechaFin).toISOString().slice(0, 16) : '';
      
      // Solo updateData si realmente cambió
      if (fechaSalida !== fechaInicioActual || fechaLlegada !== fechaFinActual) {
        updateData({
          fechaInicio: fechaSalida,
          fechaFin: fechaLlegada
        });
      }
    }
  }, [fechaSalida, fechaLlegada, data.fechaInicio, data.fechaFin]); // Removido updateData de dependencias

  // Calcular ruta automáticamente cuando se tienen origen y destino
  const calcularRuta = async () => {
    if (!origenDireccion || !destinoDireccion) {
      toast.error('Debes especificar origen y destino');
      return;
    }

    try {
      // Si hay paradas autorizadas, usar el nuevo sistema
      if (data.tieneParadasAutorizadas && data.paradasAutorizadas?.length > 0) {
        const paradasParaCalculo: ParadaAutorizada[] = data.paradasAutorizadas.map((parada, index) => ({
          id: parada.id,
          direccion: parada.direccion,
          tiempoServicio: 30, // 30 minutos por defecto
          orden: parada.orden || index + 1,
          tipo: 'carga', // tipo por defecto
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
          
          // Actualizar datos del wizard con la ruta que incluye paradas
          updateData({
            origen: {
              nombre: origenDireccion,
              direccion: origenDireccion,
              coordenadas: {
                latitud: rutaCompleta.origen.lat,
                longitud: rutaCompleta.origen.lng
              },
              fechaHoraSalidaLlegada: fechaSalida || new Date().toISOString(),
              validadaGoogleMaps: true
            },
            destino: {
              nombre: destinoDireccion,
              direccion: destinoDireccion,
              coordenadas: {
                latitud: rutaCompleta.destino.lat,
                longitud: rutaCompleta.destino.lng
              },
              fechaHoraSalidaLlegada: fechaLlegada || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              validadaGoogleMaps: true
            },
            distanciaRecorrida: rutaCompleta.distanciaTotal,
            paradasAutorizadas: rutaCompleta.paradas.map(parada => ({
              id: parada.id,
              nombre: parada.nombre || `Parada ${parada.orden}`,
              direccion: parada.direccion,
              orden: parada.orden,
              coordenadas: parada.coordenadas ? {
                latitud: parada.coordenadas.lat,
                longitud: parada.coordenadas.lng
              } : undefined
            }))
          });

          setShowMap(true);
          toast.success(`Ruta calculada con ${rutaCompleta.paradas.length} paradas - ${rutaCompleta.distanciaTotal} km`);
          return;
        }
      }

      // Fallback al sistema original si no hay paradas
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
        // Extraer estado y municipio de las direcciones usando reverse geocoding
        const extraerEstadoMunicipio = (direccion: string) => {
          // Extraer partes de la dirección
          const partes = direccion.split(',').map(p => p.trim());
          const estado = partes.length >= 2 ? partes[partes.length - 2] : '';
          const municipio = partes.length >= 3 ? partes[partes.length - 3] : '';
          const colonia = partes.length >= 4 ? partes[partes.length - 4] : '';
          
          return { estado, municipio, colonia };
        };

        const origenGeo = extraerEstadoMunicipio(rutaCalculada.origen.direccion);
        const destinoGeo = extraerEstadoMunicipio(rutaCalculada.destino.direccion);

        console.log('🗺️ [ViajeWizardRutaEnhanced] Actualizando wizard con datos de ruta:', {
          origen: {
            direccion: rutaCalculada.origen.direccion,
            codigoPostal: rutaCalculada.origen.codigoPostal
          },
          destino: {
            direccion: rutaCalculada.destino.direccion,
            codigoPostal: rutaCalculada.destino.codigoPostal
          },
          distancia: rutaCalculada.distanciaKm,
          tiempo: rutaCalculada.tiempoEstimadoMinutos
        });

        // Actualizar datos del wizard con información precisa y completa
        updateData({
          origen: {
            nombre: rutaCalculada.origen.nombre,
            direccion: rutaCalculada.origen.direccion,
            coordenadas: rutaCalculada.origen.coordenadas,
            codigoPostal: rutaCalculada.origen.codigoPostal || '', // ← CAMPO DIRECTO
            codigo_postal: rutaCalculada.origen.codigoPostal || '', // ← CAMPO DIRECTO (alternativo)
            domicilio: {
              pais: 'MEX',
              codigo_postal: rutaCalculada.origen.codigoPostal || '', // ← DENTRO DEL JSON
              codigoPostal: rutaCalculada.origen.codigoPostal || '', // ← DENTRO DEL JSON (alternativo)
              estado: origenGeo.estado,
              municipio: origenGeo.municipio,
              colonia: origenGeo.colonia,
              calle: rutaCalculada.origen.direccion || ''
            },
            fechaHoraSalidaLlegada: fechaSalida || new Date().toISOString(),
            precision: rutaCalculada.origen.precision,
            validadaGoogleMaps: rutaCalculada.origen.validadaGoogleMaps
          },
          destino: {
            nombre: rutaCalculada.destino.nombre,
            direccion: rutaCalculada.destino.direccion,
            coordenadas: rutaCalculada.destino.coordenadas,
            codigoPostal: rutaCalculada.destino.codigoPostal || '', // ← CAMPO DIRECTO
            codigo_postal: rutaCalculada.destino.codigoPostal || '', // ← CAMPO DIRECTO (alternativo)
            domicilio: {
              pais: 'MEX',
              codigo_postal: rutaCalculada.destino.codigoPostal || '', // ← DENTRO DEL JSON
              codigoPostal: rutaCalculada.destino.codigoPostal || '', // ← DENTRO DEL JSON (alternativo)
              estado: destinoGeo.estado,
              municipio: destinoGeo.municipio,
              colonia: destinoGeo.colonia,
              calle: rutaCalculada.destino.direccion || ''
            },
            fechaHoraSalidaLlegada: fechaLlegada || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            precision: rutaCalculada.destino.precision,
            validadaGoogleMaps: rutaCalculada.destino.validadaGoogleMaps
          },
          distanciaRecorrida: rutaCalculada.distanciaKm,
          distanciaTotal: rutaCalculada.distanciaKm,
          tiempoEstimado: rutaCalculada.tiempoEstimadoMinutos
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

  const handleTieneParadasChange = (checked: boolean) => {
    updateData({ 
      tieneParadasAutorizadas: checked,
      paradasAutorizadas: checked ? data.paradasAutorizadas || [] : []
    });
  };

  const agregarParada = async () => {
    if (!nuevaParada.trim()) {
      toast.error('Ingresa una dirección para la parada');
      return;
    }

    const nuevaParadaObj = {
      id: crypto.randomUUID(),
      nombre: `Parada ${(data.paradasAutorizadas?.length || 0) + 1}`,
      direccion: nuevaParada.trim(),
      orden: (data.paradasAutorizadas?.length || 0) + 1
    };

    const paradasActualizadas = [...(data.paradasAutorizadas || []), nuevaParadaObj];
    
    updateData({
      paradasAutorizadas: paradasActualizadas
    });

    setNuevaParada('');
    toast.success(`Parada agregada: ${nuevaParadaObj.direccion}`);
    
    // Auto-calcular si ya tenemos origen y destino
    if (origenDireccion && destinoDireccion) {
      setTimeout(() => {
        calcularRuta();
      }, 500);
    }
  };

  const eliminarParada = (id: string) => {
    updateData({
      paradasAutorizadas: data.paradasAutorizadas?.filter(p => p.id !== id)
    });
    toast.success('Parada eliminada');
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
              placeholder="Ej: Av. Insurgentes Sur 123, Col. Del Valle, CDMX, 03100"
              value={origenDireccion}
              onChange={(e) => setOrigenDireccion(e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              💡 Incluye: Calle, Número, Colonia, Ciudad, Código Postal para mejor precisión
            </p>
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
              onChange={(e) => {
                const nuevaSalida = e.target.value;
                setFechaSalida(nuevaSalida);
                fechasModificadasPorUsuario.current = true;
                
                // Si la llegada es anterior a la nueva salida, ajustarla
                if (fechaLlegada && new Date(fechaLlegada) <= new Date(nuevaSalida)) {
                  const nuevaLlegada = new Date(nuevaSalida);
                  nuevaLlegada.setDate(nuevaLlegada.getDate() + 1);
                  const nuevaLlegadaStr = nuevaLlegada.toISOString().slice(0, 16);
                  setFechaLlegada(nuevaLlegadaStr);
                  toast.info('Fecha de llegada ajustada automáticamente');
                }
              }}
              className="mt-2"
              required
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
              placeholder="Ej: Av. López Mateos 456, Col. Americana, Guadalajara, 44160"
              value={destinoDireccion}
              onChange={(e) => setDestinoDireccion(e.target.value)}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              💡 Incluye: Calle, Número, Colonia, Ciudad, Código Postal para mejor precisión
            </p>
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
              onChange={(e) => {
                const nuevaLlegada = e.target.value;
                
                // Validar que la llegada sea posterior a la salida
                if (fechaSalida && new Date(nuevaLlegada) <= new Date(fechaSalida)) {
                  toast.error('La fecha de llegada debe ser posterior a la salida');
                  return;
                }
                
                setFechaLlegada(nuevaLlegada);
                fechasModificadasPorUsuario.current = true;
              }}
              className="mt-2"
              min={fechaSalida}
              required
            />
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
              checked={data.tieneParadasAutorizadas || false}
              onCheckedChange={handleTieneParadasChange}
            />
            <Label htmlFor="tieneParadas" className="font-medium">
              Este viaje tendrá paradas autorizadas
            </Label>
          </div>

          {data.tieneParadasAutorizadas && (
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

              {data.paradasAutorizadas && data.paradasAutorizadas.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Paradas programadas ({data.paradasAutorizadas.length})
                  </Label>
                  {data.paradasAutorizadas.map((parada) => (
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
        <Button
          onClick={calcularRuta}
          disabled={!origenDireccion || !destinoDireccion || calculandoRuta || calculandoParadas}
          size="lg"
          className="flex items-center gap-2"
        >
          {(calculandoRuta || calculandoParadas) ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {data.tieneParadasAutorizadas && data.paradasAutorizadas?.length > 0 
                ? 'Calculando ruta con paradas...' 
                : 'Calculando ruta optimizada...'}
            </>
          ) : (
            <>
              <Calculator className="h-4 w-4" />
              Calcular Ruta Optimizada
            </>
          )}
        </Button>
      </div>

      {/* Resultado del cálculo - Priorizar ruta con paradas */}
      {(rutaConParadas || rutaActual) && (
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
                      {rutaConParadas ? `${rutaConParadas.distanciaTotal} km` : `${rutaActual.distanciaKm} km`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-600" />
                  <div>
                    <div className="font-medium">Tiempo estimado</div>
                    <div className="text-2xl font-bold text-orange-600">
                      {rutaConParadas 
                        ? formatearTiempo(rutaConParadas.tiempoTotal)
                        : formatearTiempo(rutaActual.tiempoEstimadoMinutos)
                      }
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="font-medium">Combustible</div>
                    <div className="text-lg font-bold text-purple-600">
                      {rutaConParadas 
                        ? formatearCosto(rutaConParadas.combustibleTotal)
                        : formatearCosto(rutaActual.costoCombustible)
                      }
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium">Precisión</div>
                    <div className="text-lg font-bold text-green-600">
                      {rutaConParadas ? `${rutaConParadas.precision}%` : `${rutaActual.precision}%`}
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
                  {rutaConParadas 
                    ? `${origenDireccion} → ${rutaConParadas.paradas.length} paradas → ${destinoDireccion}`
                    : `${rutaActual.origen.nombre} → ${rutaActual.destino.nombre}`
                  }
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>Peajes estimados: {rutaConParadas ? formatearCosto(rutaConParadas.peajesTotal) : formatearCosto(rutaActual.peajes)}</div>
                  <div>Costo total estimado: {rutaConParadas 
                    ? formatearCosto(rutaConParadas.combustibleTotal + rutaConParadas.peajesTotal)
                    : formatearCosto(rutaActual.costoCombustible + rutaActual.peajes)
                  }</div>
                </div>
                {rutaConParadas && rutaConParadas.paradas.length > 0 && (
                  <div className="mt-2 text-xs text-gray-600">
                    Tiempo en paradas: {formatearTiempo(rutaConParadas.tiempoServicio)} • 
                    Paradas: {rutaConParadas.paradas.length}
                  </div>
                )}
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

              {/* Información básica de ruta - Sin cálculos complejos */}
              <div className="p-3 bg-blue-50 rounded-lg border">
                <div className="text-sm font-medium text-blue-800 mb-2">ℹ️ Los cálculos detallados de costos se mostrarán en el resumen final</div>
                <p className="text-xs text-blue-600">Esta información será utilizada para generar los documentos oficiales</p>
              </div>
            </CardContent>
          </Card>

          {/* Google Map Visualization */}
          {showMap && data.origen && data.destino && (
            <GoogleMapVisualization
              ubicaciones={[
                {
                  ...data.origen,
                  tipoUbicacion: 'Origen',
                  nombreRemitenteDestinatario: 'Origen del viaje',
                  domicilio: { 
                    calle: data.origen.direccion,
                    municipio: data.origen.codigoPostal
                  }
                },
                // Agregar paradas autorizadas al mapa
                ...(data.paradasAutorizadas || []).map((parada, index) => ({
                  id: parada.id,
                  idUbicacion: `parada-${index + 1}`,
                  tipoUbicacion: 'Paso Intermedio',
                  nombreRemitenteDestinatario: parada.nombre,
                  domicilio: { 
                    calle: parada.direccion,
                    municipio: parada.codigoPostal || 'Sin CP'
                  },
                  coordenadas: parada.coordenadas
                })),
                {
                  ...data.destino,
                  tipoUbicacion: 'Destino',
                  nombreRemitenteDestinatario: 'Destino del viaje',
                  domicilio: { 
                    calle: data.destino.direccion,
                    municipio: data.destino.codigoPostal
                  }
                }
              ]}
              routeData={rutaActual ? {
                google_data: rutaActual.rutaOptimizada,
                distance_km: rutaActual.distanciaKm,
                duration_minutes: rutaActual.tiempoEstimadoMinutos
              } : null}
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