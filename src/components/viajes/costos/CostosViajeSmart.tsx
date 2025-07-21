
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown, 
  Fuel, 
  Truck, 
  User, 
  Wrench,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Save
} from 'lucide-react';
import { useCostosViaje } from '@/hooks/useCostosViaje';
import { Viaje } from '@/types/viaje';
import { toast } from 'sonner';

interface CostosViajeSmartProps {
  viaje: Viaje;
  onCostosUpdate?: () => void;
}

export const CostosViajeSmart: React.FC<CostosViajeSmartProps> = ({
  viaje,
  onCostosUpdate
}) => {
  const { 
    costos, 
    calcularCostoEstimado, 
    sugerirPrecio, 
    crearCostosEstimados,
    actualizarCostosReales,
    loading 
  } = useCostosViaje(viaje.id);

  const [editMode, setEditMode] = useState(false);
  const [precioClienteDeseado, setPrecioClienteDeseado] = useState(viaje.precio_cobrado || 0);
  const [justificacion, setJustificacion] = useState('');

  // Calcular costos estimados inteligentes
  const costosEstimados = calcularCostoEstimado(
    viaje.distancia_km || 0,
    'camion', // Podríamos obtener esto del vehículo asignado
    true
  );

  const precioSugerido = sugerirPrecio(costosEstimados.costo_total_estimado, 25);
  const margenEstimado = precioClienteDeseado - costosEstimados.costo_total_estimado;
  const margenPorcentaje = costosEstimados.costo_total_estimado > 0 
    ? ((margenEstimado / costosEstimados.costo_total_estimado) * 100).toFixed(1)
    : '0';

  const handleGuardarCostos = async () => {
    try {
      if (costos) {
        // Actualizar costos existentes
        await actualizarCostosReales(viaje.id, {
          precio_final_cobrado: precioClienteDeseado
        }, precioClienteDeseado);
      } else {
        // Crear costos nuevos
        await crearCostosEstimados(viaje.id, costosEstimados, precioClienteDeseado);
      }
      
      setEditMode(false);
      onCostosUpdate?.(());
      toast.success('Costos actualizados correctamente');
    } catch (error) {
      console.error('Error guardando costos:', error);
      toast.error('Error al guardar los costos');
    }
  };

  const getMargenColor = () => {
    const porcentaje = parseFloat(margenPorcentaje);
    if (porcentaje >= 20) return 'text-green-600 bg-green-50';
    if (porcentaje >= 10) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getMargenIcon = () => {
    const porcentaje = parseFloat(margenPorcentaje);
    if (porcentaje >= 20) return <TrendingUp className="h-4 w-4" />;
    if (porcentaje >= 0) return <TrendingDown className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header con estado y acciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Gestión Inteligente de Costos
              {costos && (
                <Badge variant="outline" className="ml-2">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Registrado
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              {!editMode ? (
                <Button onClick={() => setEditMode(true)} variant="outline">
                  Editar Costos
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={() => setEditMode(false)} 
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleGuardarCostos} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Guardando...' : 'Guardar'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Resumen de precios y márgenes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Precio Sugerido</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              ${precioSugerido.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Basado en costos + 25% margen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Precio Cliente</span>
            </div>
            <div className="text-2xl font-bold">
              {editMode ? (
                <Input
                  type="number"
                  value={precioClienteDeseado}
                  onChange={(e) => setPrecioClienteDeseado(Number(e.target.value))}
                  className="text-lg font-bold h-auto p-1"
                />
              ) : (
                `$${precioClienteDeseado.toLocaleString()}`
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Precio acordado con cliente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              {getMargenIcon()}
              <span className="text-sm font-medium">Margen</span>
            </div>
            <div className={`text-2xl font-bold ${getMargenColor().split(' ')[0]}`}>
              {margenPorcentaje}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              ${margenEstimado.toLocaleString()} de ganancia
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerta de margen bajo */}
      {parseFloat(margenPorcentaje) < 10 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Margen bajo detectado:</strong> El margen del {margenPorcentaje}% está por debajo del recomendado (20%). 
            Considera ajustar el precio o revisar los costos.
          </AlertDescription>
        </Alert>
      )}

      {/* Desglose detallado de costos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Desglose de Costos Estimados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Fuel className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Combustible</p>
                <p className="font-semibold">${costosEstimados.combustible_estimado.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg">
              <Truck className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-xs text-muted-foreground">Peajes</p>
                <p className="font-semibold">${costosEstimados.peajes_estimados.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
              <User className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-xs text-muted-foreground">Conductor</p>
                <p className="font-semibold">${costosEstimados.salario_conductor_estimado.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
              <Wrench className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-xs text-muted-foreground">Mantenimiento</p>
                <p className="font-semibold">${costosEstimados.mantenimiento_estimado.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Costos Estimados:</span>
            <span>${costosEstimados.costo_total_estimado.toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Justificación para cambios */}
      {editMode && Math.abs(precioClienteDeseado - precioSugerido) > (precioSugerido * 0.1) && (
        <Card>
          <CardHeader>
            <CardTitle>Justificación del Precio</CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="justificacion">
              El precio difiere significativamente del sugerido. Por favor justifica:
            </Label>
            <Textarea
              id="justificacion"
              value={justificacion}
              onChange={(e) => setJustificacion(e.target.value)}
              placeholder="Ej: Cliente solicita descuento por volumen, condiciones especiales de la ruta, etc."
              className="mt-2"
            />
          </CardContent>
        </Card>
      )}

      {/* Información del viaje */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Viaje</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Distancia</p>
              <p className="font-semibold">{viaje.distancia_km || 0} km</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tiempo Est.</p>
              <p className="font-semibold">{viaje.tiempo_estimado_horas || 0} hrs</p>
            </div>
            <div>
              <p className="text-muted-foreground">Estado</p>
              <Badge variant="outline">{viaje.estado}</Badge>
            </div>
            <div>
              <p className="text-muted-foreground">Carta Porte</p>
              <p className="font-semibold">{viaje.carta_porte_id}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
