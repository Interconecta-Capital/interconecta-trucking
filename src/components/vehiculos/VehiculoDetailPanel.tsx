import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VehiculoMetricas } from './VehiculoMetricas';
import { VehiculoHistorialViajes } from './VehiculoHistorialViajes';
import { ValidadorDisponibilidad } from '../viajes/ValidadorDisponibilidad';
import { CalculadoraCostos } from '../viajes/CalculadoraCostos';
import { 
  BarChart3, 
  Route, 
  Calendar, 
  Calculator, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  MapPin,
  X
} from 'lucide-react';

interface VehiculoDetailPanelProps {
  vehiculo: any;
  open: boolean;
  onClose: () => void;
}

export function VehiculoDetailPanel({ vehiculo, open, onClose }: VehiculoDetailPanelProps) {
  const [activeTab, setActiveTab] = useState('metricas');

  if (!open || !vehiculo) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed right-0 top-0 h-full w-full max-w-4xl bg-background border-l shadow-xl animate-slide-in-right">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Análisis Detallado</h2>
                <p className="text-muted-foreground mt-1">
                  Vehículo {vehiculo.placa} - {vehiculo.marca} {vehiculo.modelo}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Estado y información rápida */}
            <div className="flex items-center gap-4 mt-4">
              <Badge 
                className={
                  vehiculo.estado === 'disponible' 
                    ? 'bg-success text-success-foreground' 
                    : vehiculo.estado === 'en_transito'
                      ? 'bg-info text-info-foreground'
                      : 'bg-warning text-warning-foreground'
                }
              >
                {vehiculo.estado === 'disponible' ? 'Disponible' :
                 vehiculo.estado === 'en_transito' ? 'En Tránsito' :
                 vehiculo.estado}
              </Badge>
              
              {vehiculo.ubicacion_actual && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {vehiculo.ubicacion_actual}
                </div>
              )}
              
              {vehiculo.fecha_proxima_disponibilidad && vehiculo.estado !== 'disponible' && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Disponible: {new Date(vehiculo.fecha_proxima_disponibilidad).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 mx-6 mt-4">
                <TabsTrigger value="metricas" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Métricas
                </TabsTrigger>
                <TabsTrigger value="viajes" className="flex items-center gap-2">
                  <Route className="h-4 w-4" />
                  Historial
                </TabsTrigger>
                <TabsTrigger value="disponibilidad" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Disponibilidad
                </TabsTrigger>
                <TabsTrigger value="costos" className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Calculadora
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto p-6">
                <TabsContent value="metricas" className="mt-0">
                  <VehiculoMetricas vehiculoId={vehiculo.id} />
                </TabsContent>

                <TabsContent value="viajes" className="mt-0">
                  <VehiculoHistorialViajes vehiculoId={vehiculo.id} />
                </TabsContent>

                <TabsContent value="disponibilidad" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Verificar Disponibilidad
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ValidadorDisponibilidad 
                        vehiculoId={vehiculo.id}
                        fechaInicio={new Date().toISOString()}
                        fechaFin={new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()}
                        onValidacionCompleta={(disponible, conflictos) => {
                          console.log('Validación completada:', { disponible, conflictos });
                        }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="costos" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calculator className="h-5 w-5" />
                        Calculadora de Costos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CalculadoraCostos 
                        distanciaKm={500}
                        tipoVehiculo={vehiculo.config_vehicular || 'camion'}
                        onCostosCalculados={(costos, precio) => {
                          console.log('Costos calculados:', { costos, precio });
                        }}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}