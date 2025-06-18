
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calculator, MapPin, Clock, AlertTriangle } from 'lucide-react';
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

  // Crear hash de ubicaciones para detectar cambios
  const createUbicacionesHash = useCallback((ubicaciones: any[]) => {
    return ubicaciones.map(u => 
      `${u.tipoUbicacion}-${u.domicilio?.codigoPostal}-${u.domicilio?.calle}`
    ).join('|');
  }, []);

  // Calcular distancia automáticamente cuando cambian las ubicaciones
  const calculateDistance = useCallback(async () => {
    if (ubicaciones.length < 2) {
      return;
    }

    const currentHash = createUbicacionesHash(ubicaciones);
    
    // No recalcular si las ubicaciones no han cambiado
    if (currentHash === lastCalculatedHash && distanciaTotal > 0) {
      return;
    }

    setIsCalculatingLocal(true);
    try {
      console.log('🚀 Calculando distancia para ubicaciones:', ubicaciones);
      
      const resultado = await DistanceCalculationService.calcularDistanciaReal(ubicaciones);
      
      console.log('✅ Resultado del cálculo:', resultado);
      
      onDistanceCalculated(resultado.distanciaTotal, resultado.tiempoEstimado);
      setLastCalculatedHash(currentHash);
      
      toast.success(`Distancia calculada: ${resultado.distanciaTotal} km`);
    } catch (error: any) {
      console.error('❌ Error calculando distancia:', error);
      toast.error(`Error calculando distancia: ${error.message}`);
    } finally {
      setIsCalculatingLocal(false);
    }
  }, [ubicaciones, onDistanceCalculated, createUbicacionesHash, lastCalculatedHash, distanciaTotal]);

  // Auto-calcular cuando cambian las ubicaciones (con debounce)
  useEffect(() => {
    if (ubicaciones.length >= 2) {
      const timer = setTimeout(() => {
        calculateDistance();
      }, 1000); // Debounce de 1 segundo

      return () => clearTimeout(timer);
    }
  }, [ubicaciones, calculateDistance]);

  const handleManualCalculation = () => {
    setLastCalculatedHash(''); // Forzar recálculo
    calculateDistance();
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

  if (ubicaciones.length < 2) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <p className="text-sm text-orange-700">
              Se necesitan al menos 2 ubicaciones para calcular la distancia
            </p>
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
            <Calculator className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-900">Cálculo de Distancia</h3>
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
            className="border-blue-300 text-blue-700 hover:bg-blue-100"
          >
            {(isCalculating || isCalculatingLocal) ? 'Calculando...' : 'Recalcular'}
          </Button>
        </div>
        
        {distanciaTotal === 0 && !isCalculating && !isCalculatingLocal && (
          <p className="text-xs text-blue-600 mt-2">
            La distancia se calculará automáticamente cuando agregues las ubicaciones
          </p>
        )}
      </CardContent>
    </Card>
  );
}
