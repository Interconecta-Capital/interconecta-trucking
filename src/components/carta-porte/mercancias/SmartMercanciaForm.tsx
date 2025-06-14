
import React, { useState } from 'react';
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

interface SmartMercanciaFormProps {
  index: number;
  mercancia?: Mercancia;
  onSave: (mercancia: Mercancia) => Promise<boolean>;
  onCancel: () => void;
  onRemove?: () => void;
  isLoading?: boolean;
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
    fraccionArancelaria: '',
    descripcion: '',
    claveProdServ: '',
    claveUnidad: '',
    cantidad: 1,
    unidad: '',
    pesoKg: 0,
    valorMercancia: 0,
    ...mercancia
  });

  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [showAiPanel, setShowAiPanel] = useState(false);

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

    const success = await onSave(formData);
    if (success) {
      // Learn patterns on successful save
      addUserPattern('mercancia_descripcion', formData.descripcion);
      addUserPattern('clave_producto', formData.claveProdServ);
      addUserPattern('unidad_medida', formData.claveUnidad);
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
          content: 'Basado en la descripción, se sugiere la clave 01010101',
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
            context={{
              ...context,
              category: 'mercancia_description'
            }}
            formName="mercancia"
            fieldName="descripcion"
            showValidation={true}
            showHelp={true}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EnhancedAutocompleteInput
              value={formData.claveProdServ}
              onChange={(value) => handleFieldChange('claveProdServ', value)}
              type="mercancia"
              label="Clave Producto/Servicio SAT"
              placeholder="00000000"
              context={{
                ...context,
                category: 'sat_product_code',
                description: formData.descripcion
              }}
              formName="mercancia"
              fieldName="claveProdServ"
              showValidation={true}
            />

            <EnhancedAutocompleteInput
              value={formData.claveUnidad}
              onChange={(value) => handleFieldChange('claveUnidad', value)}
              type="mercancia"
              label="Clave Unidad SAT"
              placeholder="H87"
              context={{
                ...context,
                category: 'sat_unit_code',
                productType: formData.claveProdServ
              }}
              formName="mercancia"
              fieldName="claveUnidad"
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

            <EnhancedAutocompleteInput
              value={formData.unidad}
              onChange={(value) => handleFieldChange('unidad', value)}
              type="mercancia"
              label="Unidad de Medida"
              placeholder="Kilogramo, Pieza, etc."
              context={{
                ...context,
                category: 'unit_measure',
                unitCode: formData.claveUnidad
              }}
              formName="mercancia"
              fieldName="unidad"
            />

            <div className="space-y-2">
              <Label htmlFor="peso">Peso (kg)</Label>
              <Input
                id="peso"
                type="number"
                min="0"
                step="0.001"
                value={formData.pesoKg}
                onChange={(e) => handleFieldChange('pesoKg', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor">Valor de la Mercancía ($)</Label>
              <Input
                id="valor"
                type="number"
                min="0"
                step="0.01"
                value={formData.valorMercancia}
                onChange={(e) => handleFieldChange('valorMercancia', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <EnhancedAutocompleteInput
            value={formData.fraccionArancelaria || ''}
            onChange={(value) => handleFieldChange('fraccionArancelaria', value)}
            type="mercancia"
            label="Fracción Arancelaria"
            placeholder="00000000"
            context={{
              ...context,
              category: 'tariff_fraction',
              description: formData.descripcion,
              productCode: formData.claveProdServ
            }}
            formName="mercancia"
            fieldName="fraccionArancelaria"
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
