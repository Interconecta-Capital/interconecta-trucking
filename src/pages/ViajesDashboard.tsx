import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Truck, 
  Navigation, 
  Clock, 
  MapPin, 
  Filter, 
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  PauseCircle
} from 'lucide-react';
import { useViajesEstados } from '@/hooks/useViajesEstados';
import { useRealTimeMetrics } from '@/hooks/useRealTimeMetrics';
import { Viaje } from '@/hooks/viajes/types';

const ESTADOS_CONFIG = {
  programado: { label: 'Programado', color: 'bg-blue-500', icon: Calendar },
  en_transito: { label: 'En Tránsito', color: 'bg-yellow-500', icon: PlayCircle },
  completado: { label: 'Completado', color: 'bg-green-500', icon: CheckCircle },
  cancelado: { label: 'Cancelado', color: 'bg-red-500', icon: AlertTriangle },
  retrasado: { label: 'Retrasado', color: 'bg-orange-500', icon: Clock }
};

export default function ViajesDashboard() {
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroConductor, setFiltroConductor] = useState<string>('todos');
  
  const { viajesActivos, isLoading } = useViajesEstados();
  const { data: metrics } = useRealTimeMetrics();

  // Filtrar viajes
  const viajesFiltrados = viajesActivos?.filter(viaje => {
    const matchEstado = filtroEstado === 'todos' || viaje.estado === filtroEstado;
    const matchConductor = filtroConductor === 'todos' || viaje.conductor_id === filtroConductor;
    return matchEstado && matchConductor;
  }) || [];

  // Métricas calculadas
  const metricasViajes = {
    total: viajesActivos?.length || 0,
    enTransito: viajesActivos?.filter(v => v.estado === 'en_transito').length || 0,
    completadosHoy: viajesActivos?.filter(v => 
      v.estado === 'completado' && 
      new Date(v.fecha_fin_real || v.updated_at).toDateString() === new Date().toDateString()
    ).length || 0,
    retrasados: viajesActivos?.filter(v => v.estado === 'retrasado').length || 0,
    ingresosDia: metrics?.ingresosHoy || 0,
    distanciaTotal: viajesActivos?.reduce((sum, v) => sum + (v.distancia_km || 0), 0) || 0
  };

  const conductoresUnicos = [...new Set(viajesActivos?.map(v => v.conductor_id).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">Cargando dashboard de viajes...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Viajes</h1>
          <p className="text-muted-foreground">
            Monitoreo en tiempo real de operaciones de transporte
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Período
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Viajes</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricasViajes.total}</div>
            <p className="text-xs text-muted-foreground">Viajes activos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Tránsito</CardTitle>
            <Navigation className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metricasViajes.enTransito}</div>
            <p className="text-xs text-muted-foreground">Viajes en curso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completados Hoy</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metricasViajes.completadosHoy}</div>
            <p className="text-xs text-muted-foreground">Entregas exitosas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Día</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${metricasViajes.ingresosDia.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Ingresos generados</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribución por estados */}
      <Card>
        <CardHeader>
          <CardTitle>Estado de Viajes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(ESTADOS_CONFIG).map(([estado, config]) => {
              const count = viajesActivos?.filter(v => v.estado === estado).length || 0;
              const percentage = metricasViajes.total > 0 ? (count / metricasViajes.total) * 100 : 0;
              const Icon = config.icon;
              
              return (
                <div key={estado} className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Icon className="h-5 w-5 mr-2" />
                    <span className="text-sm font-medium">{config.label}</span>
                  </div>
                  <div className="text-2xl font-bold">{count}</div>
                  <Progress value={percentage} className="mt-2 h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {percentage.toFixed(1)}%
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista de viajes activos */}
      <Card>
        <CardHeader>
          <CardTitle>Viajes Activos</CardTitle>
          <div className="flex gap-2">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="todos">Todos los estados</option>
              {Object.entries(ESTADOS_CONFIG).map(([estado, config]) => (
                <option key={estado} value={estado}>{config.label}</option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {viajesFiltrados.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay viajes que coincidan con los filtros seleccionados
              </div>
            ) : (
              viajesFiltrados.map((viaje) => {
                const estadoConfig = ESTADOS_CONFIG[viaje.estado as keyof typeof ESTADOS_CONFIG];
                const Icon = estadoConfig?.icon || Truck;
                
                return (
                  <div key={viaje.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" />
                        <div>
                          <h3 className="font-medium">
                            {viaje.origen} → {viaje.destino}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Distancia: {viaje.distancia_km || 0} km
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`${estadoConfig?.color} text-white`}>
                          {estadoConfig?.label || viaje.estado}
                        </Badge>
                        <div className="text-right">
                          <p className="font-medium">
                            ${(viaje.precio_cobrado || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(viaje.fecha_inicio_programada).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {viaje.estado === 'en_transito' && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4" />
                          <span>Progreso estimado del viaje</span>
                        </div>
                        <Progress value={65} className="mt-2 h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          Ubicación actual: En ruta hacia destino
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Métricas adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Eficiencia Operacional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Tiempo promedio de entrega</span>
              <span className="font-medium">4.2 horas</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Tasa de cumplimiento</span>
              <span className="font-medium text-green-600">94.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Distancia total recorrida</span>
              <span className="font-medium">{metricasViajes.distanciaTotal.toLocaleString()} km</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertas y Notificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metricasViajes.retrasados > 0 && (
                <div className="flex items-center gap-2 p-2 bg-orange-50 rounded">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="text-sm">
                    {metricasViajes.retrasados} viajes con retraso
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm">
                  {conductoresUnicos.length} conductores activos
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}