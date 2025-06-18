
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Route, Clock, MapPin, Calculator, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { Ubicacion } from '@/types/ubicaciones';
import { DistanceCalculationService } from '@/services/distanceCalculationService';
import { useToast } from '@/hooks/use-toast';

interface DistanceCalculatorProps {
  ubicaciones: Ubicacion[];
  onDistanceCalculated: (distanciaTotal: number, tiempoEstimado: number) => void;
  distanciaTotal?: number;
  tiempoEstimado?: number;
  isCalculating?: boolean;
}

export function DistanceCalculator({
  ubicaciones,
  onDistanceCalculated,
  distanciaTotal,
  tiempoEstimado,
  isCalculating = false
}: DistanceCalculatorProps) {
  const [isCalculatingLocal, setIsCalculatingLocal] = useState(false);
  const [lastCalculation, setLastCalculation] = useState<Date | null>(null);
  const [calculationError, setCalculationError] = useState<string | null>(null);
  const { toast } = useToast();

  const canCalculate = ubicaciones.length >= 2 && 
    ubicaciones.some(u => u.tipoUbicacion === 'Origen') &&
    ubicaciones.some(u => u.tipoUbicacion === 'Destino');

  // Auto-calcular cuando se completan ubicaciones válidas
  useEffect(() => {
    const shouldAutoCalculate = canCalculate && 
      ubicaciones.length >= 2 && 
      !distanciaTotal && 
      !isCalculatingLocal &&
      !isCalculating;

    if (shouldAutoCalculate) {
      console.log('🚀 Auto-calculando distancia con ubicaciones completas');
      handleCalculateDistance();
    }
  }, [ubicaciones.length, canCalculate]);

  const handleCalculateDistance = async () => {
    if (!canCalculate || isCalculatingLocal || isCalculating) return;
    
    setIsCalculatingLocal(true);
    setCalculationError(null);
    
    try {
      console.log('🚀 Iniciando cálculo real de distancia con Mapbox');
      
      // Validar que todas las ubicaciones tengan datos mínimos
      const ubicacionesValidas = ubicaciones.filter(u => 
        u.domicilio?.codigoPostal && 
        u.domicilio?.calle && 
        u.domicilio?.municipio &&
        u.domicilio?.estado
      );

      if (ubicacionesValidas.length < 2) {
        throw new Error('Las ubicaciones necesitan domicilios completos para calcular la distancia');
      }
      
      const resultado = await DistanceCalculationService.calcularDistanciaReal(ubicacionesValidas);
      
      // Llamar inmediatamente al callback para persistir
      onDistanceCalculated(resultado.distanciaTotal, resultado.tiempoEstimado);
      setLastCalculation(new Date());
      
      toast({
        title: "✅ Distancia calculada exitosamente",
        description: `Distancia: ${resultado.distanciaTotal} km, Tiempo: ${formatTime(resultado.tiempoEstimado)}`,
      });

      console.log('✅ Cálculo completado y persistido:', resultado);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "No se pudo calcular la distancia";
      console.error('❌ Error calculando distancia:', error);
      setCalculationError(errorMessage);
      
      toast({
        title: "Error en el cálculo",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsCalculatingLocal(false);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const isCalculatingState = isCalculating || isCalculatingLocal;
  const hasValidResult = distanciaTotal && tiempoEstimado;

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Calculator className="h-5 w-5" />
          Calculadora de Distancia de Ruta
          {hasValidResult && lastCalculation && (
            <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Calculada
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Mensajes de error */}
        {calculationError && (
          <div className="p-3 bg-red-100 border border-red-300 rounded-lg flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Error en el cálculo</p>
              <p className="text-xs text-red-700">{calculationError}</p>
            </div>
          </div>
        )}

        {/* Advertencias */}
        {!canCalculate && (
          <div className="p-3 bg-yellow-100 border border-yellow-300 rounded-lg flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Ubicaciones requeridas</p>
              <p className="text-xs text-yellow-700">
                Necesitas al menos un origen y un destino con domicilios completos
              </p>
            </div>
          </div>
        )}

        {/* Botón de cálculo */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleCalculateDistance}
            disabled={!canCalculate || isCalculatingState}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isCalculatingState ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Calculando con Mapbox...
              </>
            ) : (
              <>
                <Route className="h-4 w-4 mr-2" />
                {hasValidResult ? 'Recalcular Distancia' : 'Calcular Distancia Real'}
              </>
            )}
          </Button>
        </div>

        {/* Resultados */}
        {hasValidResult && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Distancia Total</span>
              </div>
              <div className="text-2xl font-bold text-green-700">
                {distanciaTotal} km
              </div>
              <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800">
                Requerido por SAT
              </Badge>
            </div>

            <div className="bg-white p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Tiempo Estimado</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {formatTime(tiempoEstimado)}
              </div>
              <Badge variant="secondary" className="mt-1 bg-blue-100 text-blue-800">
                Estimación
              </Badge>
            </div>
          </div>
        )}

        {/* Información de la última actualización */}
        {lastCalculation && (
          <div className="text-xs text-gray-600 bg-white p-2 rounded border">
            <strong>Última actualización:</strong> {lastCalculation.toLocaleString('es-MX')}
            <br />
            <strong>Ubicaciones procesadas:</strong> {ubicaciones.length}
          </div>
        )}

        {/* Nota SAT */}
        <div className="text-xs text-gray-600 bg-white p-3 rounded border">
          <strong>Nota SAT:</strong> La distancia total recorrida es obligatoria en la Carta Porte 
          y debe reflejar la suma de todas las distancias entre ubicaciones del trayecto.
          El cálculo se realiza automáticamente cuando completas las ubicaciones.
        </div>
      </CardContent>
    </Card>
  );
}
