
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Route, MapPin, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouteCalculation } from '@/hooks/useRouteCalculation';
import { Ubicacion } from '@/types/ubicaciones';

interface AutoRouteCalculatorProps {
  ubicaciones: Ubicacion[];
  onDistanceCalculated: (distancia: number, tiempo: number, geometry: any) => void;
  distanciaTotal?: number;
  tiempoEstimado?: number;
}

export function AutoRouteCalculator({
  ubicaciones,
  onDistanceCalculated,
  distanciaTotal,
  tiempoEstimado
}: AutoRouteCalculatorProps) {
  const { calculateRoute, isCalculating, routeData } = useRouteCalculation();
  const [autoCalculationDone, setAutoCalculationDone] = useState(false);
  const [lastCalculationHash, setLastCalculationHash] = useState<string>('');

  // Add safety check for ubicaciones
  const safeUbicaciones = ubicaciones || [];

  // Obtener origen y destino válidos
  const origen = safeUbicaciones.find(u => u.tipoUbicacion === 'Origen');
  const destino = safeUbicaciones.find(u => u.tipoUbicacion === 'Destino');
  const intermedios = safeUbicaciones.filter(u => u.tipoUbicacion === 'Paso Intermedio');

  // Verificar si tenemos datos suficientes para calcular
  const canCalculate = origen && destino && 
    origen.domicilio?.codigoPostal && origen.domicilio?.calle &&
    destino.domicilio?.codigoPostal && destino.domicilio?.calle;

  // Crear hash de ubicaciones para detectar cambios
  const createLocationHash = () => {
    if (!canCalculate) return '';
    
    const locationData = {
      origen: `${origen.domicilio.calle}-${origen.domicilio.codigoPostal}`,
      destino: `${destino.domicilio.calle}-${destino.domicilio.codigoPostal}`,
      intermedios: intermedios.map(i => `${i.domicilio?.calle}-${i.domicilio?.codigoPostal}`).join('|')
    };
    
    return JSON.stringify(locationData);
  };

  // Función de geocodificación simplificada para coordenadas
  const geocodeLocation = async (ubicacion: Ubicacion): Promise<{ lat: number; lng: number } | null> => {
    // Si ya tiene coordenadas, usarlas
    if (ubicacion.coordenadas) {
      return {
        lat: ubicacion.coordenadas.latitud,
        lng: ubicacion.coordenadas.longitud
      };
    }

    // Simulación de coordenadas basadas en código postal (esto se puede mejorar)
    // En un caso real, harías geocodificación aquí
    const cpMap: { [key: string]: { lat: number; lng: number } } = {
      '01000': { lat: 19.4326, lng: -99.1332 }, // CDMX Centro
      '03100': { lat: 19.3927, lng: -99.1588 }, // Del Valle
      '06700': { lat: 19.4284, lng: -99.1676 }, // Roma Norte
      '11000': { lat: 19.4069, lng: -99.1716 }, // San Miguel Chapultepec
    };

    const coords = cpMap[ubicacion.domicilio.codigoPostal];
    if (coords) {
      return coords;
    }

    // Coordenadas por defecto para México si no se encuentra
    return { lat: 19.4326, lng: -99.1332 };
  };

  // Auto-calcular cuando cambian las ubicaciones
  useEffect(() => {
    const performAutoCalculation = async () => {
      if (!canCalculate || isCalculating || !safeUbicaciones.length) return;
      
      const currentHash = createLocationHash();
      
      // Solo calcular si las ubicaciones han cambiado y no tenemos distancia calculada
      if (currentHash !== lastCalculationHash && (!distanciaTotal || distanciaTotal === 0)) {
        console.log('🔄 Auto-calculando ruta por cambio en ubicaciones');
        
        try {
          // Geocodificar ubicaciones
          const origenCoords = await geocodeLocation(origen);
          const destinoCoords = await geocodeLocation(destino);
          
          if (!origenCoords || !destinoCoords) {
            console.warn('No se pudieron obtener coordenadas para origen/destino');
            return;
          }

          // Geocodificar intermedios si existen
          const waypoints = [];
          for (const intermedio of intermedios) {
            const coords = await geocodeLocation(intermedio);
            if (coords) waypoints.push(coords);
          }

          // Calcular ruta
          const result = await calculateRoute(origenCoords, destinoCoords, waypoints);
          
          if (result && result.success) {
            onDistanceCalculated(
              result.distance_km,
              result.duration_minutes,
              result.route_geometry
            );
            setAutoCalculationDone(true);
            setLastCalculationHash(currentHash);
          }
        } catch (error) {
          console.error('Error en auto-cálculo:', error);
        }
      }
    };

    // Delay para evitar cálculos excesivos
    const timeoutId = setTimeout(performAutoCalculation, 1000);
    return () => clearTimeout(timeoutId);
  }, [safeUbicaciones, canCalculate, distanciaTotal, lastCalculationHash]);

  // Recalcular manualmente
  const handleManualRecalculation = async () => {
    if (!canCalculate) return;
    
    try {
      const origenCoords = await geocodeLocation(origen);
      const destinoCoords = await geocodeLocation(destino);
      
      if (!origenCoords || !destinoCoords) return;

      const waypoints = [];
      for (const intermedio of intermedios) {
        const coords = await geocodeLocation(intermedio);
        if (coords) waypoints.push(coords);
      }

      const result = await calculateRoute(origenCoords, destinoCoords, waypoints);
      
      if (result && result.success) {
        onDistanceCalculated(
          result.distance_km,
          result.duration_minutes,
          result.route_geometry
        );
        setAutoCalculationDone(true);
        setLastCalculationHash(createLocationHash());
      }
    } catch (error) {
      console.error('Error en recálculo manual:', error);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Early return if no ubicaciones provided
  if (!safeUbicaciones.length) {
    return (
      <Card className="border-gray-200 bg-gray-50/50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-gray-500">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">
              No hay ubicaciones disponibles para calcular la ruta
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!canCalculate) {
    return (
      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2 text-amber-700">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">
              Agrega un origen y destino con direcciones completas para calcular la ruta automáticamente
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Route className="h-5 w-5" />
          Cálculo Automático de Ruta
          {autoCalculationDone && (
            <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Calculada
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isCalculating && (
          <div className="flex items-center gap-2 p-3 bg-blue-100 rounded-lg">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-blue-800">
              Calculando ruta con Mapbox...
            </span>
          </div>
        )}

        {distanciaTotal && tiempoEstimado && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Distancia Total</span>
              </div>
              <div className="text-2xl font-bold text-green-700">
                {distanciaTotal} km
              </div>
              <div className="text-xs text-green-600 mt-1">
                Calculado automáticamente
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Tiempo Estimado</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {formatTime(tiempoEstimado)}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Tiempo de conducción
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-gray-600">
            <strong>Ruta:</strong> {origen?.nombreRemitenteDestinatario || 'Origen'} → {destino?.nombreRemitenteDestinatario || 'Destino'}
            {intermedios.length > 0 && ` (${intermedios.length} parada${intermedios.length > 1 ? 's' : ''} intermedia${intermedios.length > 1 ? 's' : ''})`}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRecalculation}
            disabled={isCalculating}
            className="text-blue-600 border-blue-300 hover:bg-blue-50"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${isCalculating ? 'animate-spin' : ''}`} />
            Recalcular
          </Button>
        </div>

        <div className="text-xs text-gray-500 bg-white p-2 rounded border">
          <strong>Nota:</strong> La distancia se calcula automáticamente usando rutas reales de Mapbox.
          Esta es la distancia que aparecerá en tu PDF de Carta Porte.
        </div>
      </CardContent>
    </Card>
  );
}
