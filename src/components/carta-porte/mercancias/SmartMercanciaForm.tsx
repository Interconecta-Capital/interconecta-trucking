
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { CatalogoSelectorMejorado } from '@/components/catalogos/CatalogoSelectorMejorado';
import { SmartMercanciaInput } from '@/components/ai/SmartMercanciaInput';
import { Package, Save, X, Trash2, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';
import { Mercancia } from '@/hooks/useMercancias';
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
  const [formData, setFormData] = useState<Mercancia>({
    bienes_transp: '',
    descripcion: '',
    cantidad: 1,
    clave_unidad: '',
    peso_kg: 0,
    valor_mercancia: 0,
    material_peligroso: false,
    moneda: 'MXN',
    fraccion_arancelaria: '',
    embalaje: '',
    ...mercancia
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (mercancia) {
      setFormData(mercancia);
    }
  }, [mercancia]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.bienes_transp?.trim()) {
      newErrors.bienes_transp = 'La clave de producto/servicio es requerida';
    }

    if (!formData.descripcion?.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (!formData.cantidad || formData.cantidad <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    }

    if (!formData.clave_unidad?.trim()) {
      newErrors.clave_unidad = 'La clave de unidad es requerida';
    }

    if (!formData.peso_kg || formData.peso_kg <= 0) {
      newErrors.peso_kg = 'El peso debe ser mayor a 0';
    }

    if (!formData.valor_mercancia || formData.valor_mercancia <= 0) {
      newErrors.valor_mercancia = 'El valor debe ser mayor a 0';
    }

    if (formData.material_peligroso && !formData.cve_material_peligroso?.trim()) {
      newErrors.cve_material_peligroso = 'Debe seleccionar el material peligroso específico';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    const success = await onSave(formData);
    if (success) {
      toast.success(mercancia ? 'Mercancía actualizada' : 'Mercancía agregada');
    }
  };

  const handleFieldChange = (field: keyof Mercancia, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleMercanciaSelect = (mercanciaData: any) => {
    if (mercanciaData) {
      setFormData(prev => ({
        ...prev,
        bienes_transp: mercanciaData.claveProdServ || prev.bienes_transp,
        clave_unidad: mercanciaData.claveUnidad || prev.clave_unidad,
        embalaje: mercanciaData.tipoEmbalaje || prev.embalaje
      }));
    }
  };

  const handleCatalogoSelect = (field: keyof Mercancia, data: any) => {
    setFormData(prev => ({ ...prev, [field]: data.value }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <span>{mercancia ? 'Editar Mercancía' : `Nueva Mercancía #${index + 1}`}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Sparkles className="h-4 w-4 mr-1" />
              {showAdvanced ? 'Básico' : 'Avanzado'}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Descripción inteligente */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción de la Mercancía *</Label>
            <SmartMercanciaInput
              value={formData.descripcion}
              onChange={(value) => handleFieldChange('descripcion', value)}
              onMercanciaSelect={handleMercanciaSelect}
              placeholder="Describe detalladamente la mercancía..."
              showValidation={true}
              showClaveProducto={true}
            />
            {errors.descripcion && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.descripcion}
              </p>
            )}
          </div>

          {/* Clave de producto/servicio */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <CatalogoSelectorMejorado
                tipo="productos"
                value={formData.bienes_transp}
                onValueChange={(value) => handleFieldChange('bienes_transp', value)}
                onSelectionData={(data) => handleCatalogoSelect('bienes_transp', data)}
                label="Clave de Producto/Servicio SAT *"
                placeholder="Buscar clave de producto..."
                required
                error={errors.bienes_transp}
                allowSearch={true}
                showRefresh={true}
              />
            </div>

            <div>
              <Label htmlFor="fraccion_arancelaria">Fracción Arancelaria</Label>
              <Input
                id="fraccion_arancelaria"
                value={formData.fraccion_arancelaria || ''}
                onChange={(e) => handleFieldChange('fraccion_arancelaria', e.target.value)}
                placeholder="Ej: 12345678"
                className={errors.fraccion_arancelaria ? 'border-red-500' : ''}
              />
              {errors.fraccion_arancelaria && (
                <p className="text-sm text-red-500 mt-1">{errors.fraccion_arancelaria}</p>
              )}
            </div>
          </div>

          {/* Cantidad y unidad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cantidad">Cantidad *</Label>
              <Input
                id="cantidad"
                type="number"
                min="0.001"
                step="0.001"
                value={formData.cantidad}
                onChange={(e) => handleFieldChange('cantidad', parseFloat(e.target.value) || 0)}
                className={errors.cantidad ? 'border-red-500' : ''}
              />
              {errors.cantidad && (
                <p className="text-sm text-red-500 mt-1">{errors.cantidad}</p>
              )}
            </div>

            <div>
              <CatalogoSelectorMejorado
                tipo="unidades"
                value={formData.clave_unidad}
                onValueChange={(value) => handleFieldChange('clave_unidad', value)}
                onSelectionData={(data) => handleCatalogoSelect('clave_unidad', data)}
                label="Unidad de Medida SAT *"
                placeholder="Buscar unidad..."
                required
                error={errors.clave_unidad}
                allowSearch={true}
                showRefresh={true}
              />
            </div>
          </div>

          {/* Peso y valor */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="peso_kg">Peso (kg) *</Label>
              <Input
                id="peso_kg"
                type="number"
                min="0.001"
                step="0.001"
                value={formData.peso_kg}
                onChange={(e) => handleFieldChange('peso_kg', parseFloat(e.target.value) || 0)}
                className={errors.peso_kg ? 'border-red-500' : ''}
              />
              {errors.peso_kg && (
                <p className="text-sm text-red-500 mt-1">{errors.peso_kg}</p>
              )}
            </div>

            <div>
              <Label htmlFor="valor_mercancia">Valor *</Label>
              <Input
                id="valor_mercancia"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.valor_mercancia}
                onChange={(e) => handleFieldChange('valor_mercancia', parseFloat(e.target.value) || 0)}
                className={errors.valor_mercancia ? 'border-red-500' : ''}
              />
              {errors.valor_mercancia && (
                <p className="text-sm text-red-500 mt-1">{errors.valor_mercancia}</p>
              )}
            </div>

            <div>
              <Label htmlFor="moneda">Moneda</Label>
              <Input
                id="moneda"
                value={formData.moneda}
                onChange={(e) => handleFieldChange('moneda', e.target.value)}
                placeholder="MXN"
                className="bg-gray-50"
                readOnly
              />
            </div>
          </div>

          {/* Tipo de embalaje */}
          <div>
            <CatalogoSelectorMejorado
              tipo="embalajes"
              value={formData.embalaje || ''}
              onValueChange={(value) => handleFieldChange('embalaje', value)}
              onSelectionData={(data) => handleCatalogoSelect('embalaje', data)}
              label="Tipo de Embalaje"
              placeholder="Buscar tipo de embalaje..."
              allowSearch={true}
              showRefresh={true}
            />
          </div>

          {/* Material peligroso */}
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="material_peligroso"
                checked={formData.material_peligroso}
                onCheckedChange={(checked) => handleFieldChange('material_peligroso', checked)}
              />
              <Label htmlFor="material_peligroso" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Material Peligroso
              </Label>
            </div>

            {formData.material_peligroso && (
              <div>
                <CatalogoSelectorMejorado
                  tipo="materiales_peligrosos"
                  value={formData.cve_material_peligroso || ''}
                  onValueChange={(value) => handleFieldChange('cve_material_peligroso', value)}
                  onSelectionData={(data) => handleCatalogoSelect('cve_material_peligroso', data)}
                  label="Clave de Material Peligroso *"
                  placeholder="Buscar material peligroso..."
                  required
                  error={errors.cve_material_peligroso}
                  allowSearch={true}
                  showRefresh={true}
                />
              </div>
            )}
          </div>

          {/* Campos avanzados */}
          {showAdvanced && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium text-gray-900">Información Adicional</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numero_piezas">Número de Piezas</Label>
                  <Input
                    id="numero_piezas"
                    type="number"
                    min="1"
                    value={formData.numero_piezas || ''}
                    onChange={(e) => handleFieldChange('numero_piezas', parseInt(e.target.value) || undefined)}
                  />
                </div>

                <div>
                  <Label htmlFor="uuid_comercio_ext">UUID Comercio Exterior</Label>
                  <Input
                    id="uuid_comercio_ext"
                    value={formData.uuid_comercio_ext || ''}
                    onChange={(e) => handleFieldChange('uuid_comercio_ext', e.target.value)}
                    placeholder="Para operaciones de comercio exterior"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descripcion_detallada">Descripción Detallada</Label>
                <Textarea
                  id="descripcion_detallada"
                  value={formData.descripcion_detallada || ''}
                  onChange={(e) => handleFieldChange('descripcion_detallada', e.target.value)}
                  placeholder="Descripción más específica de la mercancía..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-between pt-4">
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
              {onRemove && (
                <Button type="button" variant="destructive" onClick={onRemove}>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              )}
            </div>
            
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Guardando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {mercancia ? 'Actualizar' : 'Guardar'}
                </div>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
