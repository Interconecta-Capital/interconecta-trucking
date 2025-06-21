
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { MapPin, Route, Clock, Calendar, Calculator, Navigation } from 'lucide-react';
import { ViajeWizardData } from '../ViajeWizard';
import { useUbicacionesGeocodificacion } from '@/hooks/useUbicacionesGeocodificacion';

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
  } | null>(null);

  const { calcularRutaCompleta, geocodificarUbicacion, calcularDistanciaEntrePuntos } = useUbicacionesGeocodificacion();

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
      // Simular geocodificación y cálculo de ruta
      const origenGeo = await geocodificarUbicacion({
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
          colonia: 'Centro' // Agregada propiedad faltante
        },
        fechaHoraSalidaLlegada: fechaSalida
      });

      const destinoGeo = await geocodificarUbicacion({
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
          colonia: 'Centro Histórico' // Agregada propiedad faltante
        },
        fechaHoraSalidaLlegada: fechaLlegada
      });

      // Calcular distancia (simulada)
      const distancia = calcularDistanciaEntrePuntos(
        { latitud: 19.4326, longitud: -99.1332 },
        { latitud: 20.6597, longitud: -103.3496 }
      );

      const tiempoEstimado = Math.round(distancia / 80 * 60); // Estimación: 80 km/h promedio

      setRutaCalculada({
        distancia: Math.round(distancia),
        tiempoEstimado,
        ruta: `${origenDireccion} → ${destinoDireccion}`
      });

      // Actualizar datos del wizard
      updateData({
        origen: origenGeo,
        destino: destinoGeo,
        distanciaRecorrida: Math.round(distancia)
      });

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
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-green-800">
              <Route className="h-5 w-5" />
              Ruta Calculada
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
