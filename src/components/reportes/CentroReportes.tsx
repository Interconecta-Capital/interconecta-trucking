import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  TrendingUp, 
  FileText, 
  Download, 
  Send,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Settings,
  Filter,
  Plus,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface AccionRapida {
  id: string;
  titulo: string;
  descripcion: string;
  icon: any;
  color: string;
  href?: string;
  accion?: () => void;
  badge?: string;
}

interface ReporteSugerido {
  id: string;
  nombre: string;
  descripcion: string;
  icon: any;
  popularidad: number;
  tiempo_estimado: string;
  categoria: string;
}

export function CentroReportes() {
  const [reporteSeleccionado, setReporteSeleccionado] = useState<string | null>(null);

  const accionesRapidas: AccionRapida[] = [
    {
      id: 'reporte-rentabilidad',
      titulo: 'Rentabilidad Actual',
      descripcion: 'Genera reporte de rentabilidad del mes en curso',
      icon: TrendingUp,
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      accion: () => console.log('Generar rentabilidad'),
      badge: 'Más popular'
    },
    {
      id: 'estado-flota',
      titulo: 'Estado de Flota',
      descripcion: 'Resumen completo del estado actual de vehículos',
      icon: Target,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      accion: () => console.log('Estado flota')
    },
    {
      id: 'reportes-automaticos',
      titulo: 'Configurar Automáticos',
      descripcion: 'Programa reportes para generación automática',
      icon: Calendar,
      color: 'bg-gradient-to-r from-purple-500 to-violet-500',
      href: '/dashboard/reportes-automaticos'
    },
    {
      id: 'dashboard-ejecutivo',
      titulo: 'Dashboard Ejecutivo',
      descripcion: 'Vista completa de métricas y KPIs empresariales',
      icon: BarChart3,
      color: 'bg-gradient-to-r from-orange-500 to-red-500',
      href: '/dashboard-ejecutivo',
      badge: 'Premium'
    }
  ];

  const reportesSugeridos: ReporteSugerido[] = [
    {
      id: 'performance-semanal',
      nombre: 'Performance Semanal',
      descripcion: 'Análisis de desempeño de la última semana',
      icon: BarChart3,
      popularidad: 92,
      tiempo_estimado: '3-5 min',
      categoria: 'Operativo'
    },
    {
      id: 'costos-mensuales',
      nombre: 'Análisis de Costos',
      descripcion: 'Desglose detallado de costos operativos',
      icon: PieChart,
      popularidad: 87,
      tiempo_estimado: '5-8 min',
      categoria: 'Financiero'
    },
    {
      id: 'cumplimiento-objetivos',
      nombre: 'Cumplimiento de Objetivos',
      descripcion: 'Progreso hacia metas establecidas',
      icon: Target,
      popularidad: 78,
      tiempo_estimado: '2-4 min',
      categoria: 'Estratégico'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Acciones Rápidas */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {accionesRapidas.map((accion) => (
            <Card key={accion.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 rounded-lg ${accion.color}`}>
                    <accion.icon className="h-6 w-6 text-white" />
                  </div>
                  {accion.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {accion.badge}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold mb-2">{accion.titulo}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {accion.descripcion}
                </p>
                {accion.href ? (
                  <Link to={accion.href}>
                    <Button className="w-full" size="sm">
                      Acceder
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    className="w-full" 
                    size="sm" 
                    onClick={accion.accion}
                  >
                    Generar
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Reportes Sugeridos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Reportes Sugeridos
          </h2>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Personalizar
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reportesSugeridos.map((reporte) => (
            <Card key={reporte.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <reporte.icon className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{reporte.nombre}</CardTitle>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {reporte.categoria}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  {reporte.descripcion}
                </p>
                
                <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
                  <span>{reporte.popularidad}% popularidad</span>
                  <span>{reporte.tiempo_estimado}</span>
                </div>
                
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
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
      </div>

      {/* Centro de Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Centro de Control de Reportes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium">Configuración</h4>
              <div className="space-y-2">
                <Link to="/dashboard/reportes-automaticos">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Reportes Automáticos
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Plantillas Personalizadas
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Distribución</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Send className="h-4 w-4 mr-2" />
                  Configurar Emails
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Horarios de Envío
                </Button>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Análisis</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Métricas de Uso
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Tendencias
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}