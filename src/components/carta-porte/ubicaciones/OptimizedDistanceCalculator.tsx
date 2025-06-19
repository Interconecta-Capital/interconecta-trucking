
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Route, 
  Clock, 
  MapPin, 
  Zap, 
  TrendingUp, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { Ubicacion } from '@/types/ubicaciones';
import { useDistanceOptimization } from '@/hooks/ai/useDistanceOptimization';

interface OptimizedDistanceCalculatorProps {
  ubicaciones: Ubicacion[];
  onDistanceCalculated: (distanciaTotal: number, tiempoEstimado: number) => void;
  onUbicacionesOptimizadas?: (ubicaciones: Ubicacion[]) => void;
  distanciaTotal?: number;
  tiempoEstimado?: number;
}

export function OptimizedDistanceCalculator({
  ubicaciones,
  onDistanceCalculated,
  onUbicacionesOptimizadas,
  distanciaTotal,
  tiempoEstimado
}: OptimizedDistanceCalculatorProps) {
  const [lastCalculation, setLastCalculation] = useState<Date | null>(null);
  const [showOptimizationDetails, setShowOptimizationDetails] = useState(false);
  
  const {
    optimizationResult,
    isOptimizing,
    isCalculating,
    optimizarRuta,
    calcularRutaSimple,
    limpiarOptimizacion,
    aplicarOptimizacion,
    tieneOptimizacion,
    tieneAhorro
  } = useDistanceOptimization();

  const canCalculate = ubicaciones.length >= 2 && 
    ubicaciones.some(u => u.tipoUbicacion === 'Origen') &&
    ubicaciones.some(u => u.tipoUbicacion === 'Destino');

  const canOptimize = canCalculate && ubicaciones.length >= 3;

  // Auto-calcular cuando se completan ubicaciones válidas
  useEffect(() => {
    const shouldAutoCalculate = canCalculate && 
      ubicaciones.length >= 2 && 
      !distanciaTotal && 
      !isCalculating &&
      !isOptimizing;

    if (shouldAutoCalculate) {
      console.log('🔄 Auto-calculando ruta...');
      handleCalculateBasic();
    }
  }, [ubicaciones.length, canCalculate]);

  // Aplicar resultados de optimización
  useEffect(() => {
    if (optimizationResult) {
      onDistanceCalculated(optimizationResult.distanciaTotal, optimizationResult.tiempoTotal);
      setLastCalculation(new Date());
    }
  }, [optimizationResult]);

  const handleCalculateBasic = () => {
    if (!canCalculate || isCalculating || isOptimizing) return;
    
    calcularRutaSimple(ubicaciones);
  };

  const handleOptimizeRoute = () => {
    if (!canOptimize || isOptimizing || isCalculating) return;
    
    optimizarRuta(ubicaciones);
    setShowOptimizationDetails(true);
  };

  const handleApplyOptimization = () => {
    if (onUbicacionesOptimizadas && optimizationResult) {
      aplicarOptimizacion(onUbicacionesOptimizadas);
    }
  };

  const handleReset = () => {
    limpiarOptimizacion();
    setShowOptimizationDetails(false);
    setLastCalculation(null);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const isCalculatingState = isCalculating || isOptimizing;
  const hasValidResult = distanciaTotal && tiempoEstimado;

  return (
    <div className="space-y-4">
      {/* Calculadora Principal */}
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Sparkles className="h-5 w-5" />
            Calculadora Inteligente de Distancias
            {hasValidResult && (
              <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Calculada
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Advertencias */}
          {!canCalculate && (
            <Alert className="border-yellow-300 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Ubicaciones requeridas:</strong> Necesitas al menos un origen y un destino con domicilios completos
              </AlertDescription>
            </Alert>
          )}

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleCalculateBasic}
              disabled={!canCalculate || isCalculatingState}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Calculando...
                </>
              ) : (
                <>
                  <Route className="h-4 w-4 mr-2" />
                  {hasValidResult ? 'Recalcular Ruta' : 'Calcular Distancia'}
                </>
              )}
            </Button>

            <Button
              onClick={handleOptimizeRoute}
              disabled={!canOptimize || isCalculatingState}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              size="lg"
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Optimizando con IA...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Optimizar con IA
                </>
              )}
            </Button>

            {tieneOptimizacion && (
              <Button
                onClick={handleReset}
                variant="outline"
                size="lg"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
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
                  Requerido SAT
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
        </CardContent>
      </Card>

      {/* Resultados de Optimización */}
      {tieneOptimizacion && showOptimizationDetails && (
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <TrendingUp className="h-5 w-5" />
              Resultados de Optimización IA
              {tieneAhorro && (
                <Badge className="ml-auto bg-purple-600 text-white">
                  ¡Ruta Mejorada!
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {tieneAhorro ? (
              <>
                <Alert className="border-green-300 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>¡Optimización exitosa!</strong> Se encontró una ruta más eficiente para tus ubicaciones.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <div className="text-sm text-gray-600 mb-1">Ahorro en Distancia</div>
                    <div className="text-xl font-bold text-green-600">
                      -{optimizationResult!.ahorroDistancia} km
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <div className="text-sm text-gray-600 mb-1">Ahorro en Tiempo</div>
                    <div className="text-xl font-bold text-blue-600">
                      -{optimizationResult!.ahorroTiempo} min
                    </div>
                  </div>
                </div>

                {onUbicacionesOptimizadas && (
                  <Button
                    onClick={handleApplyOptimization}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    size="lg"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Aplicar Optimización a las Ubicaciones
                  </Button>
                )}
              </>
            ) : (
              <Alert className="border-blue-300 bg-blue-50">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Ruta ya optimizada.</strong> El orden actual de ubicaciones es el más eficiente.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Nota informativa */}
      <div className="text-xs text-gray-600 bg-white p-3 rounded border">
        <strong>IA Inteligente:</strong> La optimización utiliza algoritmos avanzados de Mapbox y machine learning 
        para encontrar la ruta más eficiente, considerando tráfico real y condiciones de carretera.
        <br />
        <strong>SAT Compliance:</strong> Todos los cálculos cumplen con los requerimientos de distancia total obligatorios en Carta Porte v3.1.
      </div>
    </div>
  );
}
