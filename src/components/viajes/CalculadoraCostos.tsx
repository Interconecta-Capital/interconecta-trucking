import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { useCostosViaje } from '@/hooks/useCostosViaje';

interface CalculadoraCostosProps {
  distanciaKm: number;
  tipoVehiculo?: string;
  incluirConductor?: boolean;
  onCostosCalculados?: (costos: any, precioSugerido: number) => void;
}

export const CalculadoraCostos = ({
  distanciaKm,
  tipoVehiculo = 'camion',
  incluirConductor = true,
  onCostosCalculados
}: CalculadoraCostosProps) => {
  const { calcularCostoEstimado, sugerirPrecio } = useCostosViaje();
  const [costosEstimados, setCostosEstimados] = useState<any>(null);
  const [precioSugerido, setPrecioSugerido] = useState(0);
  const [margenObjetivo, setMargenObjetivo] = useState(25);
  const [precioPersonalizado, setPrecioPersonalizado] = useState('');

  // Calcular costos cuando cambian los parámetros
  useEffect(() => {
    if (distanciaKm > 0) {
      const costos = calcularCostoEstimado(distanciaKm, tipoVehiculo, incluirConductor);
      setCostosEstimados(costos);
      
      const precio = sugerirPrecio(costos.costo_total_estimado, margenObjetivo);
      setPrecioSugerido(precio);
      setPrecioPersonalizado(precio.toString());
      
      onCostosCalculados?.(costos, precio);
    }
  }, [distanciaKm, tipoVehiculo, incluirConductor, margenObjetivo]);

  const handlePrecioPersonalizadoChange = (valor: string) => {
    setPrecioPersonalizado(valor);
    const precio = parseFloat(valor) || 0;
    if (costosEstimados && precio > 0) {
      onCostosCalculados?.(costosEstimados, precio);
    }
  };

  const calcularMargenReal = () => {
    const precio = parseFloat(precioPersonalizado) || 0;
    if (costosEstimados && precio > 0) {
      const margen = precio - costosEstimados.costo_total_estimado;
      const porcentaje = (margen / precio) * 100;
      return { margen, porcentaje };
    }
    return { margen: 0, porcentaje: 0 };
  };

  const margenReal = calcularMargenReal();

  const getMargenColor = (porcentaje: number) => {
    if (porcentaje >= 20) return 'text-success';
    if (porcentaje >= 10) return 'text-warning';
    return 'text-destructive';
  };

  if (!costosEstimados || distanciaKm <= 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculadora de Costos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>Especifica la distancia para calcular costos</span>
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
          Calculadora de Costos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Parámetros del cálculo */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
          <div>
            <span className="text-sm text-muted-foreground">Distancia:</span>
            <p className="font-medium">{distanciaKm.toFixed(1)} km</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Tipo de vehículo:</span>
            <p className="font-medium capitalize">{tipoVehiculo}</p>
          </div>
        </div>

        {/* Desglose de costos */}
        <div className="space-y-3">
          <h4 className="font-medium">Desglose de Costos Estimados</h4>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Combustible:</span>
              <span className="text-sm font-medium">${costosEstimados.combustible_estimado.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Peajes y casetas:</span>
              <span className="text-sm font-medium">${costosEstimados.peajes_estimados.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Mantenimiento:</span>
              <span className="text-sm font-medium">${costosEstimados.mantenimiento_estimado.toFixed(2)}</span>
            </div>
            {incluirConductor && (
              <div className="flex justify-between">
                <span className="text-sm">Salario conductor:</span>
                <span className="text-sm font-medium">${costosEstimados.salario_conductor_estimado.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm">Otros gastos:</span>
              <span className="text-sm font-medium">${costosEstimados.otros_costos_estimados.toFixed(2)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between font-medium">
              <span>Costo Total Estimado:</span>
              <span className="text-lg">${costosEstimados.costo_total_estimado.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Configuración de margen */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="margen">Margen Objetivo (%)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="margen"
                type="number"
                value={margenObjetivo}
                onChange={(e) => setMargenObjetivo(parseFloat(e.target.value) || 0)}
                className="w-20 text-center"
                min="0"
                max="100"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
        </div>

        {/* Precio sugerido */}
        <div className="space-y-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary">Precio Sugerido</span>
          </div>
          
          <div className="text-2xl font-bold text-primary">
            ${precioSugerido.toFixed(2)}
          </div>
          
          <div className="text-sm text-muted-foreground">
            Basado en {margenObjetivo}% de margen sobre costos
          </div>
        </div>

        {/* Precio personalizado */}
        <div className="space-y-3">
          <Label htmlFor="precio-personalizado">Precio Final a Cotizar</Label>
          <Input
            id="precio-personalizado"
            type="number"
            value={precioPersonalizado}
            onChange={(e) => handlePrecioPersonalizadoChange(e.target.value)}
            placeholder="Precio a cotizar"
            className="text-lg font-medium"
          />
        </div>

        {/* Análisis de margen real */}
        {parseFloat(precioPersonalizado) > 0 && (
          <div className="space-y-3 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">Análisis de Rentabilidad</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Margen:</span>
                <p className={`font-medium ${getMargenColor(margenReal.porcentaje)}`}>
                  ${margenReal.margen.toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Margen (%):</span>
                <p className={`font-medium ${getMargenColor(margenReal.porcentaje)}`}>
                  {margenReal.porcentaje.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <Badge 
                variant={margenReal.porcentaje >= 20 ? "default" : margenReal.porcentaje >= 10 ? "secondary" : "destructive"}
              >
                {margenReal.porcentaje >= 20 ? 'Margen Excelente' : 
                 margenReal.porcentaje >= 10 ? 'Margen Aceptable' : 'Margen Bajo'}
              </Badge>
            </div>
          </div>
        )}

        {/* Consejos */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>💡 Recomendaciones:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Margen mínimo recomendado: 15%</li>
            <li>Considera factores como urgencia, cliente frecuente, etc.</li>
            <li>Los costos son estimados, pueden variar en la ejecución</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};