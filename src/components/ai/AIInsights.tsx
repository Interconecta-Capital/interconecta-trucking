import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { geminiCore } from '@/services/ai/GeminiCoreService';
import { useCartasPorte } from '@/hooks/useCartasPorte';
import { useVehiculos } from '@/hooks/useVehiculos';
import { useConductores } from '@/hooks/useConductores';
import { useSocios } from '@/hooks/useSocios';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb,
  RefreshCw,
  Zap
} from 'lucide-react';

interface AIInsight {
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  action: string;
  metric: string;
  category: 'efficiency' | 'safety' | 'cost' | 'performance';
}

export function AIInsights() {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { cartasPorte } = useCartasPorte();
  const { vehiculos } = useVehiculos();
  const { conductores } = useConductores();
  const { socios } = useSocios();

  const generateInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      // Preparar datos del dashboard - usar estados seguros
      const dashboardData = {
        cartasPorte: {
          total: cartasPorte?.length || 0,
          completadas: cartasPorte?.filter(c => c.status === 'timbrada')?.length || 0,
          pendientes: cartasPorte?.filter(c => c.status === 'borrador')?.length || 0,
          thisMonth: cartasPorte?.filter(c => {
            const created = new Date(c.created_at);
            const now = new Date();
            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
          })?.length || 0
        },
        vehiculos: {
          total: vehiculos?.length || 0,
          disponibles: vehiculos?.filter(v => v.estado === 'disponible')?.length || 0,
          enUso: vehiculos?.filter(v => v.estado === 'en_uso')?.length || 0,
          mantenimiento: vehiculos?.filter(v => v.estado === 'mantenimiento')?.length || 0
        },
        conductores: {
          total: conductores?.length || 0,
          disponibles: conductores?.filter(c => c.estado === 'disponible')?.length || 0,
          enViaje: conductores?.filter(c => c.estado === 'en_viaje')?.length || 0
        },
        socios: {
          total: socios?.length || 0,
          activos: socios?.filter(s => s.estado === 'activo')?.length || 0
        }
      };

      // Usar GeminiCore para generar insights
      const result = await geminiCore.getBusinessInsights(
        dashboardData,
        'monthly',
        {
          businessContext: {
            industry: 'transportation',
            region: 'mexico'
          }
        }
      );

      // Convertir insights a formato esperado
      const formattedInsights: AIInsight[] = result.insights.slice(0, 5).map((insight, index) => ({
        title: insight.split(':')[0] || `Insight ${index + 1}`,
        description: insight.split(':')[1]?.trim() || insight,
        impact: index === 0 ? 'high' : index === 1 ? 'medium' : 'low',
        action: result.recommendations[index] || 'Revisar métricas',
        metric: Object.keys(dashboardData)[index % 4] || 'general',
        category: ['efficiency', 'performance', 'cost', 'safety'][index % 4] as any
      }));

      setInsights(formattedInsights);
    } catch (error) {
      console.error('Error generando insights:', error);
      setError('Error al generar insights');
      
      // Fallback insights basados en datos reales
      const fallbackInsights: AIInsight[] = [
        {
          title: 'Eficiencia de Flota',
          description: `Tienes ${vehiculos?.filter(v => v.estado === 'disponible')?.length || 0} vehículos disponibles de ${vehiculos?.length || 0} total`,
          impact: (vehiculos?.filter(v => v.estado === 'disponible')?.length || 0) / (vehiculos?.length || 1) > 0.8 ? 'low' : 'high',
          action: 'Optimizar asignación de vehículos',
          metric: 'vehiculos',
          category: 'efficiency'
        },
        {
          title: 'Productividad Conductores',
          description: `${conductores?.filter(c => c.estado === 'en_viaje')?.length || 0} conductores actualmente en viaje`,
          impact: 'medium',
          action: 'Revisar carga de trabajo',
          metric: 'conductores',
          category: 'performance'
        }
      ];
      
      setInsights(fallbackInsights);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cartasPorte?.length > 0 || vehiculos?.length > 0) {
      generateInsights();
    } else {
      setLoading(false);
    }
  }, [cartasPorte?.length, vehiculos?.length, conductores?.length, socios?.length]);

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'efficiency': return <Zap className="h-4 w-4" />;
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      case 'cost': return <TrendingDown className="h-4 w-4" />;
      case 'safety': return <AlertTriangle className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>Insights Inteligentes</span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={generateInsights}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            <span>Generando insights...</span>
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">
            {error}
          </div>
        )}

        {!loading && insights.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay suficientes datos para generar insights</p>
            <p className="text-xs mt-1">Agrega más cartas porte o vehículos</p>
          </div>
        )}

        {insights.map((insight, index) => (
          <div key={index} className={`border rounded-lg p-3 ${getImpactColor(insight.impact)}`}>
            <div className="flex items-start gap-3">
              <div className="flex items-center gap-1 mt-0.5">
                {getCategoryIcon(insight.category)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm truncate">{insight.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {insight.impact.toUpperCase()}
                  </Badge>
                </div>
                
                <p className="text-xs opacity-90 mb-2">{insight.description}</p>
                
                <div className="flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" />
                  <p className="text-xs font-medium">{insight.action}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {insights.length > 0 && (
          <div className="text-center pt-2">
            <p className="text-xs text-gray-500">
              ✨ Insights generados con IA • Actualizado hace {new Date().toLocaleTimeString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
