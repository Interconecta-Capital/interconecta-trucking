import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Route, Clock, Loader2, CheckCircle, AlertTriangle, Navigation } from 'lucide-react';
import { useRutasPrecisas } from '@/hooks/useRutasPrecisas';
import { GoogleMapVisualization } from './GoogleMapVisualization';
import { toast } from 'sonner';
import { Ubicacion } from '@/types/ubicaciones';

interface RouteCalculatorSimpleProps {
  ubicaciones: Ubicacion[];
  onDistanceCalculated?: (distancia: number, tiempo: number) => void;
}

export function RouteCalculatorSimple({ ubicaciones, onDistanceCalculated }: RouteCalculatorSimpleProps) {
  const [showMap, setShowMap] = useState(false);
  
  const {
    calculandoRuta,
    rutaActual,
    error: errorRuta,
    calcularRutaOptimizada,
    tieneRutaValida
  } = useRutasPrecisas();

  const formatAddress = (ub: Ubicacion): string => {
    const dom = ub.domicilio;
    const parts = [
      dom.calle,
      dom.numExterior,
      dom.colonia,
      dom.municipio,
      dom.estado,
      dom.codigoPostal
    ].filter(Boolean);
    return parts.join(', ');
  };

  const handleCalcularRuta = async () => {
    const origen = ubicaciones.find(u => u.tipoUbicacion === 'Origen');
    const destino = ubicaciones.find(u => u.tipoUbicacion === 'Destino');

    if (!origen || !destino) {
      toast.error('Necesitas agregar origen y destino primero');
      return;
    }

    const origenDir = formatAddress(origen);
    const destinoDir = formatAddress(destino);

    if (!origenDir || !destinoDir) {
      toast.error('Las direcciones están incompletas');
      return;
    }

    console.log('🗺️ Calculando ruta:', { origenDir, destinoDir });

    try {
      const rutaCalculada = await calcularRutaOptimizada(origenDir, destinoDir);

      if (rutaCalculada) {
        setShowMap(true);
        
        // Notificar al componente padre con la distancia calculada
        if (onDistanceCalculated) {
          onDistanceCalculated(rutaCalculada.distanciaKm, rutaCalculada.tiempoEstimadoMinutos);
        }

        console.log('✅ Ruta calculada exitosamente:', {
          distancia: rutaCalculada.distanciaKm,
          tiempo: rutaCalculada.tiempoEstimadoMinutos
        });
      }
    } catch (error) {
      console.error('❌ Error calculando ruta:', error);
      toast.error('Error calculando la ruta');
    }
  };

  const formatTiempo = (minutos: number): string => {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}m`;
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Route className="h-5 w-5 text-primary" />
            Cálculo de Ruta
          </span>
          {tieneRutaValida && (
            <Badge className="bg-green-500">
              <CheckCircle className="h-3 w-3 mr-1" />
              Calculada
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {errorRuta && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errorRuta}</AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleCalcularRuta}
          disabled={calculandoRuta || ubicaciones.length < 2}
          className="w-full"
          size="lg"
        >
          {calculandoRuta ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Calculando con Google Maps...
            </>
          ) : (
            <>
              <Navigation className="h-4 w-4 mr-2" />
              Calcular Ruta con Google Maps
            </>
          )}
        </Button>

        {rutaActual && (
          <div className="space-y-4">
            {/* Resultados de la ruta */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <Route className="h-4 w-4" />
                  Distancia Total
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {rutaActual.distanciaKm.toFixed(2)} km
                </div>
              </div>
              
              <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Tiempo Estimado
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {formatTiempo(rutaActual.tiempoEstimadoMinutos)}
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="text-sm text-muted-foreground space-y-1">
              <div>📍 Origen: {rutaActual.origen.direccion}</div>
              <div>🎯 Destino: {rutaActual.destino.direccion}</div>
              <div>✓ Precisión: {rutaActual.precision}%</div>
            </div>

            {/* Mapa con la ruta */}
            {showMap && rutaActual.rutaOptimizada && (
              <div className="mt-4">
                <GoogleMapVisualization
                  ubicaciones={ubicaciones}
                  routeData={rutaActual.rutaOptimizada}
                  isVisible={showMap}
                />
              </div>
            )}
          </div>
        )}

        {!rutaActual && !calculandoRuta && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Agrega origen y destino, luego haz clic en "Calcular Ruta"
          </p>
        )}
      </CardContent>
    </Card>
  );
}
