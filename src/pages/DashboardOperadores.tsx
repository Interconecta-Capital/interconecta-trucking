
import DashboardNavigation from '@/components/dashboard/DashboardNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Star, 
  TrendingUp, 
  Clock,
  Route,
  AlertTriangle,
  Award,
  Target
} from 'lucide-react';
import { useGestionOperadores } from '@/hooks/useGestionOperadores';

export default function DashboardOperadores() {
  const { conductores, loading } = useGestionOperadores();

  if (loading) {
    return (
      <div className="space-y-6">
        <DashboardNavigation />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando datos de operadores...</p>
          </div>
        </div>
      </div>
    );
  }

  const conductoresActivos = conductores.filter(c => c.estado === 'disponible');
  const promedioCalificacion = conductores.length > 0 
    ? conductores.reduce((sum, c) => sum + (c.historial_performance?.calificacion_promedio || 5), 0) / conductores.length
    : 5;

  return (
    <div className="space-y-6">
      <DashboardNavigation />
      
      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Operadores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conductores.length}</div>
            <div className="flex items-center text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2 este mes
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operadores Activos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conductoresActivos.length}</div>
            <div className="text-xs text-gray-600">
              {conductores.length > 0 ? Math.round((conductoresActivos.length / conductores.length) * 100) : 0}% disponibles
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calificación Promedio</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promedioCalificacion.toFixed(1)}</div>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star 
                  key={star} 
                  className={`h-3 w-3 ${star <= promedioCalificacion ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntualidad Promedio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <div className="text-xs text-green-600">Entregas a tiempo</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance de Operadores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            Performance de Operadores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {conductores.slice(0, 8).map((conductor) => {
              const performance = conductor.historial_performance;
              const calificacion = performance?.calificacion_promedio || 5;
              const puntualidad = performance?.puntualidad_promedio || 95;
              const viajes = performance?.viajes_completados || 0;
              
              return (
                <div key={conductor.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{conductor.nombre}</h3>
                        <Badge variant={conductor.estado === 'disponible' ? 'default' : 'secondary'}>
                          {conductor.estado}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>{viajes} viajes</span>
                        <span>Puntualidad: {puntualidad.toFixed(1)}%</span>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400 fill-current" />
                          <span>{calificacion.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Indicador de Performance General */}
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {calificacion >= 4.5 ? 'Excelente' : 
                         calificacion >= 4.0 ? 'Bueno' : 
                         calificacion >= 3.5 ? 'Regular' : 'Necesita Mejora'}
                      </div>
                      <Progress 
                        value={(calificacion / 5) * 100} 
                        className="w-20 h-2 mt-1"
                      />
                    </div>
                    
                    <Button variant="outline" size="sm">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Alertas y Recomendaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Alertas de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">2 operadores con baja puntualidad</p>
                  <p className="text-xs text-gray-600">Requieren capacitación en gestión del tiempo</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Route className="h-4 w-4 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">1 operador disponible para rutas especializadas</p>
                  <p className="text-xs text-gray-600">Certificado para materiales peligrosos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Oportunidades de Mejora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">Programa de Capacitación</h4>
                <p className="text-xs text-gray-600 mt-1">
                  3 operadores se beneficiarían de capacitación en manejo eco-eficiente
                </p>
              </div>
              
              <div className="p-3 border rounded-lg">
                <h4 className="font-medium text-sm">Optimización de Asignaciones</h4>
                <p className="text-xs text-gray-600 mt-1">
                  Redistribuir rutas según especialización para mejorar eficiencia 15%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
