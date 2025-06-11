
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CatalogoSelector } from '@/components/catalogos/CatalogoSelector';
import { 
  useBuscarProductosServicios, 
  useBuscarClaveUnidad, 
  useBuscarMaterialesPeligrosos 
} from '@/hooks/useCatalogos';
import { Mercancia } from '@/hooks/useMercancias';
import { Save, X } from 'lucide-react';

interface MercanciaFormProps {
  mercancia?: Mercancia;
  onSave: (mercancia: Mercancia) => Promise<{ success: boolean; errores?: any[] }>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const MercanciaForm: React.FC<MercanciaFormProps> = ({
  mercancia,
  onSave,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<Mercancia>({
    bienes_transp: '',
    descripcion: '',
    cantidad: 0,
    clave_unidad: '',
    peso_kg: 0,
    valor_mercancia: 0,
    moneda: 'MXN',
    material_peligroso: false,
    cve_material_peligroso: '',
    embalaje: '',
    fraccion_arancelaria: '',
    uuid_comercio_ext: '',
    ...mercancia
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busquedaProducto, setBusquedaProducto] = useState('');
  const [busquedaUnidad, setBusquedaUnidad] = useState('');
  const [busquedaMaterial, setBusquedaMaterial] = useState('');

  const { data: productos = [], isLoading: loadingProductos } = useBuscarProductosServicios(
    busquedaProducto, 
    busquedaProducto.length >= 2
  );

  const { data: unidades = [], isLoading: loadingUnidades } = useBuscarClaveUnidad(
    busquedaUnidad,
    busquedaUnidad.length >= 1
  );

  const { data: materiales = [], isLoading: loadingMateriales } = useBuscarMaterialesPeligrosos(
    busquedaMaterial,
    formData.material_peligroso && busquedaMaterial.length >= 2
  );

  useEffect(() => {
    if (mercancia) {
      setFormData({ ...mercancia });
    }
  }, [mercancia]);

  const handleInputChange = (field: keyof Mercancia, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await onSave(formData);
    if (result.success) {
      onCancel(); // Cerrar formulario si fue exitoso
    } else if (result.errores) {
      const newErrors: Record<string, string> = {};
      result.errores.forEach(error => {
        newErrors[error.campo] = error.mensaje;
      });
      setErrors(newErrors);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {mercancia ? 'Editar Mercancía' : 'Agregar Mercancía'}
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Clave Producto/Servicio */}
            <div className="space-y-2">
              <CatalogoSelector
                label="Clave Producto/Servicio"
                placeholder="Buscar clave de producto..."
                value={formData.bienes_transp}
                onValueChange={(clave, item) => {
                  handleInputChange('bienes_transp', clave);
                  if (item && !formData.descripcion) {
                    handleInputChange('descripcion', item.descripcion);
                  }
                  setBusquedaProducto('');
                }}
                items={productos}
                isLoading={loadingProductos}
                required
                error={errors.bienes_transp}
              />
            </div>

            {/* Clave Unidad */}
            <div className="space-y-2">
              <CatalogoSelector
                label="Clave Unidad"
                placeholder="Buscar unidad..."
                value={formData.clave_unidad}
                onValueChange={(clave) => {
                  handleInputChange('clave_unidad', clave);
                  setBusquedaUnidad('');
                }}
                items={unidades}
                isLoading={loadingUnidades}
                required
                error={errors.clave_unidad}
              />
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">
              Descripción <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Descripción detallada de la mercancía..."
              className={errors.descripcion ? 'border-red-500' : ''}
            />
            {errors.descripcion && (
              <p className="text-sm text-red-500">{errors.descripcion}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Cantidad */}
            <div className="space-y-2">
              <Label htmlFor="cantidad">
                Cantidad <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cantidad"
                type="number"
                step="0.01"
                min="0"
                value={formData.cantidad}
                onChange={(e) => handleInputChange('cantidad', parseFloat(e.target.value) || 0)}
                className={errors.cantidad ? 'border-red-500' : ''}
              />
              {errors.cantidad && (
                <p className="text-sm text-red-500">{errors.cantidad}</p>
              )}
            </div>

            {/* Peso */}
            <div className="space-y-2">
              <Label htmlFor="peso_kg">Peso (kg)</Label>
              <Input
                id="peso_kg"
                type="number"
                step="0.01"
                min="0"
                value={formData.peso_kg || ''}
                onChange={(e) => handleInputChange('peso_kg', parseFloat(e.target.value) || undefined)}
                className={errors.peso_kg ? 'border-red-500' : ''}
              />
              {errors.peso_kg && (
                <p className="text-sm text-red-500">{errors.peso_kg}</p>
              )}
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="valor_mercancia">Valor</Label>
              <Input
                id="valor_mercancia"
                type="number"
                step="0.01"
                min="0"
                value={formData.valor_mercancia || ''}
                onChange={(e) => handleInputChange('valor_mercancia', parseFloat(e.target.value) || undefined)}
                className={errors.valor_mercancia ? 'border-red-500' : ''}
              />
              {errors.valor_mercancia && (
                <p className="text-sm text-red-500">{errors.valor_mercancia}</p>
              )}
            </div>
          </div>

          {/* Material Peligroso */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="material_peligroso"
                checked={formData.material_peligroso}
                onCheckedChange={(checked) => {
                  handleInputChange('material_peligroso', checked);
                  if (!checked) {
                    handleInputChange('cve_material_peligroso', '');
                  }
                }}
              />
              <Label htmlFor="material_peligroso">Material Peligroso</Label>
            </div>

            {formData.material_peligroso && (
              <div className="space-y-2">
                <CatalogoSelector
                  label="Clave Material Peligroso"
                  placeholder="Buscar material peligroso..."
                  value={formData.cve_material_peligroso || ''}
                  onValueChange={(clave) => {
                    handleInputChange('cve_material_peligroso', clave);
                    setBusquedaMaterial('');
                  }}
                  items={materiales}
                  isLoading={loadingMateriales}
                  required={formData.material_peligroso}
                  error={errors.cve_material_peligroso}
                />
              </div>
            )}
          </div>

          {/* Campos adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="embalaje">Embalaje</Label>
              <Input
                id="embalaje"
                value={formData.embalaje || ''}
                onChange={(e) => handleInputChange('embalaje', e.target.value)}
                placeholder="Tipo de embalaje..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fraccion_arancelaria">Fracción Arancelaria</Label>
              <Input
                id="fraccion_arancelaria"
                value={formData.fraccion_arancelaria || ''}
                onChange={(e) => handleInputChange('fraccion_arancelaria', e.target.value)}
                placeholder="Fracción arancelaria..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{mercancia ? 'Actualizar' : 'Agregar'}</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
