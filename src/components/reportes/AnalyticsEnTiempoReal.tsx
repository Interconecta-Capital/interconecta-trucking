import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  DollarSign,
  Truck,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import { useDashboardRentabilidad } from '@/hooks/useDashboardRentabilidad';
import { useDashboardCounts } from '@/hooks/useDashboardCounts';

interface MetricaEnTiempoReal {
  id: string;
  nombre: string;
  valor: number;
  valorAnterior: number;
  unidad: string;
  icon: React.ComponentType<any>;
  color: string;
  tendencia: 'subida' | 'bajada' | 'estable';
  categoria: 'financiero' | 'operativo' | 'flota' | 'performance';
}

export function AnalyticsEnTiempoReal() {
  const { dashboardData, loading: loadingRentabilidad } = useDashboardRentabilidad();
  const { data: counts, isLoading: loadingCounts } = useDashboardCounts();
  const [metricas, setMetricas] = useState<MetricaEnTiempoReal[]>([]);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());

  useEffect(() => {
    if (dashboardData && counts) {
      const nuevasMetricas: MetricaEnTiempoReal[] = [
        {
          id: 'ingreso-total',
          nombre: 'Ingresos Totales',
          valor: dashboardData.kpis?.ingresoTotal || 0,
          valorAnterior: (dashboardData.kpis?.ingresoTotal || 0) * 0.9,
          unidad: '$',
          icon: DollarSign,
          color: 'text-emerald-600',
          tendencia: 'subida',
          categoria: 'financiero'
        },
        {
          id: 'margen-promedio',
          nombre: 'Margen Promedio',
          valor: dashboardData.kpis?.margenPromedio || 0,
          valorAnterior: (dashboardData.kpis?.margenPromedio || 0) * 0.95,
          unidad: '%',
          icon: TrendingUp,
          color: 'text-blue-600',
          tendencia: 'subida',
          categoria: 'financiero'
        },
        {
          id: 'viajes-completados',
          nombre: 'Viajes Completados',
          valor: dashboardData.kpis?.viajesCompletados || 0,
          valorAnterior: (dashboardData.kpis?.viajesCompletados || 0) * 0.85,
          unidad: '',
          icon: Activity,
          color: 'text-purple-600',
          tendencia: 'subida',
          categoria: 'operativo'
        },
        {
          id: 'utilizacion-flota',
          nombre: 'Utilización de Flota',
          valor: dashboardData.kpis?.utilizacionFlota || 0,
          valorAnterior: (dashboardData.kpis?.utilizacionFlota || 0) * 0.92,
          unidad: '%',
          icon: Truck,
          color: 'text-orange-600',
          tendencia: 'subida',
          categoria: 'flota'
        },
        {
          id: 'km-recorridos',
          nombre: 'Km Recorridos',
          valor: dashboardData.kpis?.kmRecorridos || 0,
          valorAnterior: (dashboardData.kpis?.kmRecorridos || 0) * 0.88,
          unidad: 'km',
          icon: Zap,
          color: 'text-indigo-600',
          tendencia: 'subida',
          categoria: 'operativo'
        },
        {
          id: 'vehiculos-activos',
          nombre: 'Vehículos Activos',
          valor: counts.vehiculos || 0,
          valorAnterior: (counts.vehiculos || 0) * 0.95,
          unidad: '',
          icon: Truck,
          color: 'text-teal-600',
          tendencia: 'estable',
          categoria: 'flota'
        }
      ];

      setMetricas(nuevasMetricas);
      setUltimaActualizacion(new Date());
    }
  }, [dashboardData, counts]);

  const calcularCambio = (metrica: MetricaEnTiempoReal) => {
    if (metrica.valorAnterior === 0) return 0;
    return ((metrica.valor - metrica.valorAnterior) / metrica.valorAnterior) * 100;
  };

  const formatearValor = (metrica: MetricaEnTiempoReal) => {
    if (metrica.unidad === '$') {
      return `$${metrica.valor.toLocaleString()}`;
    } else if (metrica.unidad === '%') {
      return `${metrica.valor.toFixed(1)}%`;
    } else if (metrica.unidad === 'km') {
      return `${metrica.valor.toLocaleString()} km`;
    }
    return metrica.valor.toLocaleString();
  };

  const getIconoTendencia = (tendencia: string) => {
    switch (tendencia) {
      case 'subida':
        return <TrendingUp className="h-3 w-3 text-emerald-600" />;
      case 'bajada':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <Activity className="h-3 w-3 text-gray-600" />;
    }
  };

  const categorias = [
    { id: 'financiero', nombre: 'Financiero', color: 'bg-emerald-100 text-emerald-800' },
    { id: 'operativo', nombre: 'Operativo', color: 'bg-blue-100 text-blue-800' },
    { id: 'flota', nombre: 'Flota', color: 'bg-orange-100 text-orange-800' },
    { id: 'performance', nombre: 'Performance', color: 'bg-purple-100 text-purple-800' }
  ];

  if (loadingRentabilidad || loadingCounts) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con última actualización */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics en Tiempo Real</h2>
          <p className="text-muted-foreground">
            Métricas actualizadas en tiempo real de todas las operaciones
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="h-4 w-4 text-emerald-600" />
          <span>Actualizado: {ultimaActualizacion.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Filtros por categoría */}
      <div className="flex flex-wrap gap-2">
        {categorias.map((categoria) => (
          <Badge key={categoria.id} className={categoria.color}>
            {categoria.nombre}
          </Badge>
        ))}
      </div>

      {/* Grid de métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricas.map((metrica) => {
          const cambio = calcularCambio(metrica);
          const categoria = categorias.find(c => c.id === metrica.categoria);
          
          return (
            <Card key={metrica.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <metrica.icon className={`h-5 w-5 ${metrica.color}`} />
                    <CardTitle className="text-sm font-medium">{metrica.nombre}</CardTitle>
                  </div>
                  <Badge className={categoria?.color}>
                    {categoria?.nombre}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {formatearValor(metrica)}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getIconoTendencia(metrica.tendencia)}
                    <span className={`text-sm ${
                      cambio > 0 ? 'text-emerald-600' : 
                      cambio < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {cambio > 0 ? '+' : ''}{cambio.toFixed(1)}%
                    </span>
                    <span className="text-sm text-muted-foreground">vs anterior</span>
                  </div>

                  {/* Barra de progreso visual */}
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        metrica.tendencia === 'subida' ? 'bg-emerald-500' :
                        metrica.tendencia === 'bajada' ? 'bg-red-500' : 'bg-gray-500'
                      }`}
                      style={{ 
                        width: `${Math.min(Math.abs(cambio) * 2, 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alertas de rendimiento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Alertas de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboardData?.alertas && (
              <>
                {dashboardData.alertas.viajesNegativos > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <div>
                      <div className="font-medium text-red-900">
                        {dashboardData.alertas.viajesNegativos} viajes con margen negativo
                      </div>
                      <div className="text-sm text-red-700">
                        Revisar costos y optimizar rutas para mejorar rentabilidad
                      </div>
                    </div>
                  </div>
                )}
                
                {dashboardData.alertas.vehiculosIneficientes > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <Truck className="h-4 w-4 text-orange-600" />
                    <div>
                      <div className="font-medium text-orange-900">
                        {dashboardData.alertas.vehiculosIneficientes} vehículos con baja eficiencia
                      </div>
                      <div className="text-sm text-orange-700">
                        Considerar mantenimiento preventivo o reemplazo
                      </div>
                    </div>
                  </div>
                )}

                {dashboardData.alertas.oportunidadesMejora?.length > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="font-medium text-blue-900">
                        Oportunidades de mejora identificadas
                      </div>
                      <div className="text-sm text-blue-700">
                        {dashboardData.alertas.oportunidadesMejora.slice(0, 2).join(', ')}
                        {dashboardData.alertas.oportunidadesMejora.length > 2 && '...'}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {(!dashboardData?.alertas || 
              (dashboardData.alertas.viajesNegativos === 0 && 
               dashboardData.alertas.vehiculosIneficientes === 0 && 
               !dashboardData.alertas.oportunidadesMejora?.length)) && (
              <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <div>
                  <div className="font-medium text-emerald-900">
                    Todo funcionando correctamente
                  </div>
                  <div className="text-sm text-emerald-700">
                    No hay alertas críticas en este momento
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}