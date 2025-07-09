
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calculator, 
  ChevronDown, 
  ChevronUp, 
  Fuel, 
  MapPin, 
  Calendar, 
  Wrench, 
  Building,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { useCalculadoraCostosProfesional, useComparacionCalculos } from '@/hooks/useCalculadoraCostosProfesional';
import { VehiculoConCostos } from '@/types/calculoCostos';

interface CostBreakdownCardProfesionalProps {
  distancia: number;
  tiempoEstimadoHoras?: number;
  vehiculo?: VehiculoConCostos;
  pesoMercancia?: number;
  tipoServicio?: string;
  showBasicComparison?: boolean;
}

export function CostBreakdownCardProfesional({
  distancia,
  tiempoEstimadoHoras,
  vehiculo,
  pesoMercancia,
  tipoServicio,
  showBasicComparison = true
}: CostBreakdownCardProfesionalProps) {
  const [expanded, setExpanded] = useState(false);
  
  const calculoProfesional = useCalculadoraCostosProfesional({
    distancia,
    tiempoEstimadoHoras,
    vehiculo,
    pesoMercancia,
    tipoServicio
  });

  const comparacion = useComparacionCalculos({
    distancia,
    tiempoEstimadoHoras,
    vehiculo,
    pesoMercancia,
    tipoServicio
  });

  if (!calculoProfesional) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Ingresa la distancia para calcular costos</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getConfiabilidadColor = (confiabilidad: string) => {
    switch (confiabilidad) {
      case 'alta': return 'bg-green-100 text-green-800';
      case 'media': return 'bg-yellow-100 text-yellow-800';
      case 'baja': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Cálculo Profesional de Costos
          </CardTitle>
          <div className="flex items-center gap-2">
            {comparacion && (
              <Badge className={getConfiabilidadColor(comparacion.confiabilidad)}>
                Precisión: {comparacion.confiabilidad}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {expanded ? 'Ocultar' : 'Ver'} desglose
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Resumen Principal */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-blue-900">Costo Total Estimado</h3>
              <p className="text-2xl font-bold text-blue-600">
                ${calculoProfesional.costoTotal.toLocaleString('es-MX')} MXN
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-700">Precio sugerido de venta</p>
              <p className="text-xl font-bold text-green-600">
                ${calculoProfesional.precioVentaSugerido.toLocaleString('es-MX')} MXN
              </p>
              <p className="text-sm text-gray-600">
                Margen: {calculoProfesional.margenSugerido}%
              </p>
            </div>
          </div>
        </div>

        {/* Comparación con Cálculo Básico */}
        {showBasicComparison && comparacion && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Mejora vs Cálculo Básico</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Básico</p>
                <p className="font-bold">${comparacion.calculoBasico.toLocaleString('es-MX')}</p>
              </div>
              <div>
                <p className="text-gray-600">Profesional</p>
                <p className="font-bold text-blue-600">${comparacion.calculoProfesional.toLocaleString('es-MX')}</p>
              </div>
              <div>
                <p className="text-gray-600">Precisión</p>
                <p className="font-bold text-green-600">+{comparacion.porcentajeMejora.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}

        {/* Desglose Detallado */}
        {expanded && (
          <div className="space-y-4">
            {/* Combustible */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Fuel className="h-4 w-4 text-orange-600" />
                <span className="font-medium">Combustible</span>
                <Badge variant="outline">${calculoProfesional.combustible.costo.toLocaleString('es-MX')}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>Litros estimados: {calculoProfesional.combustible.litros}L</div>
                <div>Precio: ${calculoProfesional.combustible.precio_litro}/L</div>
                <div>Fuente: {calculoProfesional.combustible.fuente}</div>
              </div>
            </div>

            {/* Peajes */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Peajes</span>
                <Badge variant="outline">${calculoProfesional.peajes.costo.toLocaleString('es-MX')}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>Casetas estimadas: {calculoProfesional.peajes.casetas_estimadas}</div>
                <div>Factor ejes: {calculoProfesional.peajes.factor}x</div>
              </div>
            </div>

            {/* Viáticos */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="font-medium">Viáticos</span>
                <Badge variant="outline">${calculoProfesional.viaticos.costo.toLocaleString('es-MX')}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>Días estimados: {calculoProfesional.viaticos.dias}</div>
                <div>Tarifa diaria: ${calculoProfesional.viaticos.tarifa_diaria}</div>
              </div>
            </div>

            {/* Mantenimiento */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Mantenimiento</span>
                <Badge variant="outline">${calculoProfesional.mantenimiento.costo.toLocaleString('es-MX')}</Badge>
              </div>
              <div className="text-sm text-gray-600">
                Costo por km: ${calculoProfesional.mantenimiento.costo_por_km.toFixed(2)}
              </div>
            </div>

            {/* Costos Fijos */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-4 w-4 text-gray-600" />
                <span className="font-medium">Costos Fijos</span>
                <Badge variant="outline">${calculoProfesional.costos_fijos.costo.toLocaleString('es-MX')}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>Depreciación: ${calculoProfesional.costos_fijos.depreciacion}</div>
                <div>Seguros: ${calculoProfesional.costos_fijos.seguros}</div>
                <div>Administración: ${calculoProfesional.costos_fijos.administracion}</div>
              </div>
            </div>
          </div>
        )}

        {/* Alertas */}
        {calculoProfesional.alertas.length > 0 && (
          <div className="space-y-2">
            {calculoProfesional.alertas.map((alerta, index) => (
              <Alert key={index} className={
                alerta.tipo === 'error' ? 'border-red-200 bg-red-50' :
                alerta.tipo === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                'border-blue-200 bg-blue-50'
              }>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">{alerta.mensaje}</p>
                    {alerta.impacto && <p className="text-sm text-gray-600">Impacto: {alerta.impacto}</p>}
                    {alerta.solucion && <p className="text-sm text-gray-600">Solución: {alerta.solucion}</p>}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Información adicional */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p><strong>Cálculo basado en:</strong></p>
          <ul className="mt-1 space-y-1">
            <li>• Distancia: {distancia} km</li>
            <li>• Tiempo estimado: {tiempoEstimadoHoras ? `${tiempoEstimadoHoras}h` : 'Calculado automáticamente'}</li>
            <li>• Precisión: {calculoProfesional.precisionMejora}</li>
            <li>• Precios combustible actualizados a 2024</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
