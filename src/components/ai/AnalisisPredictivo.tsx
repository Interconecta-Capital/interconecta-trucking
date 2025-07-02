
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Brain, TrendingUp, TrendingDown, Minus, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { useIAPredictiva } from '@/hooks/useIAPredictiva';
import { AnalisisIA } from '@/types/iaPredictiva';

export const AnalisisPredictivo: React.FC = () => {
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [analisis, setAnalisis] = useState<AnalisisIA | null>(null);
  const { analizarRuta, loading, error } = useIAPredictiva();

  const handleAnalizar = async () => {
    if (!origen.trim() || !destino.trim()) return;
    
    const resultado = await analizarRuta(origen, destino);
    setAnalisis(resultado);
  };

  const getTendenciaIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'subida': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'bajada': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getConfianzaColor = (confianza: number) => {
    if (confianza >= 80) return 'bg-green-500';
    if (confianza >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getProbabilidadColor = (probabilidad: number) => {
    if (probabilidad >= 70) return 'text-green-600';
    if (probabilidad >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Análisis Predictivo IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Ciudad de origen"
              value={origen}
              onChange={(e) => setOrigen(e.target.value)}
            />
            <Input
              placeholder="Ciudad de destino"
              value={destino}
              onChange={(e) => setDestino(e.target.value)}
            />
            <Button onClick={handleAnalizar} disabled={loading || !origen || !destino}>
              {loading ? 'Analizando...' : 'Analizar Ruta'}
            </Button>
          </div>
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultados del Análisis */}
      {analisis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Precisión Histórica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Precisión Histórica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Exactitud Costo</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {analisis.precision.exactitudCosto.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Exactitud Tiempo</p>
                  <p className="text-2xl font-bold text-green-600">
                    {analisis.precision.exactitudTiempo.toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Nivel de Confianza</span>
                  <Badge className={`${getConfianzaColor(analisis.precision.confianza)} text-white`}>
                    {analisis.precision.confianza}%
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Viajes Analizados</span>
                  <span className="font-medium">{analisis.precision.totalViajes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Factor Corrección</span>
                  <span className="font-medium">
                    {analisis.precision.factorCorreccionCosto.toFixed(2)}x
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Análisis de Mercado */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Análisis de Mercado</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Precio Promedio</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ${analisis.mercado.precioPromedio.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Margen Promedio</p>
                  <p className="text-2xl font-bold text-green-600">
                    {analisis.mercado.margenPromedio.toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tendencia</span>
                  <div className="flex items-center gap-1">
                    {getTendenciaIcon(analisis.mercado.tendencia)}
                    <span className="font-medium capitalize">{analisis.mercado.tendencia}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Rango Competitivo</span>
                  <span className="font-medium">
                    ${analisis.mercado.rangoCompetitivo[0].toLocaleString()} - 
                    ${analisis.mercado.rangoCompetitivo[1].toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cotizaciones</span>
                  <span className="font-medium">{analisis.mercado.totalCotizaciones}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sugerencias IA */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-600" />
                Sugerencias Inteligentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-purple-800">Precio Óptimo</h4>
                      <Badge variant="outline" className="text-purple-700 border-purple-300">
                        ${analisis.sugerencias.precioOptimo.toLocaleString()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className={`font-medium ${getProbabilidadColor(analisis.sugerencias.probabilidadAceptacion)}`}>
                        {analisis.sugerencias.probabilidadAceptacion}% probabilidad de aceptación
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{analisis.sugerencias.justificacion}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-800">Recomendaciones</h4>
                  <div className="space-y-2">
                    {analisis.sugerencias.recomendaciones.map((recomendacion, index) => (
                      <div key={index} className="flex items-start gap-2 p-2 bg-blue-50 rounded-md">
                        <div className="text-xs text-blue-600 mt-0.5">•</div>
                        <span className="text-sm text-blue-800">{recomendacion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
