
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calculator, TrendingUp, AlertCircle, Truck, Clock, MapPin } from 'lucide-react';
import { useCostosViajeProfesional } from '@/hooks/useCostosViajeProfesional';
import { ConfiguracionVehicular, BENCHMARKS_VEHICULARES } from '@/types/vehiculosBenchmarks';
import { ParametrosCalculoCostos } from '@/services/costos/CostosCalculatorProfesional';

interface CalculadoraCostosProfesionalProps {
  distanciaKm: number;
  tiempoEstimadoHoras?: number;
  configuracionVehicular?: ConfiguracionVehicular;
  onCostosCalculados?: (resultado: any) => void;
}

export const CalculadoraCostosProfesional = ({
  distanciaKm,
  tiempoEstimadoHoras,
  configuracionVehicular = 'T3S2',
  onCostosCalculados
}: CalculadoraCostosProfesionalProps) => {
  const { calcularCostosProfesionales, calcularMargenRecomendado, loading } = useCostosViajeProfesional();
  
  const [configuracion, setConfiguracion] = useState<ConfiguracionVehicular>(configuracionVehicular);
  const [tipoOperacion, setTipoOperacion] = useState<'transporte_pesado' | 'ultima_milla'>('transporte_pesado');
  const [numeroParadas, setNumeroParadas] = useState(1);
  const [materialesPeligrosos, setMaterialesPeligrosos] = useState(false);
  const [factorUrgencia, setFactorUrgencia] = useState(false);
  const [resultado, setResultado] = useState<any>(null);

  const ejecutarCalculo = async () => {
    if (!distanciaKm || distanciaKm <= 0) return;

    const parametros: ParametrosCalculoCostos = {
      distanciaKm,
      tiempoEstimadoHoras,
      configuracionVehicular: configuracion,
      tipoOperacion,
      numeroParadas: tipoOperacion === 'ultima_milla' ? numeroParadas : undefined,
      materialesPeligrosos,
      factorUrgencia,
      zonaUrbana: tipoOperacion === 'ultima_milla'
    };

    try {
      const resultadoCalculo = await calcularCostosProfesionales(parametros);
      const margenes = calcularMargenRecomendado(resultadoCalculo.costoTotalVariable, tipoOperacion);
      
      const resultadoCompleto = {
        ...resultadoCalculo,
        margenes
      };
      
      setResultado(resultadoCompleto);
      onCostosCalculados?.(resultadoCompleto);
    } catch (error) {
      console.error('Error calculando costos:', error);
    }
  };

  useEffect(() => {
    ejecutarCalculo();
  }, [distanciaKm, configuracion, tipoOperacion, numeroParadas, materialesPeligrosos, factorUrgencia]);

  if (!distanciaKm || distanciaKm <= 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculadora Profesional de Costos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Especifica la distancia para calcular costos profesionales</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Calculadora Profesional de Costos
          <Badge variant="secondary">Benchmarks IMT/CANACAR</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Configuración del Cálculo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Configuración Vehicular</Label>
            <Select value={configuracion} onValueChange={(value) => setConfiguracion(value as ConfiguracionVehicular)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BENCHMARKS_VEHICULARES).map(([key, benchmark]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      <span>{benchmark.configuracion} - {benchmark.descripcion}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Operación</Label>
            <Select value={tipoOperacion} onValueChange={(value) => setTipoOperacion(value as 'transporte_pesado' | 'ultima_milla')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transporte_pesado">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span>Transporte Pesado</span>
                  </div>
                </SelectItem>
                <SelectItem value="ultima_milla">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Última Milla</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Parámetros adicionales */}
        <div className="grid grid-cols-3 gap-4">
          {tipoOperacion === 'ultima_milla' && (
            <div className="space-y-2">
              <Label>Número de Paradas</Label>
              <Input
                type="number"
                value={numeroParadas}
                onChange={(e) => setNumeroParadas(parseInt(e.target.value) || 1)}
                min="1"
                max="50"
              />
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="urgencia"
              checked={factorUrgencia}
              onChange={(e) => setFactorUrgencia(e.target.checked)}
            />
            <Label htmlFor="urgencia">Factor Urgencia (+15%)</Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="peligrosos"
              checked={materialesPeligrosos}
              onChange={(e) => setMaterialesPeligrosos(e.target.checked)}
            />
            <Label htmlFor="peligrosos">Materiales Peligrosos (+40%)</Label>
          </div>
        </div>

        {/* Información del vehículo seleccionado */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">Especificaciones Técnicas</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Rendimiento:</span>
              <p className="font-medium">{BENCHMARKS_VEHICULARES[configuracion].rendimiento_km_por_litro} km/L</p>
            </div>
            <div>
              <span className="text-muted-foreground">Ejes:</span>
              <p className="font-medium">{BENCHMARKS_VEHICULARES[configuracion].numero_ejes}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Llantas:</span>
              <p className="font-medium">{BENCHMARKS_VEHICULARES[configuracion].numero_llantas}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Capacidad:</span>
              <p className="font-medium">{BENCHMARKS_VEHICULARES[configuracion].capacidad_carga_toneladas} ton</p>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">Calculando costos profesionales...</span>
          </div>
        )}

        {resultado && !loading && (
          <>
            {/* Desglose de Costos */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Desglose Detallado de Costos
              </h4>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Combustible:</span>
                  <span className="text-sm font-medium">${resultado.costos.combustible.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Llantas (desgaste):</span>
                  <span className="text-sm font-medium">${resultado.costos.llantas.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Mantenimiento:</span>
                  <span className="text-sm font-medium">${resultado.costos.mantenimiento.toFixed(2)}</span>
                </div>
                {resultado.costos.viaticos > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm">Viáticos:</span>
                    <span className="text-sm font-medium">${resultado.costos.viaticos.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm">Conductor:</span>
                  <span className="text-sm font-medium">${resultado.costos.conductor.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Peajes estimados:</span>
                  <span className="text-sm font-medium">${resultado.costos.peajes_estimados.toFixed(2)}</span>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-medium text-lg">
                  <span>Costo Total Variable:</span>
                  <span className="text-primary">${resultado.costoTotalVariable.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Sugerencias de Precio */}
            <div className="space-y-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-medium text-primary">Sugerencias de Precio de Venta</h4>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <Badge variant="destructive" className="mb-1">Mínimo</Badge>
                  <p className="text-lg font-bold">${resultado.margenes.precioMinimo.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{resultado.margenes.margenes.minimo}% margen</p>
                </div>
                <div className="text-center">
                  <Badge variant="default" className="mb-1">Objetivo</Badge>
                  <p className="text-lg font-bold text-primary">${resultado.margenes.precioObjetivo.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{resultado.margenes.margenes.objetivo}% margen</p>
                </div>
                <div className="text-center">
                  <Badge variant="secondary" className="mb-1">Excelente</Badge>
                  <p className="text-lg font-bold text-green-600">${resultado.margenes.precioExcelente.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{resultado.margenes.margenes.excelente}% margen</p>
                </div>
              </div>
            </div>

            {/* Recomendaciones */}
            {resultado.recomendaciones.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Recomendaciones</h4>
                <div className="space-y-1">
                  {resultado.recomendaciones.map((rec: string, index: number) => (
                    <div key={index} className="text-sm p-2 bg-muted/30 rounded flex items-start gap-2">
                      <AlertCircle className="h-3 w-3 mt-0.5 text-yellow-600" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Métricas de rendimiento */}
            {tipoOperacion === 'ultima_milla' && resultado.costoPorHora && (
              <div className="p-3 bg-muted/30 rounded-lg">
                <h4 className="font-medium mb-2">Métricas de Última Milla</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Costo por Hora:</span>
                    <p className="font-medium">${resultado.costoPorHora.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Costo por Parada:</span>
                    <p className="font-medium">${resultado.costoPorParada.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Recalcular */}
        <Button onClick={ejecutarCalculo} disabled={loading} className="w-full">
          <Calculator className="h-4 w-4 mr-2" />
          {loading ? 'Calculando...' : 'Recalcular Costos'}
        </Button>
      </CardContent>
    </Card>
  );
};
