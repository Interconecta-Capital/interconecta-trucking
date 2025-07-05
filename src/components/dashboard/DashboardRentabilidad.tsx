
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Truck, 
  Route, 
  AlertTriangle,
  FileText,
  Calendar,
  Filter
} from 'lucide-react';
import { useDashboardRentabilidad } from '@/hooks/useDashboardRentabilidad';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function DashboardRentabilidad() {
  const { dashboardData, loading, filtros, generarReporte, actualizarFiltros } = useDashboardRentabilidad();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium">No hay datos disponibles</h3>
        <p className="text-gray-600">Selecciona un período con datos para mostrar.</p>
      </div>
    );
  }

  const { kpis, analisis, alertas } = dashboardData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Rentabilidad</h1>
          <p className="text-gray-600">
            Período: {format(filtros.fechaInicio, 'dd/MM/yyyy', { locale: es })} - {format(filtros.fechaFin, 'dd/MM/yyyy', { locale: es })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm" onClick={() => generarReporte('mensual')}>
            <FileText className="h-4 w-4 mr-2" />
            Generar Reporte
          </Button>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingreso Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${kpis.ingresoTotal.toLocaleString('es-MX')}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${kpis.costoTotal.toLocaleString('es-MX')}
            </div>
            <div className="flex items-center text-xs text-red-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.2%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis.margenPromedio.toFixed(1)}%
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2.1%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Viajes Completados</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis.viajesCompletados}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15.3%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KM Recorridos</CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis.kmRecorridos.toFixed(0)}
            </div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +18.7%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilización Flota</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {kpis.utilizacionFlota.toFixed(1)}%
            </div>
            <Progress value={kpis.utilizacionFlota} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {alertas.oportunidadesMejora.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Alertas y Oportunidades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{alertas.viajesNegativos}</div>
                <div className="text-sm text-gray-600">Viajes Negativos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{alertas.clientesMorosos}</div>
                <div className="text-sm text-gray-600">Clientes Morosos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{alertas.vehiculosIneficientes}</div>
                <div className="text-sm text-gray-600">Vehículos Ineficientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{alertas.oportunidadesMejora.length}</div>
                <div className="text-sm text-gray-600">Oportunidades</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Análisis de Viajes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Viajes Más Rentables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analisis.viajesMasRentables.slice(0, 5).map((viaje, index) => (
                <div key={viaje.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{viaje.origen} → {viaje.destino}</div>
                    <div className="text-sm text-gray-600">{viaje.cliente}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">
                      ${viaje.margen.toLocaleString('es-MX')}
                    </div>
                    <div className="text-sm text-gray-600">
                      {((viaje.margen / viaje.ingreso) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Viajes Menos Rentables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analisis.viajesMenosRentables.slice(0, 5).map((viaje, index) => (
                <div key={viaje.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{viaje.origen} → {viaje.destino}</div>
                    <div className="text-sm text-gray-600">{viaje.cliente}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-red-600">
                      ${viaje.margen.toLocaleString('es-MX')}
                    </div>
                    <div className="text-sm text-gray-600">
                      {((viaje.margen / viaje.ingreso) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis de Rutas */}
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Rutas Óptimas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Ruta</th>
                  <th className="text-right p-2">Viajes</th>
                  <th className="text-right p-2">Ingreso Prom.</th>
                  <th className="text-right p-2">Costo Prom.</th>
                  <th className="text-right p-2">Margen %</th>
                  <th className="text-right p-2">Demanda</th>
                </tr>
              </thead>
              <tbody>
                {analisis.rutasOptimas.slice(0, 10).map((ruta, index) => (
                  <tr key={ruta.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="font-medium">{ruta.origen} → {ruta.destino}</div>
                      <div className="text-sm text-gray-600">{ruta.distanciaKm.toFixed(0)} km</div>
                    </td>
                    <td className="text-right p-2">{ruta.viajesTotal}</td>
                    <td className="text-right p-2">${ruta.ingresoPromedio.toLocaleString('es-MX')}</td>
                    <td className="text-right p-2">${ruta.costoPromedio.toLocaleString('es-MX')}</td>
                    <td className="text-right p-2">
                      <Badge variant={ruta.margenPromedio > 15 ? 'default' : ruta.margenPromedio > 10 ? 'secondary' : 'destructive'}>
                        {ruta.margenPromedio.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="text-right p-2">
                      <Badge variant={
                        ruta.demanda === 'alta' ? 'default' : 
                        ruta.demanda === 'media' ? 'secondary' : 'outline'
                      }>
                        {ruta.demanda}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Performance de Vehículos */}
      <Card>
        <CardHeader>
          <CardTitle>Performance de Vehículos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analisis.vehiculosPerformance.slice(0, 6).map((vehiculo) => (
              <div key={vehiculo.id} className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-medium">{vehiculo.placa}</div>
                    <div className="text-sm text-gray-600">{vehiculo.marca} {vehiculo.modelo}</div>
                  </div>
                  <Badge variant={
                    vehiculo.estado === 'excelente' ? 'default' :
                    vehiculo.estado === 'bueno' ? 'secondary' :
                    vehiculo.estado === 'regular' ? 'outline' : 'destructive'
                  }>
                    {vehiculo.estado}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Viajes:</span>
                    <span className="font-medium">{vehiculo.viajesCompletados}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">ROI:</span>
                    <span className="font-medium">{vehiculo.roi.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Utilización:</span>
                    <span className="font-medium">{vehiculo.utilizacion.toFixed(1)}%</span>
                  </div>
                  <div className="mt-2">
                    <div className="text-sm text-gray-600 mb-1">Utilización</div>
                    <Progress value={vehiculo.utilizacion} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
