
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFlotaManager } from '@/hooks/crm/useFlotaManager';
import { useClientesProveedores } from '@/hooks/crm/useClientesProveedores';
import { useCartasPorte } from '@/hooks/useCartasPorte';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Truck, 
  FileText, 
  DollarSign,
  BarChart3,
  PieChart,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Fuel,
  Route,
  Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';

interface KPI {
  titulo: string;
  valor: string | number;
  cambio?: number;
  tendencia?: 'up' | 'down' | 'stable';
  meta?: number;
  icon: React.ComponentType<any>;
  color: string;
}

interface MetricaOperacional {
  nombre: string;
  valor: number;
  unidad: string;
  objetivo: number;
  tendencia: 'up' | 'down' | 'stable';
}

export function ExecutiveDashboard() {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | '90d'>('30d');
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [metricas, setMetricas] = useState<MetricaOperacional[]>([]);
  const [alertasActivas, setAlertasActivas] = useState<any[]>([]);

  const { obtenerEstadisticasFlota, obtenerVehiculosProximosVencimiento } = useFlotaManager();
  const { clientes } = useClientesProveedores();
  const { cartasPorte } = useCartasPorte();

  // Calcular KPIs principales
  useEffect(() => {
    const calcularKPIs = () => {
      const estadisticasFlota = obtenerEstadisticasFlota();
      const vehiculosVencimiento = obtenerVehiculosProximosVencimiento();
      
      const kpisCalculados: KPI[] = [
        {
          titulo: 'Clientes Activos',
          valor: clientes.filter(c => c.estatus === 'activo').length,
          cambio: 5.2,
          tendencia: 'up',
          icon: Users,
          color: 'blue'
        },
        {
          titulo: 'Flota Disponible',
          valor: `${estadisticasFlota.vehiculos.porcentajeDisponibilidad}%`,
          cambio: -2.1,
          tendencia: 'down',
          meta: 85,
          icon: Truck,
          color: 'green'
        },
        {
          titulo: 'Cartas Porte (Mes)',
          valor: cartasPorte.filter(c => {
            const fechaCreacion = new Date(c.created_at);
            const inicioMes = new Date();
            inicioMes.setDate(1);
            return fechaCreacion >= inicioMes;
          }).length,
          cambio: 12.5,
          tendencia: 'up',
          icon: FileText,
          color: 'purple'
        },
        {
          titulo: 'Ingresos Estimados',
          valor: '$1,250,000',
          cambio: 8.3,
          tendencia: 'up',
          icon: DollarSign,
          color: 'yellow'
        }
      ];

      setKpis(kpisCalculados);

      // Métricas operacionales
      const metricasCalculadas: MetricaOperacional[] = [
        {
          nombre: 'Utilización de Flota',
          valor: estadisticasFlota.vehiculos.porcentajeDisponibilidad,
          unidad: '%',
          objetivo: 85,
          tendencia: 'stable'
        },
        {
          nombre: 'Eficiencia Conductores',
          valor: estadisticasFlota.conductores.porcentajeDisponibilidad,
          unidad: '%',
          objetivo: 90,
          tendencia: 'up'
        },
        {
          nombre: 'Vencimientos Próximos',
          valor: vehiculosVencimiento.length,
          unidad: 'vehículos',
          objetivo: 0,
          tendencia: vehiculosVencimiento.length > 3 ? 'down' : 'stable'
        }
      ];

      setMetricas(metricasCalculadas);

      // Alertas activas
      const alertas = [
        ...vehiculosVencimiento.map(v => ({
          tipo: 'warning',
          titulo: 'Vencimiento Próximo',
          descripcion: `${v.placa} - Documentos por vencer`,
          fecha: new Date()
        }))
      ];

      setAlertasActivas(alertas);
    };

    calcularKPIs();
  }, [clientes, cartasPorte, obtenerEstadisticasFlota, obtenerVehiculosProximosVencimiento]);

  // Datos para gráficos (simulados)
  const datosIngresos = [
    { mes: 'Ene', ingresos: 850000, gastos: 620000 },
    { mes: 'Feb', ingresos: 920000, gastos: 650000 },
    { mes: 'Mar', ingresos: 1100000, gastos: 720000 },
    { mes: 'Abr', ingresos: 1250000, gastos: 780000 },
    { mes: 'May', ingresos: 1180000, gastos: 760000 },
    { mes: 'Jun', ingresos: 1350000, gastos: 820000 }
  ];

  const datosFlota = [
    { estado: 'Disponible', cantidad: 15, color: '#10b981' },
    { estado: 'En Ruta', cantidad: 8, color: '#3b82f6' },
    { estado: 'Mantenimiento', cantidad: 3, color: '#f59e0b' },
    { estado: 'Fuera de Servicio', cantidad: 1, color: '#ef4444' }
  ];

  const getTrendIcon = (tendencia: 'up' | 'down' | 'stable') => {
    switch (tendencia) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getColorClass = (color: string) => {
    const colors = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
      yellow: 'text-yellow-600 bg-yellow-100'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Ejecutivo</h1>
          <p className="text-muted-foreground">Vista general del rendimiento operacional</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <select 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value as any)}
            className="border rounded px-3 py-1"
          >
            <option value="24h">Últimas 24h</option>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
          </select>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{kpi.titulo}</p>
                    <p className="text-2xl font-bold">{kpi.valor}</p>
                    
                    {kpi.cambio && (
                      <div className="flex items-center space-x-1 mt-1">
                        {getTrendIcon(kpi.tendencia || 'stable')}
                        <span className={`text-sm ${
                          kpi.tendencia === 'up' ? 'text-green-600' : 
                          kpi.tendencia === 'down' ? 'text-red-600' : 
                          'text-blue-600'
                        }`}>
                          {kpi.cambio > 0 ? '+' : ''}{kpi.cambio}%
                        </span>
                      </div>
                    )}
                    
                    {kpi.meta && (
                      <div className="mt-2">
                        <Progress 
                          value={typeof kpi.valor === 'string' ? 
                            parseInt(kpi.valor.replace('%', '')) : 
                            (kpi.valor / kpi.meta) * 100
                          } 
                          className="h-2" 
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Meta: {kpi.meta}{typeof kpi.valor === 'string' && kpi.valor.includes('%') ? '%' : ''}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className={`p-3 rounded-full ${getColorClass(kpi.color)}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="financiero" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financiero">Financiero</TabsTrigger>
          <TabsTrigger value="operacional">Operacional</TabsTrigger>
          <TabsTrigger value="flota">Flota</TabsTrigger>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
        </TabsList>

        {/* Panel Financiero */}
        <TabsContent value="financiero" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Ingresos vs Gastos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={datosIngresos}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000)}K`} />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" />
                    <Bar dataKey="gastos" fill="#ef4444" name="Gastos" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas Financieras</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">$1,350K</p>
                    <p className="text-sm text-muted-foreground">Ingresos (Jun)</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">$820K</p>
                    <p className="text-sm text-muted-foreground">Gastos (Jun)</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">39%</p>
                    <p className="text-sm text-muted-foreground">Margen</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">+8.3%</p>
                    <p className="text-sm text-muted-foreground">Crecimiento</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Panel Operacional */}
        <TabsContent value="operacional" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {metricas.map((metrica, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{metrica.nombre}</p>
                      <p className="text-2xl font-bold">{metrica.valor}{metrica.unidad}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        {getTrendIcon(metrica.tendencia)}
                        <span className="text-sm text-muted-foreground">
                          Objetivo: {metrica.objetivo}{metrica.unidad}
                        </span>
                      </div>
                    </div>
                    <Target className="h-8 w-8 text-blue-500" />
                  </div>
                  
                  <Progress 
                    value={metrica.objetivo > 0 ? (metrica.valor / metrica.objetivo) * 100 : 0} 
                    className="mt-4" 
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Rendimiento por Período</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={datosIngresos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="ingresos" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Ingresos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Panel Flota */}
        <TabsContent value="flota" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Estado de la Flota
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={datosFlota}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      dataKey="cantidad"
                    >
                      {datosFlota.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
                
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {datosFlota.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.estado}: {item.cantidad}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Indicadores de Flota</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Fuel className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Consumo Promedio</span>
                    </div>
                    <span className="text-lg font-bold">12.5 L/100km</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Route className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Distancia Total</span>
                    </div>
                    <span className="text-lg font-bold">45,230 km</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Horas Operación</span>
                    </div>
                    <span className="text-lg font-bold">1,250 hrs</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Panel Alertas */}
        <TabsContent value="alertas" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Alertas Activas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {alertasActivas.length > 0 ? (
                  <div className="space-y-3">
                    {alertasActivas.map((alerta, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-medium">{alerta.titulo}</p>
                          <p className="text-sm text-muted-foreground">{alerta.descripcion}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {alerta.fecha.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium">No hay alertas activas</p>
                    <p className="text-muted-foreground">Todo está funcionando correctamente</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Próximos Vencimientos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div>
                      <p className="font-medium">Seguro Vehículo ABC-123</p>
                      <p className="text-sm text-muted-foreground">Vence en 15 días</p>
                    </div>
                    <Calendar className="h-5 w-5 text-yellow-600" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <p className="font-medium">Licencia Conductor Juan P.</p>
                      <p className="text-sm text-muted-foreground">Vence en 7 días</p>
                    </div>
                    <Calendar className="h-5 w-5 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
