import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, TrendingUp, Database, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface IAStats {
  totalRegistros: number;
  conCostosReales: number;
  precision: number;
  viajesCompletados: number;
  rutasUnicas: number;
}

export function IALearningPanel() {
  const [stats, setStats] = useState<IAStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: analisisData } = await supabase
          .from('analisis_viajes')
          .select('*');

        if (analisisData) {
          const totalRegistros = analisisData.length;
          const conCostosReales = analisisData.filter(d => d.costo_real !== null).length;
          const viajesCompletados = analisisData.filter(d => d.costo_real && d.tiempo_real).length;
          const rutasUnicas = new Set(analisisData.map(d => d.ruta_hash)).size;
          
          // Calcular precisión promedio (si hay datos reales)
          const registrosConPrecision = analisisData.filter(
            d => d.costo_real && d.costo_estimado
          );
          
          let precision = 0;
          if (registrosConPrecision.length > 0) {
            const precisionTotal = registrosConPrecision.reduce((acc, d) => {
              const diff = Math.abs((d.costo_real! - d.costo_estimado!) / d.costo_real!) * 100;
              return acc + (100 - diff);
            }, 0);
            precision = precisionTotal / registrosConPrecision.length;
          }

          setStats({
            totalRegistros,
            conCostosReales,
            precision: Math.max(0, precision),
            viajesCompletados,
            rutasUnicas
          });
        }
      } catch (error) {
        console.error('Error fetching IA stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Actualizar cada 30 segundos
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const coberturaDatos = stats.totalRegistros > 0 
    ? (stats.conCostosReales / stats.totalRegistros) * 100 
    : 0;

  const getEstadoAprendizaje = () => {
    if (stats.viajesCompletados === 0) return { label: 'Iniciando', color: 'bg-gray-400', textColor: 'text-gray-700' };
    if (stats.viajesCompletados < 5) return { label: 'Aprendiendo', color: 'bg-yellow-400', textColor: 'text-yellow-700' };
    if (stats.viajesCompletados < 20) return { label: 'En Desarrollo', color: 'bg-blue-400', textColor: 'text-blue-700' };
    return { label: 'Maduro', color: 'bg-green-400', textColor: 'text-green-700' };
  };

  const estadoIA = getEstadoAprendizaje();

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Brain className="h-5 w-5 text-purple-600" />
          Estado del Aprendizaje IA
          <Badge className={`ml-auto ${estadoIA.color} ${estadoIA.textColor}`}>
            {estadoIA.label}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
          <div className="bg-white/60 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-4 w-4 text-purple-600" />
              <p className="text-xs font-medium text-purple-700">Viajes Analizados</p>
            </div>
            <p className="text-2xl font-bold text-purple-900">{stats.totalRegistros}</p>
          </div>
          
          <div className="bg-white/60 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <p className="text-xs font-medium text-green-700">Con Datos Reales</p>
            </div>
            <p className="text-2xl font-bold text-green-900">{stats.conCostosReales}</p>
          </div>

          <div className="bg-white/60 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-medium text-blue-700">Precisión</p>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {stats.precision > 0 ? `${stats.precision.toFixed(1)}%` : 'N/A'}
            </p>
          </div>

          <div className="bg-white/60 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-indigo-600" />
              <p className="text-xs font-medium text-indigo-700">Completados</p>
            </div>
            <p className="text-2xl font-bold text-indigo-900">{stats.viajesCompletados}</p>
          </div>

          <div className="bg-white/60 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-4 w-4 text-orange-600" />
              <p className="text-xs font-medium text-orange-700">Rutas Únicas</p>
            </div>
            <p className="text-2xl font-bold text-orange-900">{stats.rutasUnicas}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="font-medium text-purple-800">Cobertura de Datos Reales</span>
            <span className="font-bold text-purple-900">{coberturaDatos.toFixed(0)}%</span>
          </div>
          <Progress value={coberturaDatos} className="h-2" />
          
          <p className="text-xs text-purple-700 mt-3">
            {stats.viajesCompletados === 0 && '🚀 Comienza a completar viajes para que la IA aprenda y mejore las predicciones.'}
            {stats.viajesCompletados > 0 && stats.viajesCompletados < 5 && '📊 La IA está aprendiendo. Completa más viajes para mejorar la precisión.'}
            {stats.viajesCompletados >= 5 && stats.viajesCompletados < 20 && '🎯 La IA está mejorando. Las predicciones serán más precisas con más datos.'}
            {stats.viajesCompletados >= 20 && '✨ La IA tiene suficientes datos para generar predicciones confiables.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
