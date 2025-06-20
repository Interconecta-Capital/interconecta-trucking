
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  AlertTriangle, 
  TrendingUp, 
  ChevronRight,
  Sparkles,
  Target
} from 'lucide-react';
import { Insight } from '@/hooks/usePersonalProgress';

interface InsightsPanelProps {
  insights: Insight[];
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
  const getInsightIcon = (tipo: string) => {
    switch (tipo) {
      case 'recomendacion': return Lightbulb;
      case 'alerta': return AlertTriangle;
      case 'oportunidad': return TrendingUp;
      default: return Sparkles;
    }
  };

  const getInsightColor = (tipo: string, prioridad: string) => {
    if (prioridad === 'alta') {
      return tipo === 'alerta' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50';
    }
    if (prioridad === 'media') {
      return 'border-blue-200 bg-blue-50';
    }
    return 'border-gray-200 bg-gray-50';
  };

  const getTextColor = (tipo: string, prioridad: string) => {
    if (prioridad === 'alta') {
      return tipo === 'alerta' ? 'text-red-800' : 'text-green-800';
    }
    if (prioridad === 'media') {
      return 'text-blue-800';
    }
    return 'text-gray-700';
  };

  const getBadgeColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-300';
      case 'media': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Insights Personalizados
        </CardTitle>
        <p className="text-sm text-gray-600">
          Recomendaciones basadas en tu actividad para maximizar tu eficiencia
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              ¡Perfecto! No hay recomendaciones pendientes.
            </p>
            <p className="text-sm text-gray-500">
              Estás usando la plataforma de manera óptima.
            </p>
          </div>
        ) : (
          insights.map((insight) => {
            const Icon = getInsightIcon(insight.tipo);
            return (
              <div 
                key={insight.id}
                className={`p-4 rounded-lg border-2 ${getInsightColor(insight.tipo, insight.prioridad)}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-white/70`}>
                    <Icon className={`h-5 w-5 ${getTextColor(insight.tipo, insight.prioridad)}`} />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className={`font-semibold ${getTextColor(insight.tipo, insight.prioridad)}`}>
                        {insight.titulo}
                      </h4>
                      <Badge variant="outline" className={`text-xs ${getBadgeColor(insight.prioridad)}`}>
                        {insight.prioridad === 'alta' ? 'Alta' : 
                         insight.prioridad === 'media' ? 'Media' : 'Baja'} prioridad
                      </Badge>
                    </div>
                    
                    <p className={`text-sm ${getTextColor(insight.tipo, insight.prioridad)} opacity-90`}>
                      {insight.descripcion}
                    </p>
                    
                    {insight.valor && (
                      <div className="flex items-center gap-2">
                        <Badge className="bg-white/70 text-current border-current text-xs">
                          {insight.valor}
                        </Badge>
                      </div>
                    )}
                    
                    {insight.accion && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        className={`mt-2 ${getTextColor(insight.tipo, insight.prioridad)} border-current hover:bg-white/50`}
                      >
                        {insight.accion}
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Tip adicional */}
        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Lightbulb className="h-4 w-4 text-indigo-600" />
            </div>
            <div>
              <h5 className="font-semibold text-indigo-800">💡 ¿Sabías que...?</h5>
              <p className="text-sm text-indigo-700">
                Los usuarios que siguen nuestras recomendaciones ahorran un 40% más de tiempo 
                y reducen errores en un 60%.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
