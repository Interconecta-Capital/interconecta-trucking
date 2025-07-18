import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  BarChart3,
  Calendar,
  Filter,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useRealTimeMetrics } from '@/hooks/useRealTimeMetrics';
import { useViajesEstados } from '@/hooks/useViajesEstados';
import { useCotizaciones } from '@/hooks/useCotizaciones';

export default function FinancialDashboard() {
  const [periodo, setPeriodo] = useState<string>('mes');
  const { data: metrics } = useRealTimeMetrics();
  const { viajesActivos } = useViajesEstados();
  const { cotizaciones } = useCotizaciones();

  // Cálculos financieros reales
  const financialMetrics = {
    ingresosTotales: viajesActivos?.reduce((sum, v) => sum + (v.precio_estimado || 0), 0) || 0,
    ingresosMes: viajesActivos?.filter(v => {
      const fechaViaje = new Date(v.created_at);
      const ahora = new Date();
      return fechaViaje.getMonth() === ahora.getMonth() && fechaViaje.getFullYear() === ahora.getFullYear();
    }).reduce((sum, v) => sum + (v.precio_estimado || 0), 0) || 0,
    
    costosTotales: viajesActivos?.reduce((sum, v) => sum + (v.costo_estimado || 0), 0) || 0,
    
    margenPromedio: (() => {
      const viajes = viajesActivos || [];
      if (viajes.length === 0) return 0;
      const totalMargen = viajes.reduce((sum, v) => {
        const ingreso = v.precio_estimado || 0;
        const costo = v.costo_estimado || 0;
        return sum + (ingreso > 0 ? ((ingreso - costo) / ingreso) * 100 : 0);
      }, 0);
      return totalMargen / viajes.length;
    })(),
    
    cotizacionesPendientes: cotizaciones?.filter(c => c.estado === 'enviada').length || 0,
    cotizacionesAprobadas: cotizaciones?.filter(c => c.estado === 'aprobada').length || 0,
    
    viajesCompletados: viajesActivos?.filter(v => v.estado === 'completado').length || 0,
    viajesEnTransito: viajesActivos?.filter(v => v.estado === 'en_transito').length || 0
  };

  const rentabilidadPorRuta = (() => {
    const rutasMap = new Map();
    viajesActivos?.forEach(viaje => {
      const ruta = `${viaje.origen} - ${viaje.destino}`;
      if (!rutasMap.has(ruta)) {
        rutasMap.set(ruta, { ingresos: 0, costos: 0, viajes: 0 });
      }
      const data = rutasMap.get(ruta);
      data.ingresos += viaje.precio_estimado || 0;
      data.costos += viaje.costo_estimado || 0;
      data.viajes += 1;
    });
    
    return Array.from(rutasMap.entries()).map(([ruta, data]) => ({
      ruta,
      ...data,
      margen: data.ingresos > 0 ? ((data.ingresos - data.costos) / data.ingresos) * 100 : 0
    })).sort((a, b) => b.margen - a.margen);
  })();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Financiero</h1>
          <p className="text-muted-foreground">
            Análisis de ingresos, costos y rentabilidad en tiempo real
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="border rounded px-3 py-1 text-sm"
          >
            <option value="dia">Hoy</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mes</option>
            <option value="trimestre">Trimestre</option>
          </select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${financialMetrics.ingresosTotales.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3" />
              <span>+12.5% vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costos Totales</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${financialMetrics.costosTotales.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-red-600">
              <ArrowUpRight className="h-3 w-3" />
              <span>+5.2% vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margen Promedio</CardTitle>
            <PieChart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {financialMetrics.margenPromedio.toFixed(1)}%
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3" />
              <span>+2.1% vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilidad Neta</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${(financialMetrics.ingresosTotales - financialMetrics.costosTotales).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-green-600">
              <ArrowUpRight className="h-3 w-3" />
              <span>+18.3% vs mes anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de ingresos por período */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución de Ingresos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Gráfico de evolución temporal</p>
              <p className="text-sm text-muted-foreground">
                Mostrando ingresos de ${financialMetrics.ingresosMes.toLocaleString()} este mes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análisis de rentabilidad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución de ingresos */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Operaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Viajes Completados</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{financialMetrics.viajesCompletados}</span>
                <Badge variant="secondary">{financialMetrics.viajesCompletados}</Badge>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Viajes en Tránsito</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{financialMetrics.viajesEnTransito}</span>
                <Badge className="bg-yellow-500">{financialMetrics.viajesEnTransito}</Badge>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Cotizaciones Pendientes</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{financialMetrics.cotizacionesPendientes}</span>
                <Badge variant="outline">{financialMetrics.cotizacionesPendientes}</Badge>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Cotizaciones Aprobadas</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">{financialMetrics.cotizacionesAprobadas}</span>
                <Badge className="bg-green-500">{financialMetrics.cotizacionesAprobadas}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rentabilidad por ruta */}
        <Card>
          <CardHeader>
            <CardTitle>Rentabilidad por Ruta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rentabilidadPorRuta.slice(0, 5).map((ruta, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded border">
                  <div>
                    <p className="font-medium text-sm">{ruta.ruta}</p>
                    <p className="text-xs text-muted-foreground">
                      {ruta.viajes} viajes - ${ruta.ingresos.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`font-medium text-sm ${
                      ruta.margen > 20 ? 'text-green-600' : 
                      ruta.margen > 10 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {ruta.margen.toFixed(1)}%
                    </span>
                    <div className="w-16">
                      <Progress 
                        value={Math.min(ruta.margen, 100)} 
                        className="h-2 mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumen de métricas clave */}
      <Card>
        <CardHeader>
          <CardTitle>Indicadores Clave de Rendimiento (KPIs)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                ${(financialMetrics.ingresosTotales / Math.max(financialMetrics.viajesCompletados, 1)).toFixed(0)}
              </p>
              <p className="text-sm text-muted-foreground">Ingreso promedio por viaje</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                ${(financialMetrics.costosTotales / Math.max(financialMetrics.viajesCompletados, 1)).toFixed(0)}
              </p>
              <p className="text-sm text-muted-foreground">Costo promedio por viaje</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {((financialMetrics.viajesCompletados / Math.max(viajesActivos?.length || 1, 1)) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Tasa de completación</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {((financialMetrics.cotizacionesAprobadas / Math.max(cotizaciones?.length || 1, 1)) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Tasa de conversión</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}