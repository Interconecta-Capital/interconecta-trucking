
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useDataPopulation } from '@/hooks/useDataPopulation';
import { useDashboardCounts } from '@/hooks/useDashboardCounts';
import { 
  Database, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Wrench,
  Zap,
  Calendar,
  TrendingUp
} from 'lucide-react';

export function DataRepairPanel() {
  const { quickPopulate, populateSystemData, isLoading } = useDataPopulation();
  const { data: counts } = useDashboardCounts();
  
  const [options, setOptions] = useState({
    createMissingCosts: true,
    generateSampleAnalytics: true,
    createRouteBaselines: true,
    populateEmptyFields: true
  });

  const handleCustomRepair = () => {
    populateSystemData.mutate(options);
  };

  const dataStatus = [
    {
      label: 'Vehículos',
      count: counts?.vehiculos || 0,
      totalCount: counts?.vehiculos || 0,
      status: counts?.vehiculos ? 'ok' : 'warning',
      icon: CheckCircle
    },
    {
      label: 'Conductores', 
      count: counts?.conductores || 0,
      totalCount: counts?.conductores || 0,
      status: counts?.conductores ? 'ok' : 'warning',
      icon: CheckCircle
    },
    {
      label: 'Viajes',
      count: counts?.viajes_mes_actual || 0,
      totalCount: counts?.viajes || 0,
      status: counts?.viajes ? 'ok' : 'error',
      icon: counts?.viajes ? CheckCircle : AlertTriangle
    },
    {
      label: 'Cartas Porte',
      count: counts?.cartas_porte_mes_actual || 0,
      totalCount: counts?.cartas_porte || 0,
      status: counts?.cartas_porte ? 'ok' : 'warning',
      icon: counts?.cartas_porte ? CheckCircle : AlertTriangle
    }
  ];

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Wrench className="h-5 w-5" />
          Panel de Reparación de Datos
          <Badge variant="outline" className="ml-auto bg-blue-50 text-blue-700 border-blue-200">
            <Calendar className="h-3 w-3 mr-1" />
            Histórico Completo
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estado actual de datos mejorado */}
        <div>
          <h4 className="font-medium text-orange-800 mb-3">Estado Actual del Sistema</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {dataStatus.map((item) => {
              const Icon = item.icon;
              const showMonthly = item.label === 'Viajes' || item.label === 'Cartas Porte';
              return (
                <div key={item.label} className="flex flex-col gap-2 p-3 bg-white rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${
                      item.status === 'ok' ? 'text-green-600' :
                      item.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                    <div className="text-sm font-medium">{item.label}</div>
                  </div>
                  
                  <div className="space-y-1">
                    {showMonthly && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Este mes:</span>
                        <span className="font-medium">{item.count}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">{showMonthly ? 'Total:' : 'Cantidad:'}</span>
                      <span className="font-bold text-gray-900">{item.totalCount}</span>
                    </div>
                  </div>
                  
                  {item.totalCount > 0 && showMonthly && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <TrendingUp className="h-3 w-3" />
                      <span>Datos históricos</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Resumen general */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 text-blue-800">
              <Database className="h-4 w-4" />
              <span className="font-medium">Resumen de Integridad:</span>
            </div>
            <div className="mt-2 text-sm text-blue-700">
              Total de registros históricos: <strong>{(counts?.vehiculos || 0) + (counts?.conductores || 0) + (counts?.viajes || 0) + (counts?.cartas_porte || 0)}</strong>
              {counts?.viajes && counts.viajes > 0 && (
                <span className="ml-2">• {counts.viajes} viajes registrados desde el inicio</span>
              )}
            </div>
          </div>
        </div>

        {/* Reparación rápida */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-orange-800">Reparación Automática</h4>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              Recomendado
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Ejecuta una reparación completa automática del sistema de datos.
          </p>
          <Button 
            onClick={quickPopulate}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Reparando Sistema...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Reparar Sistema Completo
              </>
            )}
          </Button>
        </div>

        {/* Opciones personalizadas */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-orange-800 mb-3">Reparación Personalizada</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="costs"
                checked={options.createMissingCosts}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, createMissingCosts: !!checked }))
                }
              />
              <label htmlFor="costs" className="text-sm font-medium">
                Crear costos faltantes para viajes
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="analytics"
                checked={options.generateSampleAnalytics}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, generateSampleAnalytics: !!checked }))
                }
              />
              <label htmlFor="analytics" className="text-sm font-medium">
                Generar análisis de rendimiento
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="routes"
                checked={options.createRouteBaselines}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, createRouteBaselines: !!checked }))
                }
              />
              <label htmlFor="routes" className="text-sm font-medium">
                Crear líneas base de rutas
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="fields"
                checked={options.populateEmptyFields}
                onCheckedChange={(checked) => 
                  setOptions(prev => ({ ...prev, populateEmptyFields: !!checked }))
                }
              />
              <label htmlFor="fields" className="text-sm font-medium">
                Actualizar campos vacíos
              </label>
            </div>
          </div>
          
          <Button 
            onClick={handleCustomRepair}
            disabled={isLoading}
            variant="outline"
            className="w-full mt-4"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Aplicando Cambios...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Aplicar Reparación Personalizada
              </>
            )}
          </Button>
        </div>

        {/* Advertencia */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Antes de continuar:</p>
              <p className="text-yellow-700">
                Esta herramienta poblará datos faltantes para mejorar el funcionamiento de los dashboards. 
                Los datos generados son estimaciones basadas en patrones reales.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
