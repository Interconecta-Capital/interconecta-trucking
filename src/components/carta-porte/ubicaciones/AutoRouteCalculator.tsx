
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Route, CheckCircle, AlertTriangle } from 'lucide-react';
import { useGoogleRouteCalculation } from '@/hooks/useGoogleRouteCalculation';
import { Ubicacion } from '@/types/ubicaciones';
import { RouteCalculationStatus } from './RouteCalculationStatus';
import { RouteMetricsDisplay } from './RouteMetricsDisplay';
import { RouteControls } from './RouteControls';

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
  const { calculateRoute, isCalculating, routeData, error } = useGoogleRouteCalculation();
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

  // Función de geocodificación mejorada para coordenadas
  const geocodeLocation = async (ubicacion: Ubicacion): Promise<{ lat: number; lng: number } | null> => {
    // Si ya tiene coordenadas, usarlas
    if (ubicacion.coordenadas) {
      return {
        lat: ubicacion.coordenadas.latitud,
        lng: ubicacion.coordenadas.longitud
      };
    }

    // Coordenadas basadas en código postal (simplificado para testing)
    const cpMap: { [key: string]: { lat: number; lng: number } } = {
      // México principales
      '01000': { lat: 19.4326, lng: -99.1332 }, // CDMX Centro
      '03100': { lat: 19.3927, lng: -99.1588 }, // Del Valle
      '06700': { lat: 19.4284, lng: -99.1676 }, // Roma Norte
      '11000': { lat: 19.4069, lng: -99.1716 }, // San Miguel Chapultepec
      '62577': { lat: 18.8711, lng: -99.2211 }, // Jiutepec, Morelos
      '22000': { lat: 32.5149, lng: -117.0382 }, // Tijuana, BC
    };

    const coords = cpMap[ubicacion.domicilio.codigoPostal];
    if (coords) {
      console.log(`📍 Coordenadas encontradas para CP ${ubicacion.domicilio.codigoPostal}:`, coords);
      return coords;
    }

    // Coordenadas por defecto para México si no se encuentra
    console.log(`⚠️ CP ${ubicacion.domicilio.codigoPostal} no encontrado, usando coordenadas por defecto`);
    return { lat: 19.4326, lng: -99.1332 };
  };

  // Auto-calcular cuando cambian las ubicaciones
  useEffect(() => {
    const performAutoCalculation = async () => {
      if (!canCalculate || isCalculating || !safeUbicaciones.length) return;
      
      const currentHash = createLocationHash();
      
      // Solo calcular si las ubicaciones han cambiado y no tenemos distancia calculada
      if (currentHash !== lastCalculationHash && (!distanciaTotal || distanciaTotal === 0)) {
        console.log('🔄 Auto-calculando ruta con Google Maps por cambio en ubicaciones');
        
        try {
          // Geocodificar ubicaciones
          const origenCoords = await geocodeLocation(origen);
          const destinoCoords = await geocodeLocation(destino);
          
          if (!origenCoords || !destinoCoords) {
            console.warn('⚠️ No se pudieron obtener coordenadas para origen/destino');
            return;
          }

          // Geocodificar intermedios si existen
          const waypoints = [];
          for (const intermedio of intermedios) {
            const coords = await geocodeLocation(intermedio);
            if (coords) waypoints.push(coords);
          }

          console.log('🚀 Iniciando cálculo con Google Maps:', { origenCoords, destinoCoords, waypoints });

          // Calcular ruta
          const result = await calculateRoute(origenCoords, destinoCoords, waypoints);
          
          if (result && result.success) {
            console.log('✅ Ruta calculada exitosamente con Google Maps, notificando componente padre');
            onDistanceCalculated(
              result.distance_km,
              result.duration_minutes,
              result
            );
            setAutoCalculationDone(true);
            setLastCalculationHash(currentHash);
          } else {
            console.warn('⚠️ Cálculo de ruta falló, pero manteniendo ubicaciones');
          }
        } catch (error) {
          console.error('❌ Error en auto-cálculo con Google Maps (no crítico):', error);
          // No lanzamos el error para evitar que se pierdan las ubicaciones
        }
      }
    };

    // Delay para evitar cálculos excesivos
    const timeoutId = setTimeout(performAutoCalculation, 1500);
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
          result
        );
        setAutoCalculationDone(true);
        setLastCalculationHash(createLocationHash());
      }
    } catch (error) {
      console.error('❌ Error en recálculo manual con Google Maps:', error);
    }
  };

  // Check if we should show the status component instead of the main calculator
  if (!safeUbicaciones.length || !canCalculate) {
    return (
      <RouteCalculationStatus
        isCalculating={isCalculating}
        hasUbicaciones={safeUbicaciones.length > 0}
        canCalculate={!!canCalculate}
      />
    );
  }

  return (
    <Card className="border-gray-200 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-gray-800">
          <Route className="h-5 w-5" />
          Cálculo Automático de Ruta - Google Maps
          {autoCalculationDone && !error && (
            <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Calculada
            </Badge>
          )}
          {error && (
            <Badge variant="destructive" className="ml-auto">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Error
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <RouteCalculationStatus
          isCalculating={isCalculating}
          hasUbicaciones={true}
          canCalculate={true}
        />

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              {error}
            </p>
          </div>
        )}

        <RouteMetricsDisplay
          distanciaTotal={distanciaTotal || 0}
          tiempoEstimado={tiempoEstimado || 0}
        />

        <RouteControls
          origen={origen}
          destino={destino}
          intermedios={intermedios}
          isCalculating={isCalculating}
          onRecalculate={handleManualRecalculation}
        />
      </CardContent>
    </Card>
  );
}
