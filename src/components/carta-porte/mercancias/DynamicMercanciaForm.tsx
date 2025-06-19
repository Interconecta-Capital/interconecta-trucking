
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Package, AlertTriangle, Snowflake, Truck, Shield } from 'lucide-react';
import { MercanciaCompleta } from '@/types/cartaPorte';
import { useSmartMercanciaForm } from '@/hooks/ai/useSmartMercanciaForm';
import { EnhancedAutocompleteInput } from '@/components/ai/EnhancedAutocompleteInput';
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
  const { smartState, getConditionalFields, isFormValid } = useSmartMercanciaForm(mercancia);

  const handleFieldChange = (field: keyof MercanciaCompleta, value: any) => {
    onChange({
      ...mercancia,
      [field]: value
    });
  };

  const conditionalFields = getConditionalFields();

  return (
    <div className={className}>
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

      {/* Material Peligroso - Dinámico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Material Peligroso
            </div>
            {smartState.showMaterialPeligrosoFields && (
              <Badge variant="destructive">Detectado Automáticamente</Badge>
            )}
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

          {(mercancia.material_peligroso || smartState.showMaterialPeligrosoFields) && (
            <>
              <div className="space-y-2">
                <Label>Clave Material Peligroso (UN) *</Label>
                <Input
                  value={mercancia.cve_material_peligroso || ''}
                  onChange={(e) => handleFieldChange('cve_material_peligroso', e.target.value)}
                  placeholder="1203, 8000, etc."
                  required
                />
              </div>

              {conditionalFields.includes('embalaje_material_peligroso') && (
                <div className="space-y-2">
                  <Label>Tipo de Embalaje Especializado</Label>
                  <Input
                    value={mercancia.embalaje || ''}
                    onChange={(e) => handleFieldChange('embalaje', e.target.value)}
                    placeholder="Contenedor especializado, tanque certificado..."
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Campos SEMARNAT - Aparecen dinámicamente */}
      {smartState.showSemarnatFields && (
        <Card className="border-orange-200 bg-orange-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Autorización SEMARNAT Requerida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                Material regulado detectado. Se requiere documentación SEMARNAT para el transporte.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Número de Autorización SEMARNAT *</Label>
                <Input
                  value={mercancia.numero_autorizacion || ''}
                  onChange={(e) => handleFieldChange('numero_autorizacion', e.target.value)}
                  placeholder="Número de autorización"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Folio de Acreditación *</Label>
                <Input
                  value={mercancia.folio_acreditacion || ''}
                  onChange={(e) => handleFieldChange('folio_acreditacion', e.target.value)}
                  placeholder="Folio de acreditación"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campos de Refrigeración - Aparecen dinámicamente */}
      {smartState.showRefrigeracionFields && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Snowflake className="h-5 w-5" />
              Control de Temperatura Detectado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <Snowflake className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Producto que requiere control de temperatura durante el transporte.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Temperatura de Transporte (°C)</Label>
                <Input
                  type="number"
                  placeholder="Ej: -18, 2-8, 15-25"
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Refrigeración</Label>
                <Input
                  placeholder="Congelado, Refrigerado, Temperatura controlada"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campos Transporte Especializado - Aparecen dinámicamente */}
      {smartState.showEspecializadoFields && (
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Truck className="h-5 w-5" />
              Transporte Especializado Requerido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-purple-200 bg-purple-50">
              <Truck className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-800">
                Mercancía que requiere vehículo o manejo especializado.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Observaciones Especiales</Label>
              <Textarea
                placeholder="Describa los requisitos especiales de transporte..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Errores de validación */}
      {smartState.validationErrors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium text-red-800">Errores de validación:</div>
              {smartState.validationErrors.map((error, index) => (
                <div key={index} className="text-sm text-red-700">• {error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Sugerencias de IA */}
      {smartState.aiSuggestions.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium text-blue-800">Sugerencias del sistema:</div>
              {smartState.aiSuggestions.map((suggestion, index) => (
                <div key={index} className="text-sm text-blue-700">• {suggestion}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Estado del formulario */}
      <div className="flex justify-end">
        <Badge variant={isFormValid() ? "default" : "destructive"}>
          {isFormValid() ? "✓ Formulario válido" : "⚠ Completar campos obligatorios"}
        </Badge>
      </div>
    </div>
  );
}
