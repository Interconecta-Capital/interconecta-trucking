
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Calendar, 
  Car, 
  Clock, 
  DollarSign,
  MapPin,
  Settings,
  Star,
  TrendingUp,
  Wrench
} from 'lucide-react';
import { useMantenimientoPredictivo } from '@/hooks/useMantenimientoPredictivo';
import { MantenimientoForm } from './MantenimientoForm';
import { TallerSelector } from './TallerSelector';

export const MantenimientoDashboard: React.FC = () => {
  const {
    alertas,
    talleres,
    vehiculos,
    mantenimientos,
    isLoading,
    error,
    generarAnalisisPredictivo,
    optimizarProgramacion
  } = useMantenimientoPredictivo();

  const [selectedVehiculo, setSelectedVehiculo] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando sistema de mantenimiento...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Error: {error}</AlertDescription>
      </Alert>
    );
  }

  const alertasUrgentes = alertas.filter(a => a.urgencia === 'urgente');
  const alertasProximas = alertas.filter(a => a.urgencia === 'pronto');
  const programacionOptimizada = optimizarProgramacion(vehiculos);

  return (
    <div className="space-y-6">
      {/* Resumen de Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Urgentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alertasUrgentes.length}</div>
            <p className="text-xs text-gray-500">Requieren atención inmediata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-500" />
              Próximas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{alertasProximas.length}</div>
            <p className="text-xs text-gray-500">En los próximos 7 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Car className="h-4 w-4 text-blue-500" />
              Vehículos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{vehiculos.length}</div>
            <p className="text-xs text-gray-500">En monitoreo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Ahorro Potencial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${programacionOptimizada.reduce((sum, p) => sum + p.ahorro_estimado, 0)}
            </div>
            <p className="text-xs text-gray-500">Con programación optimizada</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Críticas */}
      {alertasUrgentes.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas Urgentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alertasUrgentes.map((alerta) => (
              <div key={alerta.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-200">
                <div>
                  <p className="font-medium text-red-900">{alerta.placa}</p>
                  <p className="text-sm text-red-700">{alerta.descripcion}</p>
                  <p className="text-xs text-red-600">
                    {alerta.dias_restantes >= 0 ? `${alerta.dias_restantes} días restantes` : 'Vencido'}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Programar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="alertas" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
          <TabsTrigger value="programacion">Programación</TabsTrigger>
          <TabsTrigger value="talleres">Talleres</TabsTrigger>
          <TabsTrigger value="analisis">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="alertas" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Alertas de Mantenimiento</h3>
            <Button onClick={() => setShowForm(true)}>
              <Wrench className="h-4 w-4 mr-2" />
              Programar Mantenimiento
            </Button>
          </div>

          <div className="grid gap-4">
            {alertas.map((alerta) => (
              <Card key={alerta.id} className={`border-l-4 ${
                alerta.urgencia === 'urgente' ? 'border-l-red-500' :
                alerta.urgencia === 'pronto' ? 'border-l-orange-500' : 'border-l-blue-500'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {alerta.placa}
                        </Badge>
                        <Badge variant={
                          alerta.urgencia === 'urgente' ? 'destructive' :
                          alerta.urgencia === 'pronto' ? 'secondary' : 'default'
                        }>
                          {alerta.urgencia}
                        </Badge>
                      </div>
                      <p className="font-medium mb-1">{alerta.descripcion}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {alerta.dias_restantes >= 0 ? `${alerta.dias_restantes} días` : 'Vencido'}
                        </span>
                        {alerta.kilometros_restantes > 0 && (
                          <span className="flex items-center gap-1">
                            <Car className="h-3 w-3" />
                            {alerta.kilometros_restantes.toLocaleString()} km
                          </span>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="programacion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Programación Optimizada
              </CardTitle>
            </CardHeader>
            <CardContent>
              {programacionOptimizada.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No hay servicios pendientes para optimizar
                </p>
              ) : (
                <div className="space-y-4">
                  {programacionOptimizada.map((programa, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">
                          {new Date(programa.fecha).toLocaleDateString()}
                        </h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {programa.vehiculos_count} vehículos
                          </Badge>
                          {programa.ahorro_estimado > 0 && (
                            <Badge variant="secondary" className="text-green-700 bg-green-100">
                              Ahorro: ${programa.ahorro_estimado}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        {programa.servicios.map((servicio: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span>{servicio.placa} - {servicio.servicio.tipo}</span>
                            <span className="text-gray-500">
                              {servicio.servicio.kilometraje.toLocaleString()} km
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="talleres" className="space-y-4">
          <TallerSelector talleres={talleres} />
        </TabsContent>

        <TabsContent value="analisis" className="space-y-4">
          <div className="grid gap-4">
            {vehiculos.map((vehiculo) => {
              const analisis = generarAnalisisPredictivo(vehiculo);
              return (
                <Card key={vehiculo.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Car className="h-5 w-5" />
                        {vehiculo.placa}
                      </span>
                      <Badge variant={
                        analisis.vehiculo.proximoServicio.urgencia === 'urgente' ? 'destructive' :
                        analisis.vehiculo.proximoServicio.urgencia === 'pronto' ? 'secondary' : 'default'
                      }>
                        {analisis.vehiculo.proximoServicio.urgencia}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Kilometraje Actual</p>
                        <p className="text-lg font-bold">{analisis.vehiculo.kilometrajeActual.toLocaleString()} km</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Próximo Servicio</p>
                        <p className="text-lg font-bold">{analisis.vehiculo.proximoServicio.tipo}</p>
                        <p className="text-sm text-gray-500">{analisis.vehiculo.proximoServicio.kilometraje.toLocaleString()} km</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Fecha Estimada</p>
                        <p className="text-lg font-bold">
                          {analisis.vehiculo.proximoServicio.fechaEstimada.toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {analisis.alertas.anomaliasDetectadas.length > 0 && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-orange-600 mb-2 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Anomalías Detectadas
                        </h4>
                        <div className="space-y-2">
                          {analisis.alertas.anomaliasDetectadas.map((anomalia, idx) => (
                            <div key={idx} className="p-2 bg-orange-50 rounded border border-orange-200">
                              <p className="text-sm font-medium text-orange-800">{anomalia.descripcion}</p>
                              <p className="text-xs text-orange-600">{anomalia.recomendacion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analisis.recomendaciones.tallerOptimo && (
                      <div className="border-t pt-4">
                        <h4 className="font-medium text-green-600 mb-2 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Taller Recomendado
                        </h4>
                        <div className="p-3 bg-green-50 rounded border border-green-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-green-800">
                                {analisis.recomendaciones.tallerOptimo.nombre}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-yellow-500" />
                                  <span className="text-xs text-green-600">
                                    {analisis.recomendaciones.tallerOptimo.calificacion_promedio.toFixed(1)}
                                  </span>
                                </div>
                                <span className="text-xs text-green-600">
                                  ({analisis.recomendaciones.tallerOptimo.total_reviews} reviews)
                                </span>
                              </div>
                            </div>
                            <Badge className="bg-green-600">
                              Ahorro: ${analisis.recomendaciones.ahorroEstimado}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {showForm && (
        <MantenimientoForm
          vehiculos={vehiculos}
          talleres={talleres}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};
