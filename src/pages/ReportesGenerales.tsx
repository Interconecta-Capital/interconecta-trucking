import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  BarChart3,
  PieChart,
  Clock,
  Filter,
  Send,
  Eye
} from 'lucide-react';
import DashboardNavigation from '@/components/dashboard/DashboardNavigation';
import { CentroReportes } from '@/components/reportes/CentroReportes';
import { CentroReportesAvanzado } from '@/components/reportes/CentroReportesAvanzado';
import { Link } from 'react-router-dom';

export default function ReportesGenerales() {
  const [reporteSeleccionado, setReporteSeleccionado] = useState<string | null>(null);

  const reportesDisponibles = [
    {
      id: 'rentabilidad-mensual',
      nombre: 'Reporte de Rentabilidad Mensual',
      descripcion: 'Análisis completo de rentabilidad por rutas, vehículos y conductores',
      tipo: 'ejecutivo',
      icon: TrendingUp,
      color: 'bg-green-500',
      formatos: ['PDF', 'Excel'],
      tiempo_estimado: '5-10 min',
      ultima_generacion: '15 Dic 2024',
      popularidad: 95
    },
    {
      id: 'operaciones-diario',
      nombre: 'Reporte Operacional Diario',
      descripcion: 'Resumen de operaciones, viajes completados y alertas del día',
      tipo: 'operativo',
      icon: Calendar,
      color: 'bg-blue-500',
      formatos: ['PDF', 'Email'],
      tiempo_estimado: '2-3 min',
      ultima_generacion: 'Hoy',
      popularidad: 88
    },
    {
      id: 'performance-conductores',
      nombre: 'Performance de Conductores',
      descripcion: 'Evaluación detallada del desempeño de cada conductor',
      tipo: 'recursos-humanos',
      icon: BarChart3,
      color: 'bg-purple-500',
      formatos: ['PDF', 'Excel'],
      tiempo_estimado: '3-5 min',
      ultima_generacion: '10 Dic 2024',
      popularidad: 75
    },
    {
      id: 'analisis-flota',
      nombre: 'Análisis de Flota',
      descripcion: 'Utilización, mantenimiento y ROI de cada vehículo',
      tipo: 'flota',
      icon: PieChart,
      color: 'bg-orange-500',
      formatos: ['PDF', 'Excel'],
      tiempo_estimado: '4-6 min',
      ultima_generacion: '12 Dic 2024',
      popularidad: 82
    }
  ];

  const reportesRecientes = [
    {
      nombre: 'Rentabilidad Noviembre 2024',
      fecha: '1 Dic 2024',
      formato: 'PDF',
      tamaño: '2.4 MB',
      estado: 'Completado'
    },
    {
      nombre: 'Operaciones 15 Dic 2024',
      fecha: '15 Dic 2024',
      formato: 'PDF',
      tamaño: '850 KB',
      estado: 'Completado'
    },
    {
      nombre: 'Performance Q4 2024',
      fecha: '14 Dic 2024',
      formato: 'Excel',
      tamaño: '1.2 MB',
      estado: 'Completado'
    }
  ];

  return (
    <div className="space-y-6">
      <DashboardNavigation />
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Centro de Reportes</h1>
            <p className="text-muted-foreground mt-2">
              Genera y gestiona reportes empresariales con un clic
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/dashboard/reportes-automaticos">
              <Button variant="outline" className="hover-scale">
                <Clock className="h-4 w-4 mr-2" />
                Reportes Automáticos
              </Button>
            </Link>
            <Button className="bg-gradient-primary">
              <Filter className="h-4 w-4 mr-2" />
              Reporte Personalizado
            </Button>
          </div>
        </div>

        <Tabs defaultValue="avanzados" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="avanzados">Reportes Avanzados</TabsTrigger>
            <TabsTrigger value="generar">Reportes Básicos</TabsTrigger>
            <TabsTrigger value="historial">Historial</TabsTrigger>
            <TabsTrigger value="plantillas">Plantillas</TabsTrigger>
          </TabsList>

          <TabsContent value="avanzados">
            <CentroReportesAvanzado />
          </TabsContent>

          <TabsContent value="generar" className="space-y-6">
            {/* Centro de Reportes Integrado */}
            <div className="mb-8">
              <CentroReportes />
            </div>

            {/* Métricas rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">24</div>
                      <div className="text-sm text-muted-foreground">Reportes este mes</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Download className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">156</div>
                      <div className="text-sm text-muted-foreground">Descargas totales</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Send className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">48</div>
                      <div className="text-sm text-muted-foreground">Enviados por email</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">3.2 min</div>
                      <div className="text-sm text-muted-foreground">Tiempo promedio</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reportes disponibles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reportesDisponibles.map((reporte) => (
                <Card key={reporte.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-lg ${reporte.color}`}>
                          <reporte.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{reporte.nombre}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            {reporte.tipo}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>{reporte.popularidad}% popularidad</div>
                        <div>{reporte.tiempo_estimado}</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{reporte.descripcion}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex gap-2">
                        {reporte.formatos.map((formato) => (
                          <Badge key={formato} variant="outline" className="text-xs">
                            {formato}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Último: {reporte.ultima_generacion}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button className="flex-1" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Generar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="historial" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reportes Generados Recientemente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportesRecientes.map((reporte, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <FileText className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium">{reporte.nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {reporte.fecha} • {reporte.formato} • {reporte.tamaño}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{reporte.estado}</Badge>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plantillas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Plantillas de Reportes</CardTitle>
                <p className="text-muted-foreground">
                  Próximamente: Crea tus propias plantillas personalizadas
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Esta funcionalidad estará disponible pronto</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}