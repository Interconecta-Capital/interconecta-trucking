
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Sparkles, CheckCircle, AlertTriangle, Plus, Edit } from 'lucide-react';
import { useSmartMercanciaAnalysis } from '@/hooks/useSmartMercanciaAnalysis';

interface SmartMercanciaAnalyzerProps {
  onMercanciasAnalyzed: (mercancias: any[]) => void;
  isVisible: boolean;
}

export function SmartMercanciaAnalyzer({ onMercanciasAnalyzed, isVisible }: SmartMercanciaAnalyzerProps) {
  const [descripcion, setDescripcion] = useState('');
  const { analyzeDescription, isAnalyzing, lastAnalysis } = useSmartMercanciaAnalysis();

  const handleAnalyze = async () => {
    if (!descripcion.trim()) return;
    
    const result = await analyzeDescription(descripcion);
    
    if (result.mercancias.length > 0) {
      onMercanciasAnalyzed(result.mercancias);
    }
  };

  const getConfianzaColor = (confianza: string) => {
    switch (confianza) {
      case 'alta': return 'bg-green-100 text-green-800 border-green-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baja': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isVisible) return null;

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Sparkles className="h-5 w-5" />
          Análisis Inteligente de Mercancías
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
            IA Mejorada
          </Badge>
        </CardTitle>
        <p className="text-sm text-blue-600">
          Describe tu carga y la IA extraerá automáticamente los datos estructurados para múltiples productos.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción de la carga
          </label>
          <Textarea
            placeholder="Ej: 30 toneladas de pepino fresco de exportación y 10 toneladas de sandía, valor comercial aproximado $500,000 pesos"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="min-h-20"
            disabled={isAnalyzing}
          />
        </div>

        <Button
          onClick={handleAnalyze}
          disabled={!descripcion.trim() || isAnalyzing}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analizando con IA...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Analizar y Autocompletar
            </>
          )}
        </Button>

        {/* Resultados del Análisis */}
        {lastAnalysis && (
          <div className="space-y-4 mt-6">
            {/* Errores */}
            {lastAnalysis.errores.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {lastAnalysis.errores.join(', ')}
                </AlertDescription>
              </Alert>
            )}

            {/* Sugerencias */}
            {lastAnalysis.sugerencias.length > 0 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  {lastAnalysis.sugerencias.join(', ')}
                </AlertDescription>
              </Alert>
            )}

            {/* Mercancías Detectadas */}
            {lastAnalysis.mercancias.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-800 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Mercancías Detectadas ({lastAnalysis.mercancias.length})
                </h4>
                
                {lastAnalysis.mercancias.map((mercancia, index) => (
                  <Card key={index} className="border-l-4 border-l-green-500 bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h5 className="font-medium text-gray-800">
                          {mercancia.descripcion}
                        </h5>
                        <Badge 
                          variant="outline" 
                          className={getConfianzaColor(mercancia.confianza)}
                        >
                          Confianza: {mercancia.confianza}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Clave SAT:</span>
                          <div className="font-medium">{mercancia.claveProdServ}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Unidad:</span>
                          <div className="font-medium">{mercancia.claveUnidad}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Peso:</span>
                          <div className="font-medium">{mercancia.pesoKg.toLocaleString()} kg</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Cantidad:</span>
                          <div className="font-medium">{mercancia.cantidad}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Valor:</span>
                          <div className="font-medium">${mercancia.valorMercancia.toLocaleString()}</div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="sm" className="h-7">
                            <Edit className="h-3 w-3 mr-1" />
                            Editar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Alert className="bg-blue-50 border-blue-200">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    ✅ {lastAnalysis.mercancias.length} mercancía(s) agregada(s) automáticamente. 
                    Puedes editarlas individualmente o agregar más productos.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        )}

        {/* Ejemplos útiles */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">💡 Ejemplos de descripciones efectivas:</p>
          <ul className="text-xs text-gray-500 space-y-1">
            <li>• "50 toneladas de maíz amarillo grado 2 y 20 toneladas de sorgo"</li>
            <li>• "500 piezas de televisores LED 55 pulgadas, peso total 2 toneladas"</li>
            <li>• "Materiales de construcción: 30 toneladas de cemento y 15 de varilla"</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
