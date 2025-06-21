
import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Package, AlertTriangle, CheckCircle, Wand2 } from 'lucide-react';
import { useAIContext } from '@/hooks/ai/useAIContext';
import { geminiCore } from '@/services/ai/GeminiCoreService';
import { toast } from 'sonner';

interface SmartMercanciaInputProps {
  value: string;
  onChange: (value: string) => void;
  onMercanciaSelect?: (mercancia: any) => void;
  onMultipleMercanciaDetected?: (mercancias: any[]) => void;
  placeholder?: string;
  showValidation?: boolean;
  showClaveProducto?: boolean;
}

interface DetectedProduct {
  descripcion: string;
  claveProdServ?: string;
  claveUnidad?: string;
  tipoEmbalaje?: string;
  materialPeligroso?: boolean;
  confidence: number;
}

export function SmartMercanciaInput({
  value,
  onChange,
  onMercanciaSelect,
  onMultipleMercanciaDetected,
  placeholder = 'Describe la mercancía...',
  showValidation = false,
  showClaveProducto = false
}: SmartMercanciaInputProps) {
  const { context } = useAIContext();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedProducts, setDetectedProducts] = useState<DetectedProduct[]>([]);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Detectar múltiples productos automáticamente
  useEffect(() => {
    if (value.length > 10) {
      const delayedAnalysis = setTimeout(() => {
        analyzeDescription(value);
      }, 1000);

      return () => clearTimeout(delayedAnalysis);
    } else {
      setDetectedProducts([]);
      setAnalysisComplete(false);
    }
  }, [value]);

  const analyzeDescription = async (description: string) => {
    if (isAnalyzing || !description.trim()) return;

    try {
      setIsAnalyzing(true);
      
      // Detectar si hay múltiples productos por comas, "y", "más", etc.
      const separators = /[,;]\s*|\s+y\s+|\s+más\s+|\s+con\s+|\s+\+\s*/gi;
      const potentialProducts = description.split(separators).filter(p => p.trim().length > 2);

      if (potentialProducts.length > 1) {
        console.log('🔍 Múltiples productos detectados:', potentialProducts);
        
        const detectedProductsArray: DetectedProduct[] = [];

        for (const product of potentialProducts) {
          try {
            const result = await geminiCore.analyzeMercancia(product.trim(), context);
            
            detectedProductsArray.push({
              descripcion: product.trim(),
              claveProdServ: result.claveProdServ,
              claveUnidad: result.claveUnidad,
              tipoEmbalaje: result.tipoEmbalaje,
              materialPeligroso: result.materialPeligroso,
              confidence: result.confidence || 0.8
            });
          } catch (error) {
            console.warn('Error analizando producto:', product, error);
            detectedProductsArray.push({
              descripcion: product.trim(),
              confidence: 0.5
            });
          }
        }

        setDetectedProducts(detectedProductsArray);
        setShowSuggestions(true);
        
        if (onMultipleMercanciaDetected) {
          onMultipleMercanciaDetected(detectedProductsArray);
        }
      } else {
        // Producto único - análisis normal
        const result = await geminiCore.analyzeMercancia(description, context);
        
        setDetectedProducts([{
          descripcion: description,
          claveProdServ: result.claveProdServ,
          claveUnidad: result.claveUnidad,
          tipoEmbalaje: result.tipoEmbalaje,
          materialPeligroso: result.materialPeligroso,
          confidence: result.confidence || 0.8
        }]);

        if (onMercanciaSelect && result.claveProdServ) {
          onMercanciaSelect(result);
        }
      }

      setAnalysisComplete(true);
    } catch (error) {
      console.error('Error analizando mercancía:', error);
      toast.error('Error al analizar la descripción');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualAnalysis = () => {
    if (value.trim()) {
      analyzeDescription(value);
    }
  };

  const handleAcceptSuggestion = (product: DetectedProduct) => {
    if (onMercanciaSelect) {
      onMercanciaSelect({
        claveProdServ: product.claveProdServ,
        claveUnidad: product.claveUnidad,
        tipoEmbalaje: product.tipoEmbalaje,
        materialPeligroso: product.materialPeligroso
      });
    }
  };

  const handleAcceptAllProducts = () => {
    if (onMultipleMercanciaDetected) {
      onMultipleMercanciaDetected(detectedProducts);
      toast.success(`${detectedProducts.length} productos detectados y configurados`);
    }
    setShowSuggestions(false);
  };

  const getValidationStatus = () => {
    if (!showValidation || !analysisComplete) return null;

    const hasMultipleProducts = detectedProducts.length > 1;
    const allProductsHaveClaves = detectedProducts.every(p => p.claveProdServ);

    if (hasMultipleProducts && allProductsHaveClaves) {
      return { status: 'success', message: `${detectedProducts.length} productos detectados correctamente` };
    } else if (hasMultipleProducts && !allProductsHaveClaves) {
      return { status: 'warning', message: 'Algunos productos necesitan claves SAT' };
    } else if (detectedProducts.length === 1 && detectedProducts[0].claveProdServ) {
      return { status: 'success', message: 'Producto validado correctamente' };
    } else {
      return { status: 'error', message: 'Descripción necesita más detalles' };
    }
  };

  const validationStatus = getValidationStatus();

  return (
    <div className="space-y-3">
      <div className="relative">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[100px] pr-12"
          disabled={isAnalyzing}
        />
        
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          {isAnalyzing && (
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          )}
          
          {!isAnalyzing && value.length > 5 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleManualAnalysis}
              className="h-6 w-6 p-0"
            >
              <Wand2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Indicador de múltiples productos */}
      {value.includes(',') || value.includes(' y ') && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <Package className="h-4 w-4" />
          <span>💡 Tip: Detectamos múltiples productos. El sistema los separará automáticamente.</span>
        </div>
      )}

      {/* Estado de validación */}
      {validationStatus && (
        <div className={`flex items-center gap-2 text-sm ${
          validationStatus.status === 'success' ? 'text-green-600' :
          validationStatus.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
        }`}>
          {validationStatus.status === 'success' && <CheckCircle className="h-4 w-4" />}
          {validationStatus.status === 'warning' && <AlertTriangle className="h-4 w-4" />}
          {validationStatus.status === 'error' && <AlertTriangle className="h-4 w-4" />}
          <span>{validationStatus.message}</span>
        </div>
      )}

      {/* Sugerencias de productos múltiples */}
      {showSuggestions && detectedProducts.length > 1 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-blue-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  {detectedProducts.length} Productos Detectados
                </h4>
                <Button size="sm" onClick={handleAcceptAllProducts}>
                  Crear Todos
                </Button>
              </div>
              
              <div className="space-y-2">
                {detectedProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between bg-white rounded p-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{product.descripcion}</p>
                      {product.claveProdServ && (
                        <p className="text-xs text-gray-600">
                          Clave SAT: {product.claveProdServ}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={product.confidence > 0.7 ? 'default' : 'secondary'}>
                        {Math.round(product.confidence * 100)}%
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAcceptSuggestion(product)}
                      >
                        Usar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mostrar clave de producto detectada para producto único */}
      {showClaveProducto && detectedProducts.length === 1 && detectedProducts[0].claveProdServ && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span>Clave SAT detectada: {detectedProducts[0].claveProdServ}</span>
        </div>
      )}
    </div>
  );
}
