
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator, MapPin, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { DistanceCalculationService } from '@/services/distanceCalculationService';
import { toast } from 'sonner';

interface DistanceCalculatorProps {
  ubicaciones: any[];
  onDistanceCalculated: (distancia: number, tiempo: number) => void;
  distanciaTotal: number;
  tiempoEstimado: number;
  isCalculating: boolean;
}

export function DistanceCalculator({ 
  ubicaciones, 
  onDistanceCalculated, 
  distanciaTotal, 
  tiempoEstimado, 
  isCalculating 
}: DistanceCalculatorProps) {
  const [isCalculatingLocal, setIsCalculatingLocal] = useState(false);
  const [lastCalculatedHash, setLastCalculatedHash] = useState<string>('');
  const [hasCalculated, setHasCalculated] = useState(false);

  // CORREGIDO: Crear hash estable de ubicaciones
  const createUbicacionesHash = useCallback((ubicaciones: any[]) => {
    return ubicaciones
      .filter(u => u && u.domicilio && u.domicilio.codigoPostal)
      .map(u => 
        `${u.tipoUbicacion}-${u.domicilio?.codigoPostal}-${u.domicilio?.calle || ''}`
      ).join('|');
  }, []);

  // CORREGIDO: Función de cálculo mejorada y estable
  const calculateDistance = useCallback(async (force = false) => {
    if (ubicaciones.length < 2) {
      console.log('📍 Necesitas al menos 2 ubicaciones para calcular distancia');
      return;
    }

    const currentHash = createUbicacionesHash(ubicaciones);
    
    // No recalcular si no ha cambiado y ya tenemos resultado
    if (!force && currentHash === lastCalculatedHash && distanciaTotal > 0) {
      console.log('📍 Sin cambios en ubicaciones, usando distancia existente');
      return;
    }

    if (isCalculatingLocal || isCalculating) {
      console.log('📍 Ya se está calculando la distancia');
      return;
    }

    setIsCalculatingLocal(true);
    try {
      console.log('🚀 Calculando distancia para', ubicaciones.length, 'ubicaciones');
      
      const resultado = await DistanceCalculationService.calcularDistanciaReal(ubicaciones);
      
      console.log('✅ Distancia calculada:', resultado.distanciaTotal, 'km,', resultado.tiempoEstimado, 'min');
      
      onDistanceCalculated(resultado.distanciaTotal, resultado.tiempoEstimado);
      setLastCalculatedHash(currentHash);
      setHasCalculated(true);
      
      toast.success(`Distancia calculada: ${resultado.distanciaTotal.toFixed(1)} km`);
    } catch (error: any) {
      console.error('❌ Error calculando distancia:', error);
      toast.error(`Error calculando distancia: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsCalculatingLocal(false);
    }
  }, [ubicaciones, onDistanceCalculated, createUbicacionesHash, lastCalculatedHash, distanciaTotal, isCalculatingLocal, isCalculating]);

  // CORREGIDO: Auto-calcular con debounce inteligente
  useEffect(() => {
    if (ubicaciones.length >= 2) {
      const currentHash = createUbicacionesHash(ubicaciones);
      
      // Solo auto-calcular si hay cambios reales
      if (currentHash !== lastCalculatedHash) {
        const timer = setTimeout(() => {
          calculateDistance();
        }, 2000); // Debounce de 2 segundos

        return () => clearTimeout(timer);
      }
    }
  }, [ubicaciones, calculateDistance, createUbicacionesHash, lastCalculatedHash]);

  // CORREGIDO: Manejar cálculo manual forzado
  const handleManualCalculation = () => {
    console.log('🔄 Recálculo manual forzado');
    calculateDistance(true);
  };

  // CORREGIDO: Formatear tiempo de manera más legible
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  // CORREGIDO: Mensaje cuando no hay suficientes ubicaciones
  if (ubicaciones.length < 2) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-orange-800">
                Cálculo de Distancia Pendiente
              </p>
              <p className="text-xs text-orange-700 mt-1">
                Necesitas al menos 2 ubicaciones válidas para calcular la distancia automáticamente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calculator className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-blue-900">Distancia y Tiempo</h3>
              {distanciaTotal > 0 && (
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">
                      {distanciaTotal.toFixed(1)} km
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">
                      {formatTime(tiempoEstimado)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <Button
            onClick={handleManualCalculation}
            disabled={isCalculating || isCalculatingLocal}
            variant="outline"
            size="sm"
            className="border-blue-300 text-blue-700 hover:bg-blue-100 flex-shrink-0"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${(isCalculating || isCalculatingLocal) ? 'animate-spin' : ''}`} />
            {(isCalculating || isCalculatingLocal) ? 'Calculando...' : 'Recalcular'}
          </Button>
        </div>
        
        {/* CORREGIDO: Estados informativos más claros */}
        {distanciaTotal === 0 && !isCalculating && !isCalculatingLocal && !hasCalculated && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-600">
              💡 La distancia se calculará automáticamente cuando completes las ubicaciones
            </p>
          </div>
        )}

        {(isCalculating || isCalculatingLocal) && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <p className="text-xs text-blue-600">
                Calculando ruta óptima entre {ubicaciones.length} ubicaciones...
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
