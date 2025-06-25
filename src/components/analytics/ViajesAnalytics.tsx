
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Truck, 
  Clock, 
  MapPin, 
  DollarSign,
  Calendar,
  Users,
  Fuel,
  AlertTriangle
} from 'lucide-react';

interface AnalyticsData {
  viajes: {
    total: number;
    completados: number;
    enTransito: number;
    programados: number;
    cancelados: number;
    promedioDuracion: number;
    promedioDistancia: number;
  };
  costos: {
    combustible: number;
    casetas: number;
    mantenimiento: number;
    operadores: number;
    total: number;
  };
  eficiencia: {
    puntualidad: number;
    utilizacionFlota: number;
    kmPorLitro: number;
    costoPorKm: number;
  };
  tendencias: Array<{
    mes: string;
    viajes: number;
    costos: number;
    eficiencia: number;
  }>;
}

export const ViajesAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30days');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Simular datos de analytics
      const mockData: AnalyticsData = {
        viajes: {
          total: 156,
          completados: 142,
          enTransito: 8,
          programados: 4,
          cancelados: 2,
          promedioDuracion: 6.5,
          promedioDistancia: 485
        },
        costos: {
          combustible: 85600,
          casetas: 12400,
          mantenimiento: 8500,
          operadores: 45000,
          total: 151500
        },
        eficiencia: {
          puntualidad: 94.2,
          utilizacionFlota: 78.5,
          kmPorLitro: 3.2,
          costoPorKm: 2.15
        },
        tendencias: [
          { mes: 'Ene', viajes: 45, costos: 48000, eficiencia: 92 },
          { mes: 'Feb', viajes: 52, costos: 52000, eficiencia: 94 },
          { mes: 'Mar', viajes: 48, costos: 49500, eficiencia: 93 },
          { mes: 'Abr', viajes: 56, costos: 58000, eficiencia: 95 },
          { mes: 'May', viajes: 61, costos: 61200, eficiencia: 96 },
          { mes: 'Jun', viajes: 58, costos: 59800, eficiencia: 94 }
        ]
      };

      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error cargando analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const pieData = analyticsData ? [
    { name: 'Completados', value: analyticsData.viajes.completados, color: '#10B981' },
    { name: 'En Tránsito', value: analyticsData.viajes.enTransito, color: '#3B82F6' },
    { name: 'Programados', value: analyticsData.viajes.programados, color: '#F59E0B' },
    { name: 'Cancelados', value: analyticsData.viajes.cancelados, color: '#EF4444' }
  ] : [];

  const costosData = analyticsData ? [
    { name: 'Combustible', value: analyticsData.costos.combustible },
    { name: 'Casetas', value: analyticsData.costos.casetas },
    { name: 'Mantenimiento', value: analyticsData.costos.mantenimiento },
    { name: 'Operadores', value: analyticsData.costos.operadores }
  ] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando analytics...</span>
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics de Viajes</h2>
          <p className="text-muted-foreground">
            Análisis detallado del desempeño de su flota
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Últimos 7 días</SelectItem>
              <SelectItem value="30days">Últimos 30 días</SelectItem>
              <SelectItem value="90days">Últimos 3 meses</SelectItem>
              <SelectItem value="year">Último año</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadAnalyticsData} variant="outline">
            Actualizar
          </Button>
        </div>
      </div>

      {/* KPIs principales */}
      <div className="summary-cards-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Viajes</p>
                <p className="text-2xl font-bold">{analyticsData.viajes.total}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% vs mes anterior
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Puntualidad</p>
                <p className="text-2xl font-bold">{analyticsData.eficiencia.puntualidad}%</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.1% vs mes anterior
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Costo Total</p>
                <p className="text-2xl font-bold">{formatCurrency(analyticsData.costos.total)}</p>
                <p className="text-xs text-red-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5% vs mes anterior
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Km/Litro</p>
                <p className="text-2xl font-bold">{analyticsData.eficiencia.kmPorLitro}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +0.3 vs mes anterior
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Fuel className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales */}
      <Tabs defaultValue="tendencias" className="w-full">
        <TabsList>
          <TabsTrigger value="tendencias">Tendencias</TabsTrigger>
          <TabsTrigger value="estados">Estados de Viajes</TabsTrigger>
          <TabsTrigger value="costos">Análisis de Costos</TabsTrigger>
          <TabsTrigger value="eficiencia">Eficiencia</TabsTrigger>
        </TabsList>

        <TabsContent value="tendencias" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tendencia de Viajes y Costos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="chart-scroll-wrapper">
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={analyticsData.tendencias}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="viajes"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="costos"
                    stroke="#EF4444"
                    strokeWidth={3}
                  />
                </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estados" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Viajes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Viajes Completados</span>
                  <Badge variant="default">{analyticsData.viajes.completados}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Promedio de Duración</span>
                  <Badge variant="secondary">{analyticsData.viajes.promedioDuracion}h</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Promedio de Distancia</span>
                  <Badge variant="secondary">{analyticsData.viajes.promedioDistancia}km</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Utilización de Flota</span>
                  <Badge variant="outline">{analyticsData.eficiencia.utilizacionFlota}%</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="costos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Desglose de Costos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="chart-scroll-wrapper">
                <ResponsiveContainer width="100%" height={400}>
                <BarChart data={costosData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Costo por Kilómetro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {formatCurrency(analyticsData.eficiencia.costoPorKm)}
                  </div>
                  <p className="text-sm text-muted-foreground">por kilómetro</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eficiencia de Combustible</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {analyticsData.eficiencia.kmPorLitro}
                  </div>
                  <p className="text-sm text-muted-foreground">km por litro</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="eficiencia" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Índices de Eficiencia</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="chart-scroll-wrapper">
                <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData.tendencias}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="eficiencia" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ r: 6 }}
                  />
                </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <h3 className="font-semibold">Alertas Activas</h3>
                  <div className="text-2xl font-bold text-yellow-600">3</div>
                  <p className="text-sm text-muted-foreground">Requieren atención</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h3 className="font-semibold">Conductores Activos</h3>
                  <div className="text-2xl font-bold text-blue-600">12</div>
                  <p className="text-sm text-muted-foreground">De 15 totales</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <Calendar className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <h3 className="font-semibold">Próximos Viajes</h3>
                  <div className="text-2xl font-bold text-purple-600">8</div>
                  <p className="text-sm text-muted-foreground">En las próximas 24h</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
