import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { 
  TrendingUp, 
  BarChart3, 
  Download, 
  Mail, 
  Calendar, 
  Clock,
  Filter,
  Zap,
  FileText,
  PieChart,
  Activity,
  DollarSign,
  Users,
  Truck,
  AlertTriangle,
  Brain,
  Target,
  Shield,
  LineChart
} from 'lucide-react';
import { useDashboardRentabilidad } from '@/hooks/useDashboardRentabilidad';
import { useDashboardCounts } from '@/hooks/useDashboardCounts';
import { useSmartReportGenerator } from '@/hooks/useSmartReportGenerator';
import { useViajesEstados } from '@/hooks/useViajesEstados';
import { useConductores } from '@/hooks/useConductores';
import { useVehiculos } from '@/hooks/useVehiculos';
import { toast } from 'sonner';

interface ReporteAvanzado {
  id: string;
  nombre: string;
  categoria: 'ejecutivo' | 'operativo' | 'financiero' | 'compliance';
  tipo: 'instantaneo' | 'personalizado';
  descripcion: string;
  icon: React.ComponentType<any>;
  color: string;
  metricas: string[];
  tiempo_estimado: string;
  requiere_configuracion: boolean;
  datos_integrados: ('rentabilidad' | 'vehiculos' | 'conductores' | 'socios')[];
}

