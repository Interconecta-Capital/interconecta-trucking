
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, 
  ChevronUp, 
  DollarSign, 
  Fuel, 
  Navigation, 
  Home, 
  Wrench, 
  Building,
  AlertTriangle,
  TrendingUp,
  Info
} from 'lucide-react';
import { CalculoProfesional } from '@/types/calculoCostos';

interface CostBreakdownCardProps {
  breakdown: CalculoProfesional;
  basicCost: number;
}

export function CostBreakdownCard({ breakdown, basicCost }: CostBreakdownCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const diferencia = breakdown.costoTotal - basicCost;
  const porcentajeMejora = Math.abs(diferencia / basicCost * 100);
  const esMasPreciso = Math.abs(diferencia) > basicCost * 0.05; // 5% diferencia mínima

  const getAlertIcon = (tipo: 'warning' | 'error' | 'info') => {
    switch (tipo) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertColor = (tipo: 'warning' | 'error' | 'info') => {
    switch (tipo) {
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'warning': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-900">
            <DollarSign className="h-5 w-5" />
            Análisis Inteligente de Costos
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {esMasPreciso ? `${Math.round(porcentajeMejora)}% más preciso` : 'Análisis profesional'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumen Principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-700">
              ${(isNaN(breakdown.costoTotal) ? 0 : breakdown.costoTotal).toLocaleString()}
            </div>
            <div className="text-sm text-green-600">Costo Total Calculado</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-700">
              {isNaN(breakdown.margenSugerido) ? 0 : breakdown.margenSugerido}%
            </div>
            <div className="text-sm text-blue-600">Margen Sugerido</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-700">
              ${(isNaN(breakdown.precioVentaSugerido) ? 0 : breakdown.precioVentaSugerido).toLocaleString()}
            </div>
            <div className="text-sm text-purple-600">Precio Venta Sugerido</div>
          </div>
        </div>

        {/* Comparación con Cálculo Básico */}
        {esMasPreciso && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800 mb-2">
              <TrendingUp className="h-4 w-4" />
              <span className="font-medium">Comparación con Cálculo Básico</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Cálculo Básico:</span>
                <span className="ml-2 font-medium">${basicCost.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Diferencia:</span>
                <span className={`ml-2 font-medium ${diferencia > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {diferencia > 0 ? '+' : ''}${diferencia.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Alertas */}
        {breakdown.alertas.length > 0 && (
          <div className="space-y-2">
            {breakdown.alertas.map((alerta, index) => (
              <div key={index} className={`p-3 border rounded-lg ${getAlertColor(alerta.tipo)}`}>
                <div className="flex items-start gap-2">
                  {getAlertIcon(alerta.tipo)}
                  <div className="flex-1">
                    <p className="font-medium">{alerta.mensaje}</p>
                    {alerta.impacto && (
                      <p className="text-sm mt-1 opacity-80">Impacto: {alerta.impacto}</p>
                    )}
                    {alerta.solucion && (
                      <p className="text-sm mt-1 font-medium">💡 {alerta.solucion}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Desglose Detallado - Colapsible */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full flex items-center justify-between">
              <span>Ver Desglose Detallado</span>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Combustible */}
              <div className="p-4 bg-white border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Fuel className="h-5 w-5 text-orange-500" />
                  <h4 className="font-medium">Combustible</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Litros estimados:</span>
                    <span className="font-medium">{breakdown.combustible.litros}L</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Precio por litro:</span>
                    <span className="font-medium">${breakdown.combustible.precio_litro}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fuente:</span>
                    <span className="text-gray-600">{breakdown.combustible.fuente}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Total:</span>
                    <span>${breakdown.combustible.costo.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Peajes */}
              <div className="p-4 bg-white border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Navigation className="h-5 w-5 text-blue-500" />
                  <h4 className="font-medium">Peajes</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Casetas estimadas:</span>
                    <span className="font-medium">{breakdown.peajes.casetas_estimadas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Factor vehicular:</span>
                    <span className="font-medium">{breakdown.peajes.factor}x</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Total:</span>
                    <span>${breakdown.peajes.costo.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Viáticos */}
              <div className="p-4 bg-white border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Home className="h-5 w-5 text-green-500" />
                  <h4 className="font-medium">Viáticos</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Días estimados:</span>
                    <span className="font-medium">{breakdown.viaticos.dias}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tarifa diaria:</span>
                    <span className="font-medium">${breakdown.viaticos.tarifa_diaria}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Total:</span>
                    <span>${breakdown.viaticos.costo.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Mantenimiento */}
              <div className="p-4 bg-white border rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="h-5 w-5 text-red-500" />
                  <h4 className="font-medium">Mantenimiento</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Costo por km:</span>
                    <span className="font-medium">${breakdown.mantenimiento.costo_por_km}</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-2">
                    <span>Total:</span>
                    <span>${breakdown.mantenimiento.costo.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Costos Fijos */}
            <div className="p-4 bg-white border rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Building className="h-5 w-5 text-purple-500" />
                <h4 className="font-medium">Costos Fijos Prorrateados</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Depreciación:</span>
                  <span className="font-medium">${breakdown.costos_fijos.depreciacion.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Seguros:</span>
                  <span className="font-medium">${breakdown.costos_fijos.seguros.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Administración:</span>
                  <span className="font-medium">${breakdown.costos_fijos.administracion.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between font-medium border-t pt-2 mt-2">
                <span>Total Costos Fijos:</span>
                <span>${breakdown.costos_fijos.costo.toLocaleString()}</span>
              </div>
            </div>

            {/* Mejora de Precisión */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
              <div className="text-center">
                <p className="font-medium text-green-800">{breakdown.precisionMejora}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Este cálculo considera datos específicos del vehículo y configuración de la empresa
                </p>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
