
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Package, Save, X } from 'lucide-react';
import { CatalogoSelectorMejorado } from '@/components/catalogos/CatalogoSelectorMejorado';
import { MercanciaFaunaSilvestre } from './MercanciaFaunaSilvestre';
import { MercanciaCantidades } from './MercanciaCantidades';
import { MercanciaMaterialPeligroso } from './MercanciaMaterialPeligroso';

interface EnhancedMercanciaFormProps {
  mercancia?: any;
  onSave: (mercancia: any) => Promise<boolean>;
  onCancel: () => void;
  index: number;
}

export function EnhancedMercanciaForm({ 
  mercancia, 
  onSave, 
  onCancel,
  index 
}: EnhancedMercanciaFormProps) {
  const [formData, setFormData] = useState({
    id: mercancia?.id || `mercancia-${Date.now()}`,
    descripcion: mercancia?.descripcion || '',
    bienes_transp: mercancia?.bienes_transp || '',
    clave_unidad: mercancia?.clave_unidad || '',
    cantidad: mercancia?.cantidad || 0,
    peso_kg: mercancia?.peso_kg || 0,
    valor_mercancia: mercancia?.valor_mercancia || 0,
    material_peligroso: mercancia?.material_peligroso || false,
    cve_material_peligroso: mercancia?.cve_material_peligroso || '',
    embalaje: mercancia?.embalaje || '',
    fraccion_arancelaria: mercancia?.fraccion_arancelaria || '',
    moneda: mercancia?.moneda || 'MXN',
    // Metadatos de fauna silvestre
    metadata_fauna: mercancia?.metadata_fauna || {}
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Detectar automáticamente si es fauna silvestre y usar la clave correcta
  useEffect(() => {
    const descripcionLower = formData.descripcion.toLowerCase();
    const esFaunaSilvestre = ['jaguar', 'panthera', 'ocelote', 'tapir', 'quetzal', 'animal', 'especie'].some(keyword => 
      descripcionLower.includes(keyword)
    );

    if (esFaunaSilvestre && formData.bienes_transp !== '01010101') {
      setFormData(prev => ({
        ...prev,
        bienes_transp: '01010101' // Clave específica para animales vivos en CCP
      }));
    }
  }, [formData.descripcion]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.descripcion?.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (!formData.bienes_transp?.trim()) {
      newErrors.bienes_transp = 'La clave de producto/servicio CCP es requerida';
    }

    if (!formData.clave_unidad?.trim()) {
      newErrors.clave_unidad = 'La unidad de medida es requerida';
    }

    if (!formData.cantidad || formData.cantidad <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    }

    if (!formData.peso_kg || formData.peso_kg <= 0) {
      newErrors.peso_kg = 'El peso debe ser mayor a 0';
    }

    // Validaciones específicas para fauna silvestre
    if (formData.metadata_fauna?.esFaunaProtegida) {
      if (!formData.metadata_fauna.permisoSemarnat) {
        newErrors.permisoSemarnat = 'Permiso SEMARNAT requerido para fauna protegida';
      }
      if (!formData.metadata_fauna.acreditacionLegal) {
        newErrors.acreditacionLegal = 'Acreditación de legal procedencia requerida';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const success = await onSave(formData);
      if (success) {
        // Form will be closed by parent component
      }
    } catch (error) {
      console.error('Error saving mercancia:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFaunaMetadataChange = (metadata: any) => {
    setFormData(prev => ({
      ...prev,
      metadata_fauna: metadata
    }));
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {mercancia ? `Editar Mercancía #${index + 1}` : `Nueva Mercancía #${index + 1}`}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Descripción principal */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción de la Mercancía *</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleFieldChange('descripcion', e.target.value)}
              placeholder="Describe detalladamente la mercancía (ej: Jaguar macho, 5 años...)"
              rows={3}
              className={errors.descripcion ? 'border-red-500' : ''}
            />
            {errors.descripcion && (
              <p className="text-sm text-red-600">{errors.descripcion}</p>
            )}
          </div>

          {/* Componente especializado para fauna silvestre */}
          <MercanciaFaunaSilvestre
            descripcion={formData.descripcion}
            onDescripcionChange={(desc) => handleFieldChange('descripcion', desc)}
            onMetadataChange={handleFaunaMetadataChange}
          />

          {/* Claves SAT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CatalogoSelectorMejorado
              tipo="productos_ccp"
              label="Clave Bienes Transporte CCP *"
              value={formData.bienes_transp}
              onValueChange={(value) => handleFieldChange('bienes_transp', value)}
              placeholder="01010101 - Animales vivos"
              error={errors.bienes_transp}
              required
              allowSearch={true}
              showRefresh={true}
            />

            <CatalogoSelectorMejorado
              tipo="unidades"
              label="Clave Unidad SAT *"
              value={formData.clave_unidad}
              onValueChange={(value) => handleFieldChange('clave_unidad', value)}
              placeholder="H87 - Pieza"
              error={errors.clave_unidad}
              required
              allowSearch={true}
              showRefresh={true}
            />
          </div>

          {/* Cantidades y pesos */}
          <MercanciaCantidades 
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
          />

          {/* Material peligroso y embalaje */}
          <MercanciaMaterialPeligroso 
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
          />

          {/* Fracción arancelaria (opcional en 3.1) */}
          <div className="space-y-2">
            <Label htmlFor="fraccion_arancelaria">Fracción Arancelaria (Opcional)</Label>
            <Input
              id="fraccion_arancelaria"
              value={formData.fraccion_arancelaria}
              onChange={(e) => handleFieldChange('fraccion_arancelaria', e.target.value)}
              placeholder="00000000"
              maxLength={8}
            />
          </div>

          <div className="flex justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Guardando...' : (mercancia ? 'Actualizar' : 'Agregar')} Mercancía
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
