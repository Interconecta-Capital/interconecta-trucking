
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Package, Save, AlertTriangle, Info } from 'lucide-react';
import { MercanciaCompleta } from '@/types/cartaPorte';
import { CatalogoSelectorMejorado } from '@/components/catalogos/CatalogoSelectorMejorado';
import { useToast } from '@/hooks/use-toast';

const mercanciaSchema = z.object({
  id: z.string(),
  bienes_transp: z.string().min(1, 'Clave de producto/servicio requerida'),
  descripcion: z.string().min(1, 'Descripción requerida'),
  cantidad: z.number().min(0.01, 'Cantidad debe ser mayor a 0'),
  clave_unidad: z.string().min(1, 'Unidad de medida requerida'),
  peso_kg: z.number().min(0.01, 'Peso debe ser mayor a 0'),
  moneda: z.string().default('MXN'),
  valor_mercancia: z.number().min(0, 'Valor debe ser mayor o igual a 0'),
  material_peligroso: z.boolean().default(false),
  especie_protegida: z.boolean().default(false),
  fraccion_arancelaria: z.string().optional(),
  regimen_aduanero: z.string().optional(),
  cve_material_peligroso: z.string().optional(),
  descripcion_detallada: z.string().optional(),
  tipo_embalaje: z.string().optional()
});

type MercanciaFormData = z.infer<typeof mercanciaSchema>;

