
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  Package, 
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  PieChart,
  Target,
  Zap
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Cell
} from 'recharts';

interface AnalyticsData {
  totalCartas: number;
  cartasCompletadas: number;
  cartasPendientes: number;
  eficienciaPromedio: number;
  costoPromedio: number;
  tiempoPromedio: number;
  tendencias: {
    cartas: number;
    eficiencia: number;
    costos: number;
  };
}

interface AlertData {
  id: string;
  tipo: 'warning' | 'error' | 'info';
  mensaje: string;
  timestamp: string;
}

export function IntelligentAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalCartas: 150,
    cartasCompletadas: 142,
    cartasPendientes: 8,
    eficienciaPromedio: 94.7,
    costoPromedio: 2500,
    tiempoPromedio: 45,
    tendencias: {
      cartas: 12,
      eficiencia: 3.2,
      costos: -8.5
    }
  });

  const [alerts, setAlerts] = useState<AlertData[]>([
    {
      id: '1',
      tipo: 'warning',
      mensaje: 'Vehículo ABC-123 requiere mantenimiento preventivo en 5 días',
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      tipo: 'info',
      mensaje: 'Nueva ruta optimizada disponible para reducir costos en 15%',
      timestamp: '2024-01-15T09:15:00Z'
    }
  ]);

  const chartData = [
    { mes: 'Ene', cartas: 120, eficiencia: 92, costos: 2800 },
    { mes: 'Feb', cartas: 135, eficiencia: 94, costos: 2650 },
    { mes: 'Mar', cartas: 150, eficiencia: 95, costos: 2500 }
  ];

  const distributionData = [
    { name: 'Completadas', value: 142, color: '#10b981' },
    { name: 'En Proceso', value: 6, color: '#f59e0b' },
    { name: 'Pendientes', value: 2, color: '#ef4444' }
  ];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Monitoreo inteligente de operaciones</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Zap className="h-4 w-4 mr-1" />
          IA Activa
        </Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cartas Porte</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCartas}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{analytics.tendencias.cartas}% vs mes anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia Operativa</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.eficienciaPromedio}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              +{analytics.tendencias.eficiencia}% vs mes anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Costo Promedio</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.costoPromedio.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
              {analytics.tendencias.costos}% vs mes anterior
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.tiempoPromedio}min</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-green-500" />
              -12% vs mes anterior
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
          <TabsTrigger value="distribution">Distribución</TabsTrigger>
          <TabsTrigger value="performance">Rendimiento</TabsTrigger>
          <TabsTrigger value="alerts">Alertas IA</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Cartas Porte por Mes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cartas" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eficiencia vs Costos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="eficiencia" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="costos" stroke="#f59e0b" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Estado de Cartas Porte</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumen Operativo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Completadas</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={94.7} className="w-20" />
                    <span className="text-sm text-muted-foreground">94.7%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">En Proceso</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={4} className="w-20" />
                    <span className="text-sm text-muted-foreground">4%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Pendientes</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={1.3} className="w-20" />
                    <span className="text-sm text-muted-foreground">1.3%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Rendimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-green-600">98.5%</div>
                  <div className="text-sm text-muted-foreground">Precisión IA</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-blue-600">2.3min</div>
                  <div className="text-sm text-muted-foreground">Tiempo Procesamiento</div>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-2xl font-bold text-purple-600">99.1%</div>
                  <div className="text-sm text-muted-foreground">Uptime Sistema</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Alert key={alert.id} className={
                alert.tipo === 'error' ? 'border-red-200 bg-red-50' :
                alert.tipo === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                'border-blue-200 bg-blue-50'
              }>
                {alert.tipo === 'error' && <AlertTriangle className="h-4 w-4" />}
                {alert.tipo === 'warning' && <AlertTriangle className="h-4 w-4" />}
                {alert.tipo === 'info' && <CheckCircle className="h-4 w-4" />}
                <AlertDescription>
                  {alert.mensaje}
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
