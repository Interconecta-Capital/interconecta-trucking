
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Fuel,
  Clock,
  Shield,
  Star
} from 'lucide-react';
import { PerformanceConductor } from '@/types/operadores';

interface PerformanceCardProps {
  performance: PerformanceConductor;
  conductorNombre: string;
}

export function PerformanceCard({ performance, conductorNombre }: PerformanceCardProps) {
  const { metricas, tendencias, recomendaciones } = performance;

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Performance - {conductorNombre}</span>
          <div className="flex items-center gap-2">
            {tendencias.mejora ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            <Badge variant={tendencias.mejora ? 'default' : 'destructive'}>
              {tendencias.mejora ? 'Mejorando' : 'Necesita atención'}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Métricas principales */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Fuel className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <div className={`text-2xl font-bold ${getScoreColor(metricas.eficienciaCombustible)}`}>
              {metricas.eficienciaCombustible.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">km/L</div>
          </div>
          
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Clock className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <div className={`text-2xl font-bold ${getScoreColor(metricas.puntualidad)}`}>
              {metricas.puntualidad.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Puntualidad</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Shield className="h-6 w-6 mx-auto mb-2 text-purple-600" />
            <div className={`text-2xl font-bold ${getScoreColor(metricas.cuidadoVehiculo * 20)}`}>
              {metricas.cuidadoVehiculo.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Cuidado</div>
          </div>
          
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <Star className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
            <div className={`text-2xl font-bold ${getScoreColor(metricas.satisfaccionCliente * 20)}`}>
              {metricas.satisfaccionCliente.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Satisfacción</div>
          </div>
        </div>

        {/* Barras de progreso */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Eficiencia de Combustible</span>
              <span>{metricas.eficienciaCombustible.toFixed(1)} km/L</span>
            </div>
            <Progress value={Math.min(100, (metricas.eficienciaCombustible / 15) * 100)} />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Puntualidad</span>
              <span>{metricas.puntualidad.toFixed(0)}%</span>
            </div>
            <Progress value={metricas.puntualidad} />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Satisfacción del Cliente</span>
              <span>{metricas.satisfaccionCliente.toFixed(1)}/5</span>
            </div>
            <Progress value={(metricas.satisfaccionCliente / 5) * 100} />
          </div>
        </div>

        {/* Fortalezas y áreas de mejora */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Fortalezas
            </h4>
            <div className="space-y-1">
              {tendencias.fortalezas.map((fortaleza, index) => (
                <Badge key={index} className="mr-1 mb-1 bg-green-100 text-green-800">
                  {fortaleza}
                </Badge>
              ))}
              {tendencias.fortalezas.length === 0 && (
                <p className="text-sm text-gray-500">No hay fortalezas destacadas</p>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-orange-700 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Áreas de Mejora
            </h4>
            <div className="space-y-1">
              {tendencias.areaMejora.map((area, index) => (
                <Badge key={index} className="mr-1 mb-1 bg-orange-100 text-orange-800">
                  {area}
                </Badge>
              ))}
              {tendencias.areaMejora.length === 0 && (
                <p className="text-sm text-gray-500">Excelente performance general</p>
              )}
            </div>
          </div>
        </div>

        {/* Recomendaciones */}
        {recomendaciones.capacitacion.length > 0 && (
          <div>
            <h4 className="font-medium text-blue-700 mb-2">Capacitación Recomendada</h4>
            <div className="space-y-1">
              {recomendaciones.capacitacion.map((capacitacion, index) => (
                <Badge key={index} variant="outline" className="mr-1 mb-1">
                  {capacitacion}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
