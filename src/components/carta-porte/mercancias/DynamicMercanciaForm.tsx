
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle } from 'lucide-react';
import { MercanciaCompleta } from '@/types/cartaPorte';
import { EnhancedAutocompleteInput } from '@/components/ai/EnhancedAutocompleteInput';
import { IntelligentFormController } from './IntelligentFormController';
import { useAIContext } from '@/hooks/ai/useAIContext';

interface DynamicMercanciaFormProps {
  mercancia: MercanciaCompleta;
  onChange: (mercancia: MercanciaCompleta) => void;
  className?: string;
}

export function DynamicMercanciaForm({ 
  mercancia, 
  onChange, 
  className 
}: DynamicMercanciaFormProps) {
  const { context } = useAIContext();

  const handleFieldChange = (field: keyof MercanciaCompleta, value: any) => {
    onChange({
      ...mercancia,
      [field]: value
    });
  };

  return (
    <div className={className}>
      <IntelligentFormController
        mercancia={mercancia}
        onChange={onChange}
      >
        {/* Campos básicos obligatorios */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Información Básica de la Mercancía
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <EnhancedAutocompleteInput
              value={mercancia.descripcion || ''}
              onChange={(value) => handleFieldChange('descripcion', value)}
              type="mercancia"
              label="Descripción Detallada *"
              placeholder="Describe la mercancía con el mayor detalle posible..."
              context={context}
              formName="mercancia"
              fieldName="descripcion"
              showValidation={true}
              showHelp={true}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <EnhancedAutocompleteInput
                value={mercancia.bienes_transp || ''}
                onChange={(value) => handleFieldChange('bienes_transp', value)}
                type="mercancia"
                label="Clave SAT Bienes Transportados *"
                placeholder="00000000"
                context={context}
                formName="mercancia"
                fieldName="bienes_transp"
                showValidation={true}
              />

              <EnhancedAutocompleteInput
                value={mercancia.clave_unidad || ''}
                onChange={(value) => handleFieldChange('clave_unidad', value)}
                type="mercancia"
                label="Unidad de Medida SAT *"
                placeholder="H87, KGM, PZA..."
                context={context}
                formName="mercancia"
                fieldName="clave_unidad"
                showValidation={true}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Cantidad *</Label>
                <Input
                  type="number"
                  value={mercancia.cantidad || ''}
                  onChange={(e) => handleFieldChange('cantidad', parseFloat(e.target.value) || 0)}
                  min="0.001"
                  step="0.001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Peso Total (kg) *</Label>
                <Input
                  type="number"
                  value={mercancia.peso_kg || ''}
                  onChange={(e) => handleFieldChange('peso_kg', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.001"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Valor ($)</Label>
                <Input
                  type="number"
                  value={mercancia.valor_mercancia || ''}
                  onChange={(e) => handleFieldChange('valor_mercancia', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fracción Arancelaria</Label>
              <Input
                value={mercancia.fraccion_arancelaria || ''}
                onChange={(e) => handleFieldChange('fraccion_arancelaria', e.target.value)}
                placeholder="00000000"
              />
            </div>
          </CardContent>
        </Card>

        {/* Material Peligroso - Básico */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Material Peligroso
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={mercancia.material_peligroso || false}
                onCheckedChange={(checked) => handleFieldChange('material_peligroso', checked)}
              />
              <Label>¿Es material peligroso?</Label>
            </div>

            {mercancia.material_peligroso && (
              <div className="space-y-2">
                <Label>Clave Material Peligroso (UN) *</Label>
                <Input
                  value={mercancia.cve_material_peligroso || ''}
                  onChange={(e) => handleFieldChange('cve_material_peligroso', e.target.value)}
                  placeholder="1203, 8000, etc."
                  required
                />
              </div>
            )}
          </CardContent>
        </Card>
      </IntelligentFormController>
    </div>
  );
}
