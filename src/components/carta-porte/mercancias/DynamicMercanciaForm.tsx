
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, Sparkles } from 'lucide-react';
import { MercanciaCompleta } from '@/types/cartaPorte';
import { CatalogoSelectorMejorado } from '@/components/catalogos/CatalogoSelectorMejorado';
import { useSmartMercanciaForm } from '@/hooks/ai/useSmartMercanciaForm';

interface DynamicMercanciaFormProps {
  mercancia: MercanciaCompleta;
  onChange: (mercancia: MercanciaCompleta) => void;
  onSave: () => void;
  onCancel: () => void;
  isNew?: boolean;
}

export function DynamicMercanciaForm({
  mercancia,
  onChange,
  onSave,
  onCancel,
  isNew = false
}: DynamicMercanciaFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { isProcessing, suggestions, classifyMercancia, applySuggestion } = useSmartMercanciaForm();

  // Handle AI classification when description changes
  useEffect(() => {
    if (mercancia.descripcion && mercancia.descripcion.length > 10 && isNew) {
      const timeoutId = setTimeout(async () => {
        const aiSuggestion = await classifyMercancia(mercancia.descripcion);
        if (Object.keys(aiSuggestion).length > 0) {
          onChange({ ...mercancia, ...aiSuggestion });
        }
      }, 1500);

      return () => clearTimeout(timeoutId);
    }
  }, [mercancia.descripcion, isNew, classifyMercancia, onChange]);

  const handleFieldChange = <K extends keyof MercanciaCompleta>(
    field: K,
    value: MercanciaCompleta[K]
  ) => {
    onChange({
      ...mercancia,
      [field]: value
    });
  };

  const handleApplySuggestion = (suggestion: any) => {
    const updatedMercancia = applySuggestion(suggestion, mercancia);
    onChange(updatedMercancia);
  };

  const isValid = mercancia.descripcion && mercancia.bienes_transp && mercancia.clave_unidad && mercancia.cantidad > 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isNew ? 'Nueva Mercancía' : 'Editar Mercancía'}
            {isProcessing && (
              <Badge variant="outline" className="animate-pulse">
                <Sparkles className="h-3 w-3 mr-1" />
                IA analizando...
              </Badge>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                placeholder="Describe la mercancía a transportar..."
                value={mercancia.descripcion || ''}
                onChange={(e) => handleFieldChange('descripcion', e.target.value)}
                className="min-h-20"
              />
            </div>

            <div className="space-y-4">
              <CatalogoSelectorMejorado
                tipo="productos_servicios"
                label="Producto/Servicio *"
                value={mercancia.bienes_transp || ''}
                onValueChange={(value) => handleFieldChange('bienes_transp', value)}
                placeholder="Buscar clave de producto..."
                required
              />

              <CatalogoSelectorMejorado
                tipo="unidades"
                label="Unidad de Medida *"
                value={mercancia.clave_unidad || ''}
                onValueChange={(value) => handleFieldChange('clave_unidad', value)}
                placeholder="Buscar unidad..."
                required
              />
            </div>
          </div>

          {/* Cantidades y peso */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad *</Label>
              <Input
                id="cantidad"
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={mercancia.cantidad || ''}
                onChange={(e) => handleFieldChange('cantidad', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="peso_kg">Peso (kg) *</Label>
              <Input
                id="peso_kg"
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={mercancia.peso_kg || ''}
                onChange={(e) => handleFieldChange('peso_kg', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="valor_mercancia">Valor (MXN)</Label>
              <Input
                id="valor_mercancia"
                type="number"
                placeholder="0.00"
                min="0"
                step="0.01"
                value={mercancia.valor_mercancia || ''}
                onChange={(e) => handleFieldChange('valor_mercancia', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          {/* Material peligroso */}
          <div className="flex items-center space-x-2">
            <Switch
              id="material_peligroso"
              checked={mercancia.material_peligroso || false}
              onCheckedChange={(checked) => handleFieldChange('material_peligroso', checked)}
            />
            <Label htmlFor="material_peligroso" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Material Peligroso
            </Label>
          </div>

          {mercancia.material_peligroso && (
            <div className="space-y-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <CatalogoSelectorMejorado
                tipo="materiales_peligrosos"
                label="Clave Material Peligroso *"
                value={mercancia.cve_material_peligroso || ''}
                onValueChange={(value) => handleFieldChange('cve_material_peligroso', value)}
                placeholder="Buscar material peligroso..."
                required
              />
            </div>
          )}

          {/* Campos avanzados */}
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full"
            >
              {showAdvanced ? 'Ocultar' : 'Mostrar'} Campos Avanzados
            </Button>

            {showAdvanced && (
              <div className="space-y-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fraccion_arancelaria">Fracción Arancelaria</Label>
                    <Input
                      id="fraccion_arancelaria"
                      placeholder="12345678"
                      value={mercancia.fraccion_arancelaria || ''}
                      onChange={(e) => handleFieldChange('fraccion_arancelaria', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="moneda">Moneda</Label>
                    <Input
                      id="moneda"
                      placeholder="MXN"
                      value={mercancia.moneda || 'MXN'}
                      onChange={(e) => handleFieldChange('moneda', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numero_autorizacion">Número Autorización</Label>
                    <Input
                      id="numero_autorizacion"
                      placeholder="Número de autorización"
                      value={mercancia.numero_autorizacion || ''}
                      onChange={(e) => handleFieldChange('numero_autorizacion', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="folio_acreditacion">Folio Acreditación</Label>
                    <Input
                      id="folio_acreditacion"
                      placeholder="Folio de acreditación"
                      value={mercancia.folio_acreditacion || ''}
                      onChange={(e) => handleFieldChange('folio_acreditacion', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion_detallada">Descripción Detallada</Label>
                  <Textarea
                    id="descripcion_detallada"
                    placeholder="Descripción adicional de la mercancía..."
                    value={mercancia.descripcion_detallada || ''}
                    onChange={(e) => handleFieldChange('descripcion_detallada', e.target.value)}
                    className="min-h-20"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sugerencias de IA */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <Label>Sugerencias de IA</Label>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded">
                    <span className="text-sm text-blue-800">{suggestion}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleApplySuggestion(suggestion)}
                    >
                      Aplicar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button 
              onClick={onSave} 
              disabled={!isValid}
              className="flex items-center gap-2"
            >
              {isNew ? 'Agregar' : 'Actualizar'} Mercancía
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
