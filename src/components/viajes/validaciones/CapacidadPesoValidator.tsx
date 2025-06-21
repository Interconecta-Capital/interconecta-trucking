
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Scale, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  Info,
  Package
} from 'lucide-react';

interface MercanciaData {
  descripcion: string;
  peso_kg: number;
  cantidad: number;
  volumen_m3?: number;
}

interface VehiculoData {
  id: string;
  tipo: string;
  capacidad_peso_kg: number;
  capacidad_volumen_m3?: number;
  peso_vacio_kg?: number;
}

interface CapacidadPesoValidatorProps {
  mercancias: MercanciaData[];
  vehiculo: VehiculoData | null;
  className?: string;
}

export const CapacidadPesoValidator: React.FC<CapacidadPesoValidatorProps> = ({
  mercancias,
  vehiculo,
  className = ''
}) => {
  const [validacion, setValidacion] = useState<{
    pesoTotal: number;
    volumenTotal: number;
    porcentajePeso: number;
    porcentajeVolumen: number;
    status: 'ok' | 'warning' | 'error';
    alertas: string[];
  }>({
    pesoTotal: 0,
    volumenTotal: 0,
    porcentajePeso: 0,
    porcentajeVolumen: 0,
    status: 'ok',
    alertas: []
  });

  useEffect(() => {
    calcularValidacion();
  }, [mercancias, vehiculo]);

  const calcularValidacion = () => {
    if (!vehiculo || !mercancias.length) {
      setValidacion({
        pesoTotal: 0,
        volumenTotal: 0,
        porcentajePeso: 0,
        porcentajeVolumen: 0,
        status: 'ok',
        alertas: []
      });
      return;
    }

    // Calcular totales de mercancías
    const pesoTotal = mercancias.reduce((total, mercancia) => 
      total + (mercancia.peso_kg * mercancia.cantidad), 0
    );

    const volumenTotal = mercancias.reduce((total, mercancia) => 
      total + ((mercancia.volumen_m3 || 0) * mercancia.cantidad), 0
    );

    // Calcular porcentajes
    const porcentajePeso = (pesoTotal / vehiculo.capacidad_peso_kg) * 100;
    const porcentajeVolumen = vehiculo.capacidad_volumen_m3 
      ? (volumenTotal / vehiculo.capacidad_volumen_m3) * 100 
      : 0;

    // Determinar status y alertas
    let status: 'ok' | 'warning' | 'error' = 'ok';
    const alertas: string[] = [];

    if (porcentajePeso > 100) {
      status = 'error';
      alertas.push(`Peso excede la capacidad en ${(porcentajePeso - 100).toFixed(1)}%`);
    } else if (porcentajePeso > 90) {
      status = 'warning';
      alertas.push(`Peso cerca del límite: ${porcentajePeso.toFixed(1)}% de capacidad`);
    }

    if (vehiculo.capacidad_volumen_m3 && porcentajeVolumen > 100) {
      status = 'error';
      alertas.push(`Volumen excede la capacidad en ${(porcentajeVolumen - 100).toFixed(1)}%`);
    } else if (vehiculo.capacidad_volumen_m3 && porcentajeVolumen > 90) {
      if (status !== 'error') status = 'warning';
      alertas.push(`Volumen cerca del límite: ${porcentajeVolumen.toFixed(1)}% de capacidad`);
    }

    // Verificar peso del vehículo vacío vs carga
    if (vehiculo.peso_vacio_kg) {
      const pesoTotalVehiculo = vehiculo.peso_vacio_kg + pesoTotal;
      const limitePesoBruto = vehiculo.capacidad_peso_kg + vehiculo.peso_vacio_kg;
      
      if (pesoTotalVehiculo > limitePesoBruto) {
        status = 'error';
        alertas.push(`Peso bruto total excede límites legales`);
      }
    }

    // Validaciones adicionales de distribución de carga
    if (mercancias.length > 5) {
      alertas.push('Considerar distribución de carga con múltiples mercancías');
    }

    setValidacion({
      pesoTotal,
      volumenTotal,
      porcentajePeso,
      porcentajeVolumen,
      status,
      alertas
    });
  };

  const getStatusIcon = () => {
    switch (validacion.status) {
      case 'ok': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'error': return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    switch (validacion.status) {
      case 'ok': return 'text-green-600';
      case 'warning': return 'text-orange-600';
      case 'error': return 'text-red-600';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 100) return 'bg-red-500';
    if (percentage > 90) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const formatPeso = (kg: number) => {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(2)} ton`;
    }
    return `${kg.toFixed(2)} kg`;
  };

  if (!vehiculo) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-muted-foreground">
            <Info className="h-5 w-5 mr-2" />
            Selecciona un vehículo para validar capacidades
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Validación de Capacidades
          {getStatusIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumen de capacidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Peso */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4" />
                <span className="font-medium">Peso</span>
              </div>
              <Badge variant="outline" className={getStatusColor()}>
                {validacion.porcentajePeso.toFixed(1)}%
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Carga: {formatPeso(validacion.pesoTotal)}</span>
                <span>Capacidad: {formatPeso(vehiculo.capacidad_peso_kg)}</span>
              </div>
              <Progress 
                value={Math.min(validacion.porcentajePeso, 100)} 
                className="w-full"
              />
              {validacion.porcentajePeso > 100 && (
                <div className="text-xs text-red-600">
                  Exceso: {formatPeso(validacion.pesoTotal - vehiculo.capacidad_peso_kg)}
                </div>
              )}
            </div>
          </div>

          {/* Volumen */}
          {vehiculo.capacidad_volumen_m3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span className="font-medium">Volumen</span>
                </div>
                <Badge variant="outline" className={getStatusColor()}>
                  {validacion.porcentajeVolumen.toFixed(1)}%
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Carga: {validacion.volumenTotal.toFixed(2)} m³</span>
                  <span>Capacidad: {vehiculo.capacidad_volumen_m3.toFixed(2)} m³</span>
                </div>
                <Progress 
                  value={Math.min(validacion.porcentajeVolumen, 100)} 
                  className="w-full"
                />
                {validacion.porcentajeVolumen > 100 && (
                  <div className="text-xs text-red-600">
                    Exceso: {(validacion.volumenTotal - vehiculo.capacidad_volumen_m3).toFixed(2)} m³
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Información del vehículo */}
        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Vehículo: {vehiculo.tipo}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Capacidad peso:</span>
              <div className="font-medium">{formatPeso(vehiculo.capacidad_peso_kg)}</div>
            </div>
            {vehiculo.capacidad_volumen_m3 && (
              <div>
                <span className="text-muted-foreground">Capacidad volumen:</span>
                <div className="font-medium">{vehiculo.capacidad_volumen_m3} m³</div>
              </div>
            )}
            {vehiculo.peso_vacio_kg && (
              <div>
                <span className="text-muted-foreground">Peso vacío:</span>
                <div className="font-medium">{formatPeso(vehiculo.peso_vacio_kg)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Desglose de mercancías */}
        {mercancias.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Desglose de Mercancías</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {mercancias.map((mercancia, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded text-sm">
                  <div className="flex-1">
                    <div className="font-medium">{mercancia.descripcion}</div>
                    <div className="text-muted-foreground">
                      Cantidad: {mercancia.cantidad}
                    </div>
                  </div>
                  <div className="text-right">
                    <div>{formatPeso(mercancia.peso_kg * mercancia.cantidad)}</div>
                    {mercancia.volumen_m3 && (
                      <div className="text-muted-foreground">
                        {(mercancia.volumen_m3 * mercancia.cantidad).toFixed(2)} m³
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alertas */}
        {validacion.alertas.length > 0 && (
          <div className="space-y-2">
            {validacion.alertas.map((alerta, index) => (
              <Alert 
                key={index} 
                variant={validacion.status === 'error' ? 'destructive' : 'default'}
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{alerta}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Recomendaciones */}
        {validacion.status === 'ok' && validacion.porcentajePeso < 80 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Capacidades óptimas. El vehículo puede manejar carga adicional si es necesario.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
