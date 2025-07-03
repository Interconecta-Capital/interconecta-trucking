
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Lightbulb, 
  TrendingUp, 
  ArrowRight,
  Truck, 
  Route, 
  DollarSign, 
  Settings
} from 'lucide-react';
import { useRecomendaciones } from '@/hooks/useRecomendaciones';
import { RecomendacionInteligente } from '@/types/recomendaciones';

interface RecomendacionesWidgetProps {
  contexto?: any;
  onVerTodas?: () => void;
  className?: string;
}

export const RecomendacionesWidget: React.FC<RecomendacionesWidgetProps> = ({
  contexto,
  onVerTodas,
  className = ""
}) => {
  const { topRecomendaciones, obtenerTopRecomendaciones, loading } = useRecomendaciones();

  React.useEffect(() => {
    if (contexto) {
      obtenerTopRecomendaciones(contexto, 3);
    }
  }, [contexto, obtenerTopRecomendaciones]);

  const getIconoPorTipo = (tipo: RecomendacionInteligente['tipo']) => {
    switch (tipo) {
      case 'vehiculo': return <Truck className="h-4 w-4 text-blue-600" />;
      case 'ruta': return <Route className="h-4 w-4 text-green-600" />;
      case 'precio': return <DollarSign className="h-4 w-4 text-purple-600" />;
      case 'operacion': return <Settings className="h-4 w-4 text-orange-600" />;
    }
  };

  const getImpactoTotal = () => {
    return topRecomendaciones.reduce((total, rec) => 
      total + (rec.impactoEconomico.ahorro || 0) + (rec.impactoEconomico.ingresoAdicional || 0)
    , 0);
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            Recomendaciones IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <span className="ml-2 text-sm">Generando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            Recomendaciones IA
          </div>
          {topRecomendaciones.length > 0 && (
            <div className="flex items-center gap-2 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">
                +${getImpactoTotal().toLocaleString()}
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topRecomendaciones.length === 0 ? (
          <div className="text-center py-6">
            <Lightbulb className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No hay recomendaciones disponibles</p>
            <p className="text-xs text-gray-400 mt-1">
              Registra más viajes para obtener sugerencias personalizadas
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {topRecomendaciones.map((recomendacion) => (
              <div 
                key={recomendacion.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getIconoPorTipo(recomendacion.tipo)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {recomendacion.titulo}
                    </h4>
                    <Badge 
                      size="sm" 
                      variant="outline"
                      className={
                        recomendacion.prioridad === 'alta' 
                          ? 'border-red-300 text-red-700' 
                          : recomendacion.prioridad === 'media'
                          ? 'border-yellow-300 text-yellow-700'
                          : 'border-green-300 text-green-700'
                      }
                    >
                      {recomendacion.prioridad}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {recomendacion.descripcion}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-green-600 font-medium">
                      {recomendacion.impactoEconomico.ahorro && `Ahorro: $${recomendacion.impactoEconomico.ahorro.toLocaleString()}`}
                      {recomendacion.impactoEconomico.ingresoAdicional && `Ingreso: +$${recomendacion.impactoEconomico.ingresoAdicional.toLocaleString()}`}
                    </span>
                    <Badge variant="outline" size="sm" className="text-xs">
                      {recomendacion.facilidadImplementacion}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            
            {onVerTodas && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onVerTodas}
                className="w-full mt-3"
              >
                Ver todas las recomendaciones
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
