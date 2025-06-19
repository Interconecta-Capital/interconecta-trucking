
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface AlertaCapacidadVehiculoProps {
  pesoTotalMercancias: number;
  capacidadVehiculoToneladas: number;
}

export function AlertaCapacidadVehiculo({ 
  pesoTotalMercancias, 
  capacidadVehiculoToneladas 
}: AlertaCapacidadVehiculoProps) {
  
  // Convertir capacidad de toneladas a kg
  const capacidadKg = capacidadVehiculoToneladas * 1000;
  
  // No mostrar si no hay datos
  if (!pesoTotalMercancias || !capacidadVehiculoToneladas) {
    return null;
  }

  const excedeCapacidad = pesoTotalMercancias > capacidadKg;
  const porcentajeUso = (pesoTotalMercancias / capacidadKg) * 100;

  if (excedeCapacidad) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          **Alerta de Sobrecarga**: El peso total de la carga ({pesoTotalMercancias.toLocaleString('es-MX')} kg) 
          excede la capacidad máxima del vehículo ({capacidadKg.toLocaleString('es-MX')} kg). 
          Se recomienda seleccionar otro vehículo o reducir la carga.
        </AlertDescription>
      </Alert>
    );
  }

  // Alerta preventiva si está cerca del límite (>90%)
  if (porcentajeUso > 90) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          **Carga cerca del límite**: El peso total ({pesoTotalMercancias.toLocaleString('es-MX')} kg) 
          representa el {porcentajeUso.toFixed(1)}% de la capacidad del vehículo 
          ({capacidadKg.toLocaleString('es-MX')} kg). Considere revisar la distribución de la carga.
        </AlertDescription>
      </Alert>
    );
  }

  // Confirmación de capacidad segura
  return (
    <Alert className="border-green-200 bg-green-50">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-green-800">
        **Capacidad segura**: El peso total de la carga ({pesoTotalMercancias.toLocaleString('es-MX')} kg) 
        es seguro para el vehículo seleccionado. Capacidad utilizada: {porcentajeUso.toFixed(1)}%
      </AlertDescription>
    </Alert>
  );
}
