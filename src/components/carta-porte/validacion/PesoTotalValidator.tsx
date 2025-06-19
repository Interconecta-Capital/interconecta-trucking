
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Scale, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { MercanciaCompleta, AutotransporteCompleto } from '@/types/cartaPorte';

interface PesoTotalValidatorProps {
  mercancias: MercanciaCompleta[];
  autotransporte: AutotransporteCompleto;
  className?: string;
}

export function PesoTotalValidator({ mercancias, autotransporte, className }: PesoTotalValidatorProps) {
  const validacion = useMemo(() => {
    // Calcular peso total de mercancías correctamente
    const pesoTotalMercancias = mercancias.reduce((total, mercancia) => {
      const cantidad = Number(mercancia.cantidad) || 0;
      const pesoUnitario = Number(mercancia.peso_kg) || 0;
      return total + (cantidad * pesoUnitario);
    }, 0);

    // Capacidad del vehículo
    const capacidadVehiculo = Number(autotransporte.capacidad_carga) || Number(autotransporte.peso_bruto_vehicular) || 0;
    
    // Calcular porcentaje de capacidad utilizada
    const porcentajeUtilizado = capacidadVehiculo > 0 
      ? Math.round((pesoTotalMercancias / capacidadVehiculo) * 100 * 100) / 100 
      : 0;

    // Determinar estado
    let estado: 'seguro' | 'advertencia' | 'critico' = 'seguro';
    let mensaje = '';
    let color = 'green';

    if (capacidadVehiculo === 0) {
      estado = 'advertencia';
      mensaje = 'No se ha especificado la capacidad del vehículo';
      color = 'yellow';
    } else if (pesoTotalMercancias > capacidadVehiculo) {
      estado = 'critico';
      mensaje = 'El peso total excede la capacidad del vehículo';
      color = 'red';
    } else if (porcentajeUtilizado > 90) {
      estado = 'advertencia';
      mensaje = 'Capacidad del vehículo casi al límite';
      color = 'yellow';
    } else {
      mensaje = `Capacidad segura del vehículo (${porcentajeUtilizado}% utilizada)`;
      color = 'green';
    }

    return {
      pesoTotalMercancias,
      capacidadVehiculo,
      porcentajeUtilizado,
      estado,
      mensaje,
      color
    };
  }, [mercancias, autotransporte]);

  const getIcon = () => {
    switch (validacion.estado) {
      case 'seguro':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'advertencia':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critico':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Scale className="h-4 w-4" />;
    }
  };

  const getBadgeVariant = () => {
    switch (validacion.estado) {
      case 'seguro':
        return 'default';
      case 'advertencia':
        return 'secondary';
      case 'critico':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Validador de Peso Total
          <Badge variant={getBadgeVariant()}>
            {getIcon()}
            {validacion.estado === 'seguro' ? 'Válido' : 
             validacion.estado === 'advertencia' ? 'Atención' : 'Crítico'}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Resumen de pesos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-blue-800">Peso Total Mercancías</div>
            <div className="text-2xl font-bold text-blue-900">
              {validacion.pesoTotalMercancias.toLocaleString()} kg
            </div>
            <div className="text-xs text-blue-600">
              {mercancias.length} mercancía(s)
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm font-medium text-gray-800">Capacidad Vehículo</div>
            <div className="text-2xl font-bold text-gray-900">
              {validacion.capacidadVehiculo > 0 
                ? `${validacion.capacidadVehiculo.toLocaleString()} kg`
                : 'No especificada'
              }
            </div>
            <div className="text-xs text-gray-600">
              {autotransporte.placa_vm || 'Sin placa'}
            </div>
          </div>

          <div className={`p-3 rounded-lg ${
            validacion.color === 'green' ? 'bg-green-50' :
            validacion.color === 'yellow' ? 'bg-yellow-50' : 'bg-red-50'
          }`}>
            <div className={`text-sm font-medium ${
              validacion.color === 'green' ? 'text-green-800' :
              validacion.color === 'yellow' ? 'text-yellow-800' : 'text-red-800'
            }`}>
              Capacidad Utilizada
            </div>
            <div className={`text-2xl font-bold ${
              validacion.color === 'green' ? 'text-green-900' :
              validacion.color === 'yellow' ? 'text-yellow-900' : 'text-red-900'
            }`}>
              {validacion.porcentajeUtilizado}%
            </div>
            <div className={`text-xs ${
              validacion.color === 'green' ? 'text-green-600' :
              validacion.color === 'yellow' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {validacion.capacidadVehiculo > 0 ? 
                `${(validacion.capacidadVehiculo - validacion.pesoTotalMercancias).toLocaleString()} kg disponibles` :
                'Capacidad no definida'
              }
            </div>
          </div>
        </div>

        {/* Mensaje de estado */}
        <Alert className={
          validacion.color === 'green' ? 'border-green-200 bg-green-50' :
          validacion.color === 'yellow' ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'
        }>
          {getIcon()}
          <AlertDescription className={
            validacion.color === 'green' ? 'text-green-800' :
            validacion.color === 'yellow' ? 'text-yellow-800' : 'text-red-800'
          }>
            <strong>Validación de Peso:</strong> {validacion.mensaje}
          </AlertDescription>
        </Alert>

        {/* Desglose por mercancía */}
        {mercancias.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Desglose por Mercancía:</h4>
            <div className="space-y-2">
              {mercancias.map((mercancia, index) => {
                const cantidad = Number(mercancia.cantidad) || 0;
                const pesoUnitario = Number(mercancia.peso_kg) || 0;
                const pesoTotal = cantidad * pesoUnitario;
                
                return (
                  <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                    <span className="font-medium">
                      {mercancia.descripcion || `Mercancía ${index + 1}`}
                    </span>
                    <span className="text-gray-600">
                      {cantidad} × {pesoUnitario} kg = <strong>{pesoTotal} kg</strong>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Nota informativa */}
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
          <strong>Nota:</strong> Esta validación calcula el peso total multiplicando la cantidad por el peso unitario de cada mercancía. 
          Es fundamental que estos datos sean precisos para cumplir con las regulaciones de transporte.
        </div>
      </CardContent>
    </Card>
  );
}
