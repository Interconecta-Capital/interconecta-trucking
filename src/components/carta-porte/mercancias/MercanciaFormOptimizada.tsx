
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { PRODUCTOS_SERVICIOS_SAT, UNIDADES_MEDIDA_SAT, TIPOS_EMBALAJE_SAT, formatCatalogItem } from '@/data/catalogosSATEstaticos';

interface MercanciaCompleta {
  id: string;
  descripcion: string;
  bienes_transp: string;
  clave_unidad: string;
  cantidad: number;
  peso_kg: number;
  valor_mercancia?: number;
  material_peligroso?: boolean;
  moneda?: string;
  cve_material_peligroso?: string;
  embalaje?: string;
  fraccion_arancelaria?: string;
  uuid_comercio_ext?: string;
}

interface MercanciaFormOptimizadaProps {
  mercancia?: MercanciaCompleta;
  onSave: (mercancia: MercanciaCompleta, index: number) => void;
  onCancel: () => void;
  index: number;
}

export function MercanciaFormOptimizada({
  mercancia,
  onSave,
  onCancel,
  index
}: MercanciaFormOptimizadaProps) {
  const [formData, setFormData] = useState<MercanciaCompleta>({
    id: mercancia?.id || crypto.randomUUID(),
    descripcion: mercancia?.descripcion || '',
    bienes_transp: mercancia?.bienes_transp || '',
    clave_unidad: mercancia?.clave_unidad || 'KGM',
    cantidad: mercancia?.cantidad || 1,
    peso_kg: mercancia?.peso_kg || 0,
    valor_mercancia: mercancia?.valor_mercancia || 0,
    material_peligroso: mercancia?.material_peligroso || false,
    moneda: mercancia?.moneda || 'MXN',
    cve_material_peligroso: mercancia?.cve_material_peligroso || '',
    embalaje: mercancia?.embalaje || '',
    fraccion_arancelaria: mercancia?.fraccion_arancelaria || '',
    uuid_comercio_ext: mercancia?.uuid_comercio_ext || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Catálogos formateados
  const productosOptions = PRODUCTOS_SERVICIOS_SAT.map(formatCatalogItem);
  const unidadesOptions = UNIDADES_MEDIDA_SAT.map(formatCatalogItem);
  const embalajesOptions = TIPOS_EMBALAJE_SAT.map(formatCatalogItem);

  const handleChange = (field: keyof MercanciaCompleta, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (!formData.bienes_transp.trim()) {
      newErrors.bienes_transp = 'La clave de producto/servicio es requerida';
    }

    if (!formData.clave_unidad.trim()) {
      newErrors.clave_unidad = 'La unidad de medida es requerida';
    }

    if (formData.cantidad <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    }

    if (formData.peso_kg <= 0) {
      newErrors.peso_kg = 'El peso debe ser mayor a 0';
    }

    if (formData.material_peligroso && !formData.cve_material_peligroso?.trim()) {
      newErrors.cve_material_peligroso = 'La clave de material peligroso es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData, index);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {mercancia ? 'Editar Mercancía' : 'Nueva Mercancía'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Descripción */}
          <div>
            <Label htmlFor="descripcion">Descripción *</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Descripción detallada de la mercancía"
              className={`bg-white ${errors.descripcion ? 'border-red-500' : ''}`}
              rows={3}
            />
            {errors.descripcion && (
              <p className="text-sm text-red-500 mt-1">{errors.descripcion}</p>
            )}
          </div>

          {/* Clave Producto/Servicio */}
          <div>
            <Label htmlFor="bienes_transp">Clave Producto/Servicio SAT *</Label>
            <Select
              value={formData.bienes_transp}
              onValueChange={(value) => handleChange('bienes_transp', value)}
            >
              <SelectTrigger className={`bg-white ${errors.bienes_transp ? 'border-red-500' : ''}`}>
                <SelectValue placeholder="Seleccionar producto/servicio..." />
              </SelectTrigger>
              <SelectContent className="bg-white max-h-60">
                {productosOptions.map((producto) => (
                  <SelectItem key={producto.clave} value={producto.clave}>
                    {producto.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bienes_transp && (
              <p className="text-sm text-red-500 mt-1">{errors.bienes_transp}</p>
            )}
          </div>

          {/* Cantidad y Unidad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cantidad">Cantidad *</Label>
              <Input
                id="cantidad"
                type="number"
                value={formData.cantidad}
                onChange={(e) => handleChange('cantidad', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className={`bg-white ${errors.cantidad ? 'border-red-500' : ''}`}
              />
              {errors.cantidad && (
                <p className="text-sm text-red-500 mt-1">{errors.cantidad}</p>
              )}
            </div>

            <div>
              <Label htmlFor="clave_unidad">Unidad de Medida *</Label>
              <Select
                value={formData.clave_unidad}
                onValueChange={(value) => handleChange('clave_unidad', value)}
              >
                <SelectTrigger className={`bg-white ${errors.clave_unidad ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Seleccionar unidad..." />
                </SelectTrigger>
                <SelectContent className="bg-white max-h-60">
                  {unidadesOptions.map((unidad) => (
                    <SelectItem key={unidad.clave} value={unidad.clave}>
                      {unidad.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clave_unidad && (
                <p className="text-sm text-red-500 mt-1">{errors.clave_unidad}</p>
              )}
            </div>
          </div>

          {/* Peso y Valor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="peso_kg">Peso (kg) *</Label>
              <Input
                id="peso_kg"
                type="number"
                value={formData.peso_kg}
                onChange={(e) => handleChange('peso_kg', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className={`bg-white ${errors.peso_kg ? 'border-red-500' : ''}`}
              />
              {errors.peso_kg && (
                <p className="text-sm text-red-500 mt-1">{errors.peso_kg}</p>
              )}
            </div>

            <div>
              <Label htmlFor="valor_mercancia">Valor de la Mercancía</Label>
              <Input
                id="valor_mercancia"
                type="number"
                value={formData.valor_mercancia}
                onChange={(e) => handleChange('valor_mercancia', parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="bg-white"
              />
            </div>
          </div>

          <Separator />

          {/* Material Peligroso */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="material_peligroso"
                checked={formData.material_peligroso}
                onCheckedChange={(checked) => handleChange('material_peligroso', checked)}
              />
              <Label htmlFor="material_peligroso">Material Peligroso</Label>
            </div>

            {formData.material_peligroso && (
              <div>
                <Label htmlFor="cve_material_peligroso">Clave Material Peligroso *</Label>
                <Input
                  id="cve_material_peligroso"
                  value={formData.cve_material_peligroso}
                  onChange={(e) => handleChange('cve_material_peligroso', e.target.value)}
                  placeholder="Ej: 1203"
                  className={`bg-white ${errors.cve_material_peligroso ? 'border-red-500' : ''}`}
                />
                {errors.cve_material_peligroso && (
                  <p className="text-sm text-red-500 mt-1">{errors.cve_material_peligroso}</p>
                )}
              </div>
            )}
          </div>

          {/* Embalaje */}
          <div>
            <Label htmlFor="embalaje">Tipo de Embalaje</Label>
            <Select
              value={formData.embalaje}
              onValueChange={(value) => handleChange('embalaje', value)}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Seleccionar embalaje..." />
              </SelectTrigger>
              <SelectContent className="bg-white max-h-60">
                {embalajesOptions.map((embalaje) => (
                  <SelectItem key={embalaje.clave} value={embalaje.clave}>
                    {embalaje.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Fracción Arancelaria */}
          <div>
            <Label htmlFor="fraccion_arancelaria">Fracción Arancelaria</Label>
            <Input
              id="fraccion_arancelaria"
              value={formData.fraccion_arancelaria}
              onChange={(e) => handleChange('fraccion_arancelaria', e.target.value)}
              placeholder="Ej: 01012100"
              className="bg-white"
              maxLength={8}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botones */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          {mercancia ? 'Actualizar' : 'Agregar'} Mercancía
        </Button>
      </div>
    </form>
  );
}