export function CentroReportesAvanzado() {
  const { dashboardData, loading: loadingRentabilidad } = useDashboardRentabilidad();
  const { data: counts, isLoading: loadingCounts } = useDashboardCounts();
  const { generarReporteInteligente, isGenerating } = useSmartReportGenerator();
  const { viajesActivos: viajesData } = useViajesEstados();
  const { conductores: conductoresData } = useConductores();
  const { vehiculos: vehiculosData } = useVehiculos();
  
  const [reporteSeleccionado, setReporteSeleccionado] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(
    { from: new Date(), to: new Date() }
  );
  const [configuracionPersonalizada, setConfiguracionPersonalizada] = useState({
    periodo: '30d',
    formato: 'pdf',
    incluir_graficos: true,
    incluir_analisis_predictivo: true,
    incluir_recomendaciones: true,
    enviar_email: false,
    destinatarios: '',
    filtros: {
      conductores: [] as string[],
      vehiculos: [] as string[],
      estados: [] as string[]
    }
  });

  const reportesAvanzados: ReporteAvanzado[] = [
    {
      id: 'rentabilidad-predictiva',
      nombre: 'Análisis de Rentabilidad Predictiva',
      categoria: 'ejecutivo',
      tipo: 'personalizado',
      descripcion: 'Análisis profundo con predicciones de rentabilidad y optimización de rutas usando IA',
      icon: Brain,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      metricas: ['Predicciones ML', 'ROI Proyectado', 'Optimización Rutas', 'Tendencias Avanzadas'],
      tiempo_estimado: '5-8 min',
      requiere_configuracion: true,
      datos_integrados: ['rentabilidad', 'vehiculos', 'conductores']
    },
    {
      id: 'performance-integral',
      nombre: 'Performance Integral 360°',
      categoria: 'operativo',
      tipo: 'personalizado',
      descripcion: 'Evaluación completa de todos los aspectos operacionales con KPIs avanzados y benchmarking',
      icon: Target,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      metricas: ['KPIs Operacionales', 'Eficiencia Flota', 'Performance Conductores', 'Benchmarking'],
      tiempo_estimado: '6-10 min',
      requiere_configuracion: true,
      datos_integrados: ['rentabilidad', 'vehiculos', 'conductores']
    },
    {
      id: 'analisis-competitivo',
      nombre: 'Análisis Competitivo y Benchmarking',
      categoria: 'ejecutivo',
      tipo: 'personalizado',
      descripcion: 'Comparativa con estándares de la industria y análisis de posicionamiento de mercado',
      icon: TrendingUp,
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      metricas: ['Benchmarks Industria', 'Posición Competitiva', 'Oportunidades', 'Análisis FODA'],
      tiempo_estimado: '4-6 min',
      requiere_configuracion: true,
      datos_integrados: ['rentabilidad', 'vehiculos']
    },
    {
      id: 'riesgos-alertas',
      nombre: 'Gestión de Riesgos y Alertas Tempranas',
      categoria: 'operativo',
      tipo: 'instantaneo',
      descripcion: 'Identificación proactiva de riesgos operacionales y financieros con sistema de alertas',
      icon: Shield,
      color: 'bg-gradient-to-r from-red-500 to-orange-500',
      metricas: ['Matriz de Riesgos', 'Alertas Tempranas', 'Planes Contingencia', 'Impacto Financiero'],
      tiempo_estimado: '3-5 min',
      requiere_configuracion: false,
      datos_integrados: ['rentabilidad', 'vehiculos', 'conductores']
    },
    {
      id: 'dashboard-ejecutivo-integral',
      nombre: 'Dashboard Ejecutivo Integral',
      categoria: 'ejecutivo',
      tipo: 'instantaneo',
      descripcion: 'Resumen ejecutivo completo con métricas clave y tendencias para toma de decisiones',
      icon: LineChart,
      color: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      metricas: ['ROI Consolidado', 'Métricas Clave', 'Tendencias', 'Resumen Ejecutivo'],
      tiempo_estimado: '3-5 min',
      requiere_configuracion: false,
      datos_integrados: ['rentabilidad', 'vehiculos', 'conductores', 'socios']
    },
    {
      id: 'compliance-operativo',
      nombre: 'Reporte de Compliance y Normatividad',
      categoria: 'compliance',
      tipo: 'personalizado',
      descripcion: 'Cumplimiento normativo, documentación vigente y alertas regulatorias',
      icon: FileText,
      color: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
      metricas: ['Documentos Vigentes', 'Alertas Normativas', 'Cumplimiento %', 'Vencimientos'],
      tiempo_estimado: '3-5 min',
      requiere_configuracion: true,
      datos_integrados: ['vehiculos', 'conductores']
    }
  ];

  const handleGenerarReporte = async (reporte: ReporteAvanzado) => {
    if (reporte.requiere_configuracion && !reporteSeleccionado) {
      setReporteSeleccionado(reporte.id);
      return;
    }

    if (!dateRange?.from || !dateRange?.to) {
      toast.error('Selecciona un rango de fechas válido');
      return;
    }

    try {
      const reportData = {
        tipo: configuracionPersonalizada.periodo === '7d' ? 'semanal' : 
              configuracionPersonalizada.periodo === '30d' ? 'mensual' : 'trimestral' as 'semanal' | 'mensual' | 'trimestral',
        periodo: {
          inicio: dateRange.from.toISOString(),
          fin: dateRange.to.toISOString()
        },
        incluirSecciones: {
          resumenEjecutivo: true,
          metricasFinancieras: true,
          analisisOperacional: true,
          performanceFlota: configuracionPersonalizada.incluir_graficos,
          recomendaciones: configuracionPersonalizada.incluir_recomendaciones
        }
      };

      await generarReporteInteligente.mutateAsync(reportData);
      
      // Reset configuración
      setReporteSeleccionado(null);
      setConfiguracionPersonalizada({
        periodo: '30d',
        formato: 'pdf',
        incluir_graficos: true,
        incluir_analisis_predictivo: true,
        incluir_recomendaciones: true,
        enviar_email: false,
        destinatarios: '',
        filtros: { conductores: [], vehiculos: [], estados: [] }
      });
    } catch (error) {
      console.error('Error generando reporte:', error);
    }
  };

  const getEstadisticasRapidas = () => {
    if (loadingRentabilidad || loadingCounts) return null;

    return {
      ingresoTotal: dashboardData?.kpis?.ingresoTotal || 0,
      margenPromedio: dashboardData?.kpis?.margenPromedio || 0,
      viajesCompletados: dashboardData?.kpis?.viajesCompletados || 0,
      utilizacionFlota: dashboardData?.kpis?.utilizacionFlota || 0,
      vehiculosActivos: counts?.vehiculos || 0,
      conductoresActivos: counts?.conductores || 0
    };
  };

  const estadisticas = getEstadisticasRapidas();

  return (
    <div className="space-y-6">
      {/* Estadísticas de Integración */}
      {estadisticas && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              <div>
                <div className="text-lg font-bold">${estadisticas.ingresoTotal.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Ingresos</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-lg font-bold">{estadisticas.margenPromedio.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground">Margen</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-lg font-bold">{estadisticas.viajesCompletados}</div>
                <div className="text-xs text-muted-foreground">Viajes</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-lg font-bold">{estadisticas.vehiculosActivos}</div>
                <div className="text-xs text-muted-foreground">Vehículos</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-indigo-600" />
              <div>
                <div className="text-lg font-bold">{estadisticas.conductoresActivos}</div>
                <div className="text-xs text-muted-foreground">Conductores</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-teal-600" />
              <div>
                <div className="text-lg font-bold">{estadisticas.utilizacionFlota.toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground">Utilización</div>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Tabs defaultValue="reportes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reportes">Reportes Avanzados</TabsTrigger>
          <TabsTrigger value="analytics">Analytics en Tiempo Real</TabsTrigger>
          <TabsTrigger value="configuracion">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="reportes" className="space-y-6">
          {reporteSeleccionado ? (
            <Card>
              <CardHeader>
                <CardTitle>Configurar Reporte Inteligente</CardTitle>
                <p className="text-muted-foreground">
                  {reportesAvanzados.find(r => r.id === reporteSeleccionado)?.descripcion}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Rango de Fechas</Label>
                    <DatePickerWithRange
                      date={dateRange}
                      onDateChange={(date) => setDateRange(date as { from: Date; to: Date })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <Label htmlFor="formato">Formato de Salida</Label>
                    <Select value={configuracionPersonalizada.formato} onValueChange={(value) => 
                      setConfiguracionPersonalizada(prev => ({ ...prev, formato: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF Ejecutivo</SelectItem>
                        <SelectItem value="excel">Excel Detallado</SelectItem>
                        <SelectItem value="powerpoint">PowerPoint Presentación</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Filtros avanzados */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Conductores Específicos</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los conductores" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos los conductores</SelectItem>
                        {conductoresData?.filter(c => c.activo).map(conductor => (
                          <SelectItem key={conductor.id} value={conductor.id}>
                            {conductor.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Vehículos Específicos</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Toda la flota" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Toda la flota</SelectItem>
                        {vehiculosData?.filter(v => v.activo).map(vehiculo => (
                          <SelectItem key={vehiculo.id} value={vehiculo.id}>
                            {vehiculo.placa} - {vehiculo.marca}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Opciones avanzadas */}
                <div className="space-y-3">
                  <Label>Opciones del Reporte</Label>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="graficos"
                      checked={configuracionPersonalizada.incluir_graficos}
                      onCheckedChange={(checked) => 
                        setConfiguracionPersonalizada(prev => ({ ...prev, incluir_graficos: !!checked }))
                      }
                    />
                    <Label htmlFor="graficos" className="text-sm">
                      Incluir gráficos y visualizaciones
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="predictivo"
                      checked={configuracionPersonalizada.incluir_analisis_predictivo}
                      onCheckedChange={(checked) => 
                        setConfiguracionPersonalizada(prev => ({ ...prev, incluir_analisis_predictivo: !!checked }))
                      }
                    />
                    <Label htmlFor="predictivo" className="text-sm">
                      Incluir análisis predictivo con IA
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="recomendaciones"
                      checked={configuracionPersonalizada.incluir_recomendaciones}
                      onCheckedChange={(checked) => 
                        setConfiguracionPersonalizada(prev => ({ ...prev, incluir_recomendaciones: !!checked }))
                      }
                    />
                    <Label htmlFor="recomendaciones" className="text-sm">
                      Incluir recomendaciones inteligentes
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="email"
                      checked={configuracionPersonalizada.enviar_email}
                      onCheckedChange={(checked) => 
                        setConfiguracionPersonalizada(prev => ({ ...prev, enviar_email: !!checked }))
                      }
                    />
                    <Label htmlFor="email" className="text-sm">
                      Enviar por email automáticamente
                    </Label>
                  </div>
                </div>

                {configuracionPersonalizada.enviar_email && (
                  <div>
                    <Label htmlFor="destinatarios">Destinatarios</Label>
                    <Textarea
                      id="destinatarios"
                      placeholder="email1@empresa.com, email2@empresa.com"
                      value={configuracionPersonalizada.destinatarios}
                      onChange={(e) => setConfiguracionPersonalizada(prev => ({ 
                        ...prev, 
                        destinatarios: e.target.value 
                      }))}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-4">
                  <Button variant="outline" onClick={() => setReporteSeleccionado(null)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={() => handleGenerarReporte(reportesAvanzados.find(r => r.id === reporteSeleccionado)!)}
                    disabled={isGenerating}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    {isGenerating ? (
                      <>
                        <Zap className="h-4 w-4 mr-2 animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Generar Reporte Inteligente
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportesAvanzados.map((reporte) => (
                <Card key={reporte.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${reporte.color}`}>
                          <reporte.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{reporte.nombre}</CardTitle>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {reporte.categoria}
                            </Badge>
                            <Badge variant={reporte.tipo === 'instantaneo' ? 'default' : 'outline'} className="text-xs">
                              {reporte.tipo}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {reporte.tiempo_estimado}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{reporte.descripcion}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Métricas Incluidas:</div>
                        <div className="flex flex-wrap gap-1">
                          {reporte.metricas.map((metrica) => (
                            <Badge key={metrica} variant="outline" className="text-xs">
                              {metrica}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Datos Integrados:</div>
                        <div className="flex flex-wrap gap-1">
                          {reporte.datos_integrados.map((dato) => (
                            <Badge key={dato} variant="secondary" className="text-xs">
                              {dato}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Button 
                        className="flex-1" 
                        size="sm"
                        onClick={() => handleGenerarReporte(reporte)}
                      >
                        {reporte.requiere_configuracion ? (
                          <>
                            <Filter className="h-4 w-4 mr-2" />
                            Configurar
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Generar Ahora
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics en Tiempo Real</CardTitle>
              <p className="text-muted-foreground">
                Próximamente: Dashboard interactivo con métricas en tiempo real
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Esta funcionalidad estará disponible en la siguiente actualización</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuración Global de Reportes</CardTitle>
              <p className="text-muted-foreground">
                Configura preferencias globales para todos los reportes
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Panel de configuración en desarrollo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}