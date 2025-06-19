import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnhancedAutocompleteInput } from '@/components/ai/EnhancedAutocompleteInput';
import { useAIContext } from '@/hooks/ai/useAIContext';
import { useMercancias, Mercancia } from '@/hooks/useMercancias';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, Save, X, Brain, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { geminiCore } from '@/services/ai/GeminiCoreService';

interface SmartMercanciaFormProps {
  index: number;
  mercancia?: Mercancia;
  onSave: (mercancia: Mercancia) => Promise<boolean>;
  onCancel: () => void;
  onRemove?: () => void;
  isLoading?: boolean;
}

interface AIContextData {
  // Empty interface for now to resolve type conflicts
}

export function SmartMercanciaForm({
  index,
  mercancia,
  onSave,
  onCancel,
  onRemove,
  isLoading = false
}: SmartMercanciaFormProps) {
  const { context, addUserPattern } = useAIContext();
  
  const [formData, setFormData] = useState<Mercancia>({
    descripcion: '',
    bienes_transp: '',
    clave_unidad: '',
    cantidad: 1,
    peso_kg: 0,
    valor_mercancia: 0,
    material_peligroso: false,
    cve_material_peligroso: '',
    moneda: 'MXN',
    fraccion_arancelaria: '',
    embalaje: '',
    uuid_comercio_ext: '',
    numero_autorizacion: '',
    folio_acreditacion: '',
    ...mercancia
  });

  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [semarnatRequired, setSemarnatRequired] = useState(false);
  const [descriptionLocked, setDescriptionLocked] = useState(false);
  const analyzeTimeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (analyzeTimeout.current) clearTimeout(analyzeTimeout.current);

    analyzeTimeout.current = setTimeout(async () => {
      if (!formData.descripcion) {
        setSemarnatRequired(false);
        setDescriptionLocked(false);
        return;
      }
      try {
        const result = await geminiCore.analyzeTextForRegulatedKeywords(
          formData.descripcion,
          context
        );
        setSemarnatRequired(result.hasRegulatedKeywords);
        if (!result.hasRegulatedKeywords) setDescriptionLocked(false);
      } catch (error) {
        console.error('Error analyzing text:', error);
      }
    }, 600);

    return () => {
      if (analyzeTimeout.current) clearTimeout(analyzeTimeout.current);
    };
  }, [formData.descripcion, context]);

  useEffect(() => {
    const generate = async () => {
      if (
        semarnatRequired &&
        formData.numero_autorizacion &&
        formData.folio_acreditacion &&
        !descriptionLocked
      ) {
        try {
          const legal = await geminiCore.generateLegalDescription(
            formData.descripcion,
            formData.numero_autorizacion,
            formData.folio_acreditacion,
            context
          );
          if (legal) {
            setFormData(prev => ({ ...prev, descripcion: legal }));
            setDescriptionLocked(true);
          }
        } catch (error) {
          console.error('Error generating legal description:', error);
        }
      }
    };
    generate();
  }, [semarnatRequired, formData.numero_autorizacion, formData.folio_acreditacion, context, descriptionLocked, formData.descripcion]);

  const handleFieldChange = (field: keyof Mercancia, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Learn from user patterns
    addUserPattern(field, String(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.descripcion || !formData.cantidad) {
      toast.error('Complete los campos obligatorios');
      return;
    }

    if (
      semarnatRequired &&
      (!formData.numero_autorizacion || !formData.folio_acreditacion)
    ) {
      toast.error('Ingrese los datos de autorización SEMARNAT');
      return;
    }

    const success = await onSave(formData);
    if (success) {
      // Learn patterns on successful save
      addUserPattern('mercancia_descripcion', formData.descripcion);
      addUserPattern('bienes_transporte', formData.bienes_transp);
      addUserPattern('unidad_medida', formData.clave_unidad);
    }
  };

  const getAiInsights = async () => {
    if (!formData.descripcion || formData.descripcion.length < 5) {
      toast.error('Ingrese una descripción más detallada');
      return;
    }

    try {
      // This would call the Gemini service to get insights
      const insights = [
        {
          type: 'suggestion',
          title: 'Clasificación SAT Sugerida',
          content: 'Basado en la descripción, se sugiere la clave 78101800',
          confidence: 0.85
        },
        {
          type: 'warning',
          title: 'Información Faltante',
          content: 'Considera agregar el material del empaque para mejor clasificación',
          confidence: 0.7
        }
      ];
      
      setAiSuggestions(insights);
      setShowAiPanel(true);
    } catch (error) {
      toast.error('Error obteniendo insights de IA');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <span>Mercancía #{index + 1}</span>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={getAiInsights}
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              Insights IA
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Enhanced Description Input */}
          <EnhancedAutocompleteInput
            value={formData.descripcion}
            onChange={(value) => handleFieldChange('descripcion', value)}
            type="mercancia"
            label="Descripción de la Mercancía *"
            placeholder="Describe detalladamente la mercancía..."
            disabled={descriptionLocked}
            context={{} as AIContextData}
            formName="mercancia"
            fieldName="descripcion"
            showValidation={true}
            showHelp={true}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EnhancedAutocompleteInput
              value={formData.bienes_transp}
              onChange={(value) => handleFieldChange('bienes_transp', value)}
              type="mercancia"
              label="Bienes a Transportar SAT"
              placeholder="00000000"
              context={{} as AIContextData}
              formName="mercancia"
              fieldName="bienes_transp"
              showValidation={true}
            />

            <EnhancedAutocompleteInput
              value={formData.clave_unidad}
              onChange={(value) => handleFieldChange('clave_unidad', value)}
              type="mercancia"
              label="Clave Unidad SAT"
              placeholder="H87"
              context={{} as AIContextData}
              formName="mercancia"
              fieldName="clave_unidad"
              showValidation={true}
            />

            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad *</Label>
              <Input
                id="cantidad"
                type="number"
                min="0.001"
                step="0.001"
                value={formData.cantidad}
                onChange={(e) => handleFieldChange('cantidad', parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input
                id="peso"
                type="number"
                min="0"
                step="0.001"
                value={formData.peso_kg}
                onChange={(e) => handleFieldChange('peso_kg', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor de la Mercancía ($)</Label>
              <Input
                id="valor"
                type="number"
                min="0"
                step="0.01"
                value={formData.valor_mercancia}
                onChange={(e) => handleFieldChange('valor_mercancia', parseFloat(e.target.value) || 0)}
              />
            </div>

            {semarnatRequired && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="numero_autorizacion">Número de Autorización SEMARNAT *</Label>
                  <Input
                    id="numero_autorizacion"
                    value={formData.numero_autorizacion || ''}
                    onChange={(e) => handleFieldChange('numero_autorizacion', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="folio_acreditacion">Folio de Acreditación *</Label>
                  <Input
                    id="folio_acreditacion"
                    value={formData.folio_acreditacion || ''}
                    onChange={(e) => handleFieldChange('folio_acreditacion', e.target.value)}
                    required
                  />
                </div>
              </>
            )}
          </div>

          <EnhancedAutocompleteInput
            value={formData.fraccion_arancelaria || ''}
            onChange={(value) => handleFieldChange('fraccion_arancelaria', value)}
            type="mercancia"
            label="Fracción Arancelaria"
            placeholder="00000000"
            context={{} as AIContextData}
            formName="mercancia"
            fieldName="fraccion_arancelaria"
            showValidation={true}
          />

          <div className="flex justify-between pt-4">
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              {onRemove && (
                <Button type="button" variant="destructive" onClick={onRemove}>
                  Eliminar
                </Button>
              )}
            </div>
            
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar Mercancía'}
            </Button>
          </div>
        </form>

        {/* AI Insights Panel */}
        {showAiPanel && aiSuggestions.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-blue-500" />
                Insights de IA
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAiPanel(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {aiSuggestions.map((insight, index) => (
              <Alert key={index} className={insight.type === 'warning' ? 'border-amber-200' : 'border-blue-200'}>
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <strong>{insight.title}</strong>
                      <p className="text-sm text-gray-600 mt-1">{insight.content}</p>
                    </div>
                    <Badge variant="outline">
                      {Math.round(insight.confidence * 100)}%
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
