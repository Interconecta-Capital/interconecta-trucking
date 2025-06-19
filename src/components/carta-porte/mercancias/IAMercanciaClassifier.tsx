
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Brain, Search, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { MercanciaCompleta } from '@/types/cartaPorte';

interface IAMercanciaClassifierProps {
  descripcionInicial?: string;
  onClassificationResult: (result: {
    bienes_transp: string;
    descripcion: string;
    clave_unidad: string;
    material_peligroso?: boolean;
    cve_material_peligroso?: string;
    fraccion_arancelaria?: string;
    tipo_embalaje?: string;
  }) => void;
  className?: string;
}

interface ClasificacionResult {
  bienes_transp: string;
  descripcion: string;
  clave_unidad: string;
  material_peligroso: boolean;
  cve_material_peligroso?: string;
  fraccion_arancelaria?: string;
  tipo_embalaje?: string;
  confidence: number;
  sugerencias: string[];
}

export function IAMercanciaClassifier({ 
  descripcionInicial = '', 
  onClassificationResult, 
  className 
}: IAMercanciaClassifierProps) {
  const [descripcion, setDescripcion] = useState(descripcionInicial);
  const [isClassifying, setIsClassifying] = useState(false);
  const [classification, setClassification] = useState<ClasificacionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Simulador de clasificación IA (en producción sería un servicio real)
  const classifyMercancia = async (desc: string): Promise<ClasificacionResult> => {
    // Simular llamada a API de IA
    await new Promise(resolve => setTimeout(resolve, 1500));

    const descLower = desc.toLowerCase();
    
    // Base de conocimiento simplificada
    if (descLower.includes('gasolina') || descLower.includes('combustible')) {
      return {
        bienes_transp: '15111503',
        descripcion: 'Gasolina para automóviles',
        clave_unidad: 'LTR',
        material_peligroso: true,
        cve_material_peligroso: '1203',
        fraccion_arancelaria: '27101211',
        tipo_embalaje: 'Tanque',
        confidence: 95,
        sugerencias: [
          'Requiere permisos SEMARNAT',
          'Transporte especializado obligatorio',
          'Documentación adicional necesaria'
        ]
      };
    }

    if (descLower.includes('acero') || descLower.includes('metal')) {
      return {
        bienes_transp: '30102100',
        descripcion: 'Productos de acero',
        clave_unidad: 'KGM',
        material_peligroso: false,
        fraccion_arancelaria: '72082500',
        tipo_embalaje: 'Palet',
        confidence: 88,
        sugerencias: [
          'Verificar peso máximo del vehículo',
          'Considerar distribución de carga'
        ]
      };
    }

    if (descLower.includes('alimento') || descLower.includes('comida')) {
      return {
        bienes_transp: '50000000',
        descripcion: 'Productos alimenticios',
        clave_unidad: 'KGM',
        material_peligroso: false,
        fraccion_arancelaria: '21069099',
        tipo_embalaje: 'Caja',
        confidence: 82,
        sugerencias: [
          'Verificar cadena de frío si aplica',
          'Documentación sanitaria necesaria'
        ]
      };
    }

    // Clasificación genérica
    return {
      bienes_transp: '78101800',
      descripcion: desc,
      clave_unidad: 'PZA',
      material_peligroso: false,
      tipo_embalaje: 'Caja',
      confidence: 60,
      sugerencias: [
        'Clasificación genérica aplicada',
        'Revisar manualmente la clave SAT'
      ]
    };
  };

  const handleClassify = async () => {
    if (!descripcion.trim()) {
      setError('Ingresa una descripción de la mercancía');
      return;
    }

    setIsClassifying(true);
    setError(null);
    setClassification(null);

    try {
      const result = await classifyMercancia(descripcion);
      setClassification(result);
    } catch (err) {
      setError('Error al clasificar la mercancía. Intenta nuevamente.');
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
      });
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Clasificación Inteligente de Mercancías
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Input de descripción */}
        <div className="space-y-2">
          <Label htmlFor="descripcion">Describe la mercancía a transportar</Label>
          <div className="flex gap-2">
            <Input
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Gasolina premium, Productos de acero, Alimentos refrigerados..."
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
                  Clasificando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Clasificar
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

        {/* Resultado de clasificación */}
        {classification && (
          <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Resultado de Clasificación</h3>
              <div className="flex items-center gap-2">
                {getConfidenceIcon(classification.confidence)}
                <span className={`font-medium ${getConfidenceColor(classification.confidence)}`}>
                  {classification.confidence}% de confianza
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
                  <Label>Tipo de Embalaje</Label>
                  <div className="font-mono text-sm bg-white p-2 rounded border">
                    {classification.tipo_embalaje}
                  </div>
                </div>
              )}
            </div>

            {/* Material peligroso */}
            {classification.material_peligroso && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription>
                  <div className="space-y-2">
                    <div className="font-medium text-orange-800">
                      ⚠️ Material Peligroso Detectado
                    </div>
                    {classification.cve_material_peligroso && (
                      <div className="text-sm">
                        <strong>Clave Material Peligroso:</strong> {classification.cve_material_peligroso}
                      </div>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Sugerencias */}
            {classification.sugerencias.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                  <Label>Sugerencias y Recomendaciones</Label>
                </div>
                <div className="space-y-1">
                  {classification.sugerencias.map((sugerencia, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-blue-700">
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
                Usar esta Clasificación
              </Button>
            </div>
          </div>
        )}

        {/* Información sobre el clasificador */}
        <Alert className="border-blue-200 bg-blue-50">
          <Brain className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>IA Clasificador:</strong> Este sistema analiza tu descripción y sugiere 
            automáticamente las claves SAT, unidades de medida y detecta material peligroso 
            según el catálogo oficial.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
