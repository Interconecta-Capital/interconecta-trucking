import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Sparkles, Package, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useSmartMercanciaAnalysis } from '@/hooks/useSmartMercanciaAnalysis';
import { useMercanciasBatch } from '@/hooks/useMercanciasBatch';
import { Mercancia } from '@/types/mercancias';
import { toast } from 'sonner';

interface MercanciasBulkImportProps {
  onMercanciaAdd: (mercancia: Partial<Mercancia>) => Promise<boolean>;
  onClose: () => void;
}

export function MercanciasBulkImport({ onMercanciaAdd, onClose }: MercanciasBulkImportProps) {
  const [bulkText, setBulkText] = useState('');
  const [detectedMercancias, setDetectedMercancias] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  
  const { analyzeDescription, isAnalyzing } = useSmartMercanciaAnalysis();
  const { addMercanciasBatch, isProcessing } = useMercanciasBatch();

  const handleAnalyze = async () => {
    if (!bulkText.trim()) {
      toast.error('Por favor ingresa una descripción de mercancías');
      return;
    }

    console.log('🚀 Iniciando análisis masivo de mercancías...');
    
    try {
      const result = await analyzeDescription(bulkText);
      
      if (result.errores.length > 0) {
        console.warn('⚠️ Análisis con errores:', result.errores);
      }

      if (result.mercancias.length === 0) {
        toast.error('No se detectaron mercancías válidas en el texto');
        return;
      }

      console.log(`✅ Detectadas ${result.mercancias.length} mercancías:`, result.mercancias);
      setDetectedMercancias(result.mercancias);
      setShowResults(true);

      toast.success(`🎯 ${result.mercancias.length} producto${result.mercancias.length > 1 ? 's detectados' : ' detectado'}`);
    } catch (error) {
      console.error('❌ Error en análisis masivo:', error);
      toast.error('Error al analizar el texto');
    }
  };

  const handleAddAll = async () => {
    if (detectedMercancias.length === 0) return;

    console.log('📦 Agregando todas las mercancías detectadas...');
    
    // Convertir formato de análisis a formato de Mercancia
    const mercanciasToAdd: Partial<Mercancia>[] = detectedMercancias.map(m => ({
      descripcion: m.descripcion,
      bienes_transp: m.claveProdServ,
      clave_unidad: m.claveUnidad,
      cantidad: m.cantidad || 1,
      peso_kg: m.pesoKg || 1,
      valor_mercancia: m.valorMercancia || 1000,
      embalaje: m.metodoTransporte || '',
      material_peligroso: false,
      moneda: 'MXN'
    }));

    const result = await addMercanciasBatch(mercanciasToAdd, onMercanciaAdd);

    if (result.success) {
      console.log(`✅ Lote completado: ${result.added} agregadas, ${result.failed} fallidas`);
      
      // Limpiar y cerrar
      setBulkText('');
      setDetectedMercancias([]);
      setShowResults(false);
      onClose();
    } else {
      console.error('❌ Errores en el lote:', result.errors);
    }
  };

  const handleRemoveMercancia = (index: number) => {
    setDetectedMercancias(prev => prev.filter((_, i) => i !== index));
    toast.info('Mercancía removida de la lista');
  };

  const getConfidenceBadge = (confianza: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      alta: 'default',
      media: 'secondary',
      baja: 'destructive'
    };
    
    return (
      <Badge variant={variants[confianza] || 'secondary'}>
        Confianza: {confianza}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Carga Masiva Inteligente de Mercancías
        </CardTitle>
        <CardDescription>
          Pega o escribe una descripción con múltiples productos y la IA los detectará automáticamente
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Área de texto para ingreso masivo */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Descripción de Mercancías
          </label>
          <Textarea
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="Ejemplo:
30 toneladas de pepino fresco
10 toneladas de sandía
5 toneladas de melón

O también:
500 playeras de algodón, 300 pantalones de mezclilla y 200 gorras"
            rows={8}
            className="font-mono text-sm"
            disabled={isAnalyzing || isProcessing}
          />
          <p className="text-xs text-muted-foreground">
            💡 Puedes escribir múltiples productos separados por líneas, comas o la palabra "y"
          </p>
        </div>

        {/* Botón de análisis */}
        {!showResults && (
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !bulkText.trim()}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analizando con IA...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Analizar y Detectar Productos
              </>
            )}
          </Button>
        )}

        {/* Resultados del análisis */}
        {showResults && detectedMercancias.length > 0 && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Se detectaron <strong>{detectedMercancias.length}</strong> producto{detectedMercancias.length > 1 ? 's' : ''} en tu descripción
              </AlertDescription>
            </Alert>

            {/* Lista de mercancías detectadas */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {detectedMercancias.map((mercancia, index) => (
                <Card key={index} className="relative">
                  <CardContent className="pt-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => handleRemoveMercancia(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>

                    <div className="space-y-2">
                      <div className="flex items-start justify-between pr-8">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-primary" />
                          <h4 className="font-medium">{mercancia.descripcion}</h4>
                        </div>
                        {getConfidenceBadge(mercancia.confianza)}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Clave SAT:</span> {mercancia.claveProdServ}
                        </div>
                        <div>
                          <span className="font-medium">Unidad:</span> {mercancia.claveUnidad}
                        </div>
                        <div>
                          <span className="font-medium">Cantidad:</span> {mercancia.cantidad}
                        </div>
                        <div>
                          <span className="font-medium">Peso:</span> {mercancia.pesoKg.toLocaleString()} kg
                        </div>
                        <div className="col-span-2">
                          <span className="font-medium">Valor:</span> ${mercancia.valorMercancia.toLocaleString('es-MX')} MXN
                        </div>
                        {mercancia.metodoTransporte && (
                          <div className="col-span-2">
                            <span className="font-medium">Empaque:</span> {mercancia.metodoTransporte}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Botones de acción */}
            <div className="flex gap-2">
              <Button
                onClick={handleAddAll}
                disabled={isProcessing}
                className="flex-1"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Agregando {detectedMercancias.length} producto{detectedMercancias.length > 1 ? 's' : ''}...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Agregar Todos ({detectedMercancias.length})
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowResults(false);
                  setDetectedMercancias([]);
                }}
                disabled={isProcessing}
              >
                Volver a Analizar
              </Button>
            </div>
          </div>
        )}

        {/* Botón cerrar */}
        <Button
          variant="ghost"
          onClick={onClose}
          className="w-full"
          disabled={isAnalyzing || isProcessing}
        >
          Cerrar
        </Button>
      </CardContent>
    </Card>
  );
}
