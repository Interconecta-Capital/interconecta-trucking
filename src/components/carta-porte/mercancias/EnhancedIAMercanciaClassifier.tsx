
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Brain, Search, CheckCircle, AlertTriangle, Lightbulb, ShieldAlert, Truck } from 'lucide-react';
import { mercanciaClassifier, ClasificacionMercanciaResult } from '@/services/ai/MercanciaClassifierService';
import { useAIContext } from '@/hooks/ai/useAIContext';
import { toast } from 'sonner';

interface EnhancedIAMercanciaClassifierProps {
  descripcionInicial?: string;
  onClassificationResult: (result: {
    bienes_transp: string;
    descripcion: string;
    clave_unidad: string;
    material_peligroso?: boolean;
    cve_material_peligroso?: string;
    fraccion_arancelaria?: string;
    tipo_embalaje?: string;
    requiere_semarnat?: boolean;
    regulaciones_especiales?: string[];
  }) => void;
  className?: string;
}

export function EnhancedIAMercanciaClassifier({ 
  descripcionInicial = '', 
  onClassificationResult, 
  className 
}: EnhancedIAMercanciaClassifierProps) {
  const [descripcion, setDescripcion] = useState(descripcionInicial);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classification, setClassification] = useState<ClasificacionMercanciaResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { context } = useAIContext();

  useEffect(() => {
    if (descripcionInicial) {
      setDescripcion(descripcionInicial);
    }
  }, [descripcionInicial]);

  const handleClassify = async () => {
    if (!descripcion.trim()) {
      setError('Ingresa una descripción de la mercancía');
      return;
    }

    setIsClassifying(true);
    setError(null);
    setClassification(null);

    try {
      const result = await mercanciaClassifier.clasificarMercancia(descripcion, context);
      setClassification(result);
      
      if (result.confidence > 85) {
        toast.success('Clasificación exitosa con alta confianza');
      } else if (result.confidence > 70) {
        toast.success('Clasificación completada - revisar sugerencias');
      } else {
        toast.warning('Clasificación con baja confianza - verificar manualmente');
      }
    } catch (err) {
      setError('Error al clasificar la mercancía. Intenta nuevamente.');
      toast.error('Error en la clasificación');
    } finally {
      setIsClassifying(false);
    }
  };

  const handleAcceptClassification = () => {
    if (classification) {
      onClassificationResult({
        bienes_transp: classification.bienes_transp,
        descripcion: classification.descripcion,
        clave_unidad: classification.clave_unidad,
        material_peligroso: classification.material_peligroso,
        cve_material_peligroso: classification.cve_material_peligroso,
        fraccion_arancelaria: classification.fraccion_arancelaria,
        tipo_embalaje: classification.tipo_embalaje,
        requiere_semarnat: classification.requiere_semarnat,
        regulaciones_especiales: classification.regulaciones_especiales,
      });
      toast.success('Clasificación aplicada exitosamente');
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 90) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (confidence >= 70) return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    return <AlertTriangle className="h-4 w-4 text-red-600" />;
  };

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case 'combustible': return '⛽';
      case 'quimico': return '🧪';
      case 'alimenticio': return '🍎';
      case 'farmaceutico': return '💊';
      case 'construccion': return '🏗️';
      case 'electronico': return '📱';
      default: return '📦';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Clasificador IA Avanzado - SAT v3.1
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Input de descripción mejorado */}
        <div className="space-y-2">
          <Label htmlFor="descripcion">Describe la mercancía con el mayor detalle posible</Label>
          <div className="flex gap-2">
            <Input
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Gasolina premium 87 octanos, Productos farmacéuticos refrigerados, Acero estructural..."
              className="flex-1"
            />
            <Button 
              onClick={handleClassify} 
              disabled={isClassifying}
              className="px-6"
            >
              {isClassifying ? (
                <>
                  <Search className="h-4 w-4 mr-2 animate-spin" />
                  Analizando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Clasificar IA
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Resultado de clasificación mejorado */}
        {classification && (
          <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {getCategoriaIcon(classification.categoria_transporte)}
                Resultado de Clasificación IA
              </h3>
              <div className="flex items-center gap-2">
                {getConfidenceIcon(classification.confidence)}
                <span className={`font-medium ${getConfidenceColor(classification.confidence)}`}>
                  {classification.confidence}% confianza
                </span>
              </div>
            </div>

            {/* Información clasificada */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Clave SAT (Bienes Transportados)</Label>
                <div className="font-mono text-sm bg-white p-2 rounded border">
                  {classification.bienes_transp}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Unidad de Medida</Label>
                <div className="font-mono text-sm bg-white p-2 rounded border">
                  {classification.clave_unidad}
                </div>
              </div>

              {classification.fraccion_arancelaria && (
                <div className="space-y-2">
                  <Label>Fracción Arancelaria</Label>
                  <div className="font-mono text-sm bg-white p-2 rounded border">
                    {classification.fraccion_arancelaria}
                  </div>
                </div>
              )}

              {classification.tipo_embalaje && (
                <div className="space-y-2">
                  <Label>Tipo de Embalaje Recomendado</Label>
                  <div className="font-mono text-sm bg-white p-2 rounded border">
                    {classification.tipo_embalaje}
                  </div>
                </div>
              )}
            </div>

            {/* Alertas especiales */}
            {classification.material_peligroso && (
              <Alert className="border-red-200 bg-red-50">
                <ShieldAlert className="h-4 w-4 text-red-600" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-medium text-red-800">
                      ⚠️ MATERIAL PELIGROSO DETECTADO
                    </div>
                    {classification.cve_material_peligroso && (
                      <div className="text-sm">
                        <strong>Clave UN:</strong> {classification.cve_material_peligroso}
                      </div>
                    )}
                    <div className="text-sm text-red-700">
                      Se requiere vehículo especializado y conductor certificado
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {classification.requiere_semarnat && (
              <Alert className="border-orange-200 bg-orange-50">
                <Truck className="h-4 w-4 text-orange-600" />
                <AlertDescription>
                  <div className="font-medium text-orange-800">
                    📋 REQUIERE AUTORIZACIÓN SEMARNAT
                  </div>
                  <div className="text-sm text-orange-700 mt-1">
                    Material regulado que necesita permisos especiales para transporte
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Regulaciones especiales */}
            {classification.regulaciones_especiales && classification.regulaciones_especiales.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  <Label>Regulaciones y Requisitos Especiales</Label>
                </div>
                <div className="space-y-1">
                  {classification.regulaciones_especiales.map((regulacion, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-blue-700 bg-blue-50 p-2 rounded">
                      <span>•</span>
                      <span>{regulacion}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sugerencias */}
            {classification.sugerencias.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-green-600" />
                  <Label>Sugerencias del Sistema IA</Label>
                </div>
                <div className="space-y-1">
                  {classification.sugerencias.map((sugerencia, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                      <span>•</span>
                      <span>{sugerencia}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botón de aceptar */}
            <div className="flex justify-end">
              <Button onClick={handleAcceptClassification} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                Aplicar Clasificación IA
              </Button>
            </div>
          </div>
        )}

        {/* Información del clasificador */}
        <Alert className="border-blue-200 bg-blue-50">
          <Brain className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>IA Clasificador v2.0:</strong> Sistema avanzado que analiza tu descripción 
            y determina automáticamente claves SAT, detecta material peligroso, identifica 
            regulaciones SEMARNAT y sugiere el tipo de transporte óptimo según normativa vigente.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