interface MercanciaFormCompletaProps {
  mercancia?: MercanciaCompleta;
  onSave: (mercancia: MercanciaCompleta) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

export function MercanciaFormCompleta({ 
  mercancia, 
  onSave, 
  onCancel, 
  isEdit = false 
}: MercanciaFormCompletaProps) {
  const { toast } = useToast();
  const [dimensiones, setDimensiones] = useState({
    largo: mercancia?.dimensiones?.largo || 0,
    ancho: mercancia?.dimensiones?.ancho || 0,
    alto: mercancia?.dimensiones?.alto || 0
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<MercanciaFormData>({
    resolver: zodResolver(mercanciaSchema),
    defaultValues: {
      id: mercancia?.id || crypto.randomUUID(),
      descripcion: mercancia?.descripcion || '',
      bienes_transp: mercancia?.bienes_transp || '',
      clave_unidad: mercancia?.clave_unidad || '',
      cantidad: mercancia?.cantidad || 0,
      peso_kg: mercancia?.peso_kg || 0,
      valor_mercancia: mercancia?.valor_mercancia || 0,
      material_peligroso: mercancia?.material_peligroso || false,
      especie_protegida: mercancia?.especie_protegida || false,
      moneda: mercancia?.moneda || 'MXN',
      fraccion_arancelaria: mercancia?.fraccion_arancelaria || '',
      regimen_aduanero: mercancia?.regimen_aduanero || '',
      cve_material_peligroso: mercancia?.cve_material_peligroso || '',
      descripcion_detallada: mercancia?.descripcion_detallada || '',
      tipo_embalaje: mercancia?.tipo_embalaje || ''
    }
  });

  const materialPeligroso = watch('material_peligroso');
  const especieProtegida = watch('especie_protegida');

  const handleDimensionChange = (dimension: 'largo' | 'ancho' | 'alto', value: number) => {
    setDimensiones(prev => ({ ...prev, [dimension]: value }));
  };

  const onSubmit = async (data: MercanciaFormData) => {
    try {
      const mercanciaCompleta: MercanciaCompleta = {
        id: data.id,
        bienes_transp: data.bienes_transp,
        descripcion: data.descripcion,
        cantidad: data.cantidad,
        clave_unidad: data.clave_unidad,
        peso_kg: data.peso_kg,
        moneda: data.moneda,
        valor_mercancia: data.valor_mercancia,
        material_peligroso: data.material_peligroso,
        especie_protegida: data.especie_protegida,
        fraccion_arancelaria: data.fraccion_arancelaria,
        regimen_aduanero: data.regimen_aduanero,
        cve_material_peligroso: data.cve_material_peligroso,
        descripcion_detallada: data.descripcion_detallada,
        tipo_embalaje: data.tipo_embalaje,
        dimensiones: dimensiones.largo > 0 || dimensiones.ancho > 0 || dimensiones.alto > 0 
          ? dimensiones 
          : undefined
      };

      await onSave(mercanciaCompleta);
      toast({
        title: "Éxito",
        description: `Mercancía ${isEdit ? 'actualizada' : 'agregada'} correctamente`,
      });
    } catch (error) {
      console.error('Error guardando mercancía:', error);
      toast({
        title: "Error",
        description: "Error al guardar la mercancía",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-500" />
          {isEdit ? 'Editar Mercancía' : 'Nueva Mercancía'}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Info className="h-4 w-4" />
              Información Básica
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CatalogoSelectorMejorado
                tipo="productos"
                label="Clave de Producto/Servicio"
                value={watch('bienes_transp')}
                onValueChange={(value) => setValue('bienes_transp', value)}
                placeholder="Buscar clave..."
                required
              />

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Input 
                  id="descripcion"
                  {...register('descripcion')}
                  placeholder="Descripción de la mercancía" 
                />
                {errors.descripcion && (
                  <p className="text-sm text-red-600">{errors.descripcion.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad *</Label>
                <Input 
                  id="cantidad"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('cantidad', { valueAsNumber: true })}
                  placeholder="0.00" 
                />
                {errors.cantidad && (
                  <p className="text-sm text-red-600">{errors.cantidad.message}</p>
                )}
              </div>

              <CatalogoSelectorMejorado
                tipo="unidades"
                label="Unidad de Medida"
                value={watch('clave_unidad')}
                onValueChange={(value) => setValue('clave_unidad', value)}
                placeholder="Seleccionar unidad..."
                required
              />

              <div className="space-y-2">
                <Label htmlFor="peso_kg">Peso (kg) *</Label>
                <Input 
                  id="peso_kg"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('peso_kg', { valueAsNumber: true })}
                  placeholder="0.00" 
                />
                {errors.peso_kg && (
                  <p className="text-sm text-red-600">{errors.peso_kg.message}</p>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Información Comercial */}
          <div className="space-y-4">
            <h4 className="font-medium">Información Comercial</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="valor_mercancia">Valor de la Mercancía *</Label>
                <Input 
                  id="valor_mercancia"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('valor_mercancia', { valueAsNumber: true })}
                  placeholder="0.00" 
                />
                {errors.valor_mercancia && (
                  <p className="text-sm text-red-600">{errors.valor_mercancia.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="moneda">Moneda</Label>
                <Input 
                  id="moneda"
                  {...register('moneda')}
                  placeholder="MXN" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fraccion_arancelaria">Fracción Arancelaria</Label>
              <Input 
                id="fraccion_arancelaria"
                {...register('fraccion_arancelaria')}
                placeholder="Ej: 8704.10.01" 
              />
            </div>
          </div>

          <Separator />

          {/* Dimensiones */}
          <div className="space-y-4">
            <h4 className="font-medium">Dimensiones (metros)</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dimension_largo">Largo (m)</Label>
                <Input 
                  id="dimension_largo"
                  type="number"
                  step="0.01"
                  min="0"
                  value={dimensiones.largo || ''}
                  onChange={(e) => handleDimensionChange('largo', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dimension_ancho">Ancho (m)</Label>
                <Input 
                  id="dimension_ancho"
                  type="number"
                  step="0.01"
                  min="0"
                  value={dimensiones.ancho || ''}
                  onChange={(e) => handleDimensionChange('ancho', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dimension_alto">Alto (m)</Label>
                <Input 
                  id="dimension_alto"
                  type="number"
                  step="0.01"
                  min="0"
                  value={dimensiones.alto || ''}
                  onChange={(e) => handleDimensionChange('alto', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Características Especiales */}
          <div className="space-y-4">
            <h4 className="font-medium">Características Especiales</h4>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="material_peligroso"
                  checked={materialPeligroso}
                  onCheckedChange={(checked) => setValue('material_peligroso', checked as boolean)}
                />
                <Label htmlFor="material_peligroso" className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  Material Peligroso
                </Label>
              </div>

              {materialPeligroso && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="cve_material_peligroso">Clave Material Peligroso</Label>
                  <Input 
                    id="cve_material_peligroso"
                    {...register('cve_material_peligroso')}
                    placeholder="Clave ONU del material peligroso" 
                  />
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="especie_protegida"
                  checked={especieProtegida}
                  onCheckedChange={(checked) => setValue('especie_protegida', checked as boolean)}
                />
                <Label htmlFor="especie_protegida">
                  Especie Protegida por CITES
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion_detallada">Descripción Detallada</Label>
                <Input 
                  id="descripcion_detallada"
                  {...register('descripcion_detallada')}
                  placeholder="Descripción adicional de la mercancía" 
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Guardar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
