import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  AlertTriangle
} from 'lucide-react';
import { useDashboardRentabilidad } from '@/hooks/useDashboardRentabilidad';
import { useDashboardCounts } from '@/hooks/useDashboardCounts';
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
  const [reporteSeleccionado, setReporteSeleccionado] = useState<string | null>(null);
  const [configuracionPersonalizada, setConfiguracionPersonalizada] = useState({
    periodo: '30d',
    formato: 'pdf',
    incluir_graficos: true,
    enviar_email: false,
    destinatarios: ''
  });

  const reportesAvanzados: ReporteAvanzado[] = [
    {
      id: 'dashboard-ejecutivo-integral',
      nombre: 'Dashboard Ejecutivo Integral',
      categoria: 'ejecutivo',
      tipo: 'instantaneo',
      descripcion: 'Análisis completo con KPIs de rentabilidad, performance de flota y análisis predictivo',
      icon: TrendingUp,
      color: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      metricas: ['ROI', 'Margen Neto', 'Eficiencia Operativa', 'Tendencias'],
      tiempo_estimado: '3-5 min',
      requiere_configuracion: false,
      datos_integrados: ['rentabilidad', 'vehiculos', 'conductores', 'socios']
    },
    {
      id: 'analisis-rentabilidad-profundo',
      nombre: 'Análisis de Rentabilidad Profundo',
      categoria: 'financiero',
      tipo: 'personalizado',
      descripcion: 'Análisis detallado por ruta, vehículo y conductor con proyecciones',
      icon: DollarSign,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      metricas: ['Margen por Ruta', 'ROI Vehicular', 'Costo por KM', 'Proyecciones'],
      tiempo_estimado: '5-8 min',
      requiere_configuracion: true,
      datos_integrados: ['rentabilidad', 'vehiculos']
    },
    {
      id: 'performance-flota-conductores',
      nombre: 'Performance Integral de Flota',
      categoria: 'operativo',
      tipo: 'personalizado',
      descripcion: 'Evaluación completa de vehículos y conductores con recomendaciones',
      icon: Activity,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      metricas: ['Utilización', 'Eficiencia', 'Mantenimiento', 'Performance'],
      tiempo_estimado: '4-6 min',
      requiere_configuracion: true,
      datos_integrados: ['vehiculos', 'conductores']
    },
    {
      id: 'alertas-predictivas',
      nombre: 'Alertas y Análisis Predictivo',
      categoria: 'operativo',
      tipo: 'instantaneo',
      descripcion: 'Identificación proactiva de riesgos y oportunidades de mejora',
      icon: AlertTriangle,
      color: 'bg-gradient-to-r from-orange-500 to-orange-600',
      metricas: ['Riesgos Identificados', 'Oportunidades', 'Tendencias', 'Predicciones'],
      tiempo_estimado: '2-4 min',
      requiere_configuracion: false,
      datos_integrados: ['rentabilidad', 'vehiculos', 'conductores']
    },
    {
      id: 'compliance-operativo',
      nombre: 'Reporte de Compliance Operativo',
      categoria: 'compliance',
      tipo: 'personalizado',
      descripcion: 'Cumplimiento normativo, documentación y alertas regulatorias',
      icon: FileText,
      color: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
      metricas: ['Documentos Vigentes', 'Alertas Normativas', 'Cumplimiento %'],
      tiempo_estimado: '3-5 min',
      requiere_configuracion: true,
      datos_integrados: ['vehiculos', 'conductores']
    },
    {
      id: 'socios-colaboradores',
      nombre: 'Análisis de Socios y Colaboradores',
      categoria: 'ejecutivo',
      tipo: 'personalizado',
      descripcion: 'Performance de socios, distribución de cargas y análisis colaborativo',
      icon: Users,
      color: 'bg-gradient-to-r from-teal-500 to-teal-600',
      metricas: ['Performance Socios', 'Distribución', 'Colaboración', 'ROI Conjunto'],
      tiempo_estimado: '4-7 min',
      requiere_configuracion: true,
      datos_integrados: ['socios', 'rentabilidad']
    }
  ];

  const handleGenerarReporte = async (reporte: ReporteAvanzado) => {
    if (reporte.requiere_configuracion && !reporteSeleccionado) {
      setReporteSeleccionado(reporte.id);
      return;
    }

    toast.loading('Generando reporte avanzado...', { id: 'generando-reporte' });

    try {
      // Simular generación de reporte con datos reales
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aquí se integrarían los datos reales de las fases anteriores
      const datosIntegrados = {
        rentabilidad: dashboardData,
        conteos: counts,
        timestamp: new Date().toISOString(),
        configuracion: configuracionPersonalizada
      };

      console.log('Datos integrados para reporte:', datosIntegrados);
      
      toast.success(`Reporte "${reporte.nombre}" generado exitosamente`, { id: 'generando-reporte' });
      
      // Reset configuración
      setReporteSeleccionado(null);
      setConfiguracionPersonalizada({
        periodo: '30d',
        formato: 'pdf',
        incluir_graficos: true,
        enviar_email: false,
        destinatarios: ''
      });
    } catch (error) {
      toast.error('Error al generar reporte', { id: 'generando-reporte' });
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
                <CardTitle>Configurar Reporte Personalizado</CardTitle>
                <p className="text-muted-foreground">
                  {reportesAvanzados.find(r => r.id === reporteSeleccionado)?.descripcion}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="periodo">Período de Análisis</Label>
                    <Select value={configuracionPersonalizada.periodo} onValueChange={(value) => 
                      setConfiguracionPersonalizada(prev => ({ ...prev, periodo: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">Últimos 7 días</SelectItem>
                        <SelectItem value="30d">Últimos 30 días</SelectItem>
                        <SelectItem value="90d">Últimos 90 días</SelectItem>
                        <SelectItem value="1y">Último año</SelectItem>
                      </SelectContent>
                    </Select>
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

                <div>
                  <Label htmlFor="destinatarios">Destinatarios (opcional)</Label>
                  <Input
                    id="destinatarios"
                    placeholder="email1@empresa.com, email2@empresa.com"
                    value={configuracionPersonalizada.destinatarios}
                    onChange={(e) => setConfiguracionPersonalizada(prev => ({ 
                      ...prev, 
                      destinatarios: e.target.value 
                    }))}
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <Button variant="outline" onClick={() => setReporteSeleccionado(null)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => handleGenerarReporte(reportesAvanzados.find(r => r.id === reporteSeleccionado)!)}>
                    <Download className="h-4 w-4 mr-2" />
                    Generar Reporte
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