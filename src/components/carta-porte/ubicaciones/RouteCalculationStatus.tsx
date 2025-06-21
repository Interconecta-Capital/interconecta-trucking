
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertTriangle, MapPin } from 'lucide-react';

interface RouteCalculationStatusProps {
  isCalculating: boolean;
  hasUbicaciones: boolean;
  canCalculate: boolean;
}

export function RouteCalculationStatus({ 
  isCalculating, 
  hasUbicaciones, 
  canCalculate 
}: RouteCalculationStatusProps) {
  if (isCalculating) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            <div>
              <h4 className="font-medium text-blue-800">Calculando Ruta</h4>
              <p className="text-sm text-blue-600">
                Obteniendo la mejor ruta usando múltiples servicios...
              </p>
            </div>
            <Badge variant="outline" className="ml-auto bg-blue-100 text-blue-800">
              En proceso
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasUbicaciones) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-4 text-center">
          <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <h4 className="font-medium text-gray-600 mb-1">Sin Ubicaciones</h4>
          <p className="text-sm text-gray-500">
            Agregue ubicaciones de origen y destino para calcular la ruta
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!canCalculate) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-800">Datos Incompletos</h4>
              <p className="text-sm text-yellow-600">
                Se necesitan ubicaciones completas (origen y destino con direcciones válidas)
              </p>
            </div>
            <Badge variant="outline" className="ml-auto bg-yellow-100 text-yellow-800">
              Pendiente
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <div>
            <h4 className="font-medium text-green-800">Listo para Calcular</h4>
            <p className="text-sm text-green-600">
              Ubicaciones válidas detectadas. El cálculo iniciará automáticamente.
            </p>
          </div>
          <Badge variant="outline" className="ml-auto bg-green-100 text-green-800">
            Listo
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
