
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Scale, Truck } from 'lucide-react';
import { MercanciaCompleta, AutotransporteCompleto } from '@/types/cartaPorte';

interface PesoTotalValidatorProps {
  mercancias: MercanciaCompleta[];
  autotransporte: AutotransporteCompleto;
  className?: string;
}

export function PesoTotalValidator({ mercancias, autotransporte, className }: PesoTotalValidatorProps) {
  // Calcular peso total de mercancías
  const pesoTotalMercancias = mercancias.reduce((total, mercancia) => {
    return total + (mercancia.peso_kg || 0);
  }, 0);

  // Peso bruto vehicular (incluye vehículo + mercancías)
  const pesoBrutoVehicular = autotransporte.peso_bruto_vehicular || 0;
  
  // Capacidad máxima del vehículo
  const capacidadMaxima = autotransporte.carga_maxima || 0;

  // Validaciones
  const hayMercancias = mercancias.length > 0;
  const hayAutotransporte = Boolean(autotransporte.placa_vm);
  const pesoVehiculoDefinido = pesoBrutoVehicular > 0;
  const capacidadDefinida = capacidadMaxima > 0;
  
  // Cálculo de sobrepeso
  const excedePesoMaximo = capacidadDefinida && pesoTotalMercancias > capacidadMaxima;
  const porcentajeCapacidad = capacidadDefinida ? (pesoTotalMercancias / capacidadMaxima) * 100 : 0;

  // Estados de validación
  const getEstadoValidacion = () => {
    if (!hayMercancias || !hayAutotransporte) {
      return { tipo: 'pendiente', mensaje: 'Completa mercancías y autotransporte para validar peso' };
    }
    
    if (!pesoVehiculoDefinido || !capacidadDefinida) {
      return { tipo: 'advertencia', mensaje: 'Define peso bruto vehicular y capacidad máxima' };
    }
    
    if (excedePesoMaximo) {
      return { tipo: 'error', mensaje: 'El peso de las mercancías excede la capacidad del vehículo' };
    }
    
    if (porcentajeCapacidad > 90) {
      return { tipo: 'advertencia', mensaje: 'Estás cerca del límite de capacidad del vehículo' };
    }
    
    return { tipo: 'exito', mensaje: 'El peso está dentro de los límites permitidos' };
  };

  const estado = getEstadoValidacion();

  const getIcono = () => {
    switch (estado.tipo) {
      case 'exito':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'advertencia':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Scale className="h-4 w-4 text-blue-600" />;
    }
  };

  const getColorAlert = () => {
    switch (estado.tipo) {
      case 'exito':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'advertencia':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className={className}>
      <Alert className={getColorAlert()}>
        {getIcono()}
        <AlertDescription>
          <div className="space-y-3">
            <div className="font-medium">{estado.mensaje}</div>
            
            {/* Métricas de peso */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Scale className="h-3 w-3" />
                <span>Peso Mercancías:</span>
                <Badge variant="outline">
                  {pesoTotalMercancias.toFixed(2)} kg
                </Badge>
              </div>
              
              {capacidadDefinida && (
                <div className="flex items-center gap-2">
                  <Truck className="h-3 w-3" />
                  <span>Capacidad Máxima:</span>
                  <Badge variant="outline">
                    {capacidadMaxima.toFixed(2)} kg
                  </Badge>
                </div>
              )}
              
              {capacidadDefinida && (
                <div className="flex items-center gap-2">
                  <span>Uso de Capacidad:</span>
                  <Badge 
                    variant={porcentajeCapacidad > 90 ? 'destructive' : 'default'}
                    className={porcentajeCapacidad > 100 ? 'bg-red-600' : ''}
                  >
                    {porcentajeCapacidad.toFixed(1)}%
                  </Badge>
                </div>
              )}
            </div>

            {/* Recomendaciones */}
            {estado.tipo === 'error' && (
              <div className="text-red-800 text-sm">
                <strong>Recomendaciones:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Reduce la cantidad de mercancías</li>
                  <li>Distribuye la carga en múltiples viajes</li>
                  <li>Considera usar un vehículo de mayor capacidad</li>
                </ul>
              </div>
            )}

            {estado.tipo === 'advertencia' && porcentajeCapacidad > 90 && (
              <div className="text-yellow-800 text-sm">
                <strong>Nota:</strong> Estás utilizando más del 90% de la capacidad del vehículo.
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
