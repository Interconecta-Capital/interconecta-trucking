
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import { MercanciaBasicInfo } from './MercanciaBasicInfo';
import { MercanciaCantidades } from './MercanciaCantidades';
import { MercanciaMaterialPeligroso } from './MercanciaMaterialPeligroso';
import { MercanciaComercial } from './MercanciaComercial';
import { CatalogosSATService } from '@/services/catalogosSAT';

interface MercanciaFormOptimizadaProps {
  mercancia?: any;
  onSave: (mercancia: any) => Promise<boolean>;
  onCancel: () => void;
  index: number;
}

export function MercanciaFormOptimizada({ 
  mercancia, 
  onSave, 
  onCancel,
  index 
}: MercanciaFormOptimizadaProps) {
  const [formData, setFormData] = React.useState({
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
    uuid_comercio_ext: mercancia?.uuid_comercio_ext || '',
    codigo_producto: mercancia?.codigo_producto || ''
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    const validar = async () => {
      if (formData.bienes_transp) {
        const ok = await CatalogosSATService.existeProductoServicio(formData.bienes_transp);
        setErrors(prev => ({ ...prev, bienes_transp: ok ? '' : 'Clave no válida' }));
      }
    };
    validar();
  }, [formData.bienes_transp]);

  useEffect(() => {
    const validar = async () => {
      if (formData.clave_unidad) {
        const ok = await CatalogosSATService.existeUnidad(formData.clave_unidad);
        setErrors(prev => ({ ...prev, clave_unidad: ok ? '' : 'Unidad no válida' }));
      }
    };
    validar();
  }, [formData.clave_unidad]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.descripcion?.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (!formData.bienes_transp?.trim()) {
      newErrors.bienes_transp = 'La clave de producto/servicio es requerida';
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

    if (!formData.valor_mercancia || formData.valor_mercancia <= 0) {
      newErrors.valor_mercancia = 'El valor debe ser mayor a 0';
    }

    if (formData.material_peligroso && !formData.cve_material_peligroso?.trim()) {
      newErrors.cve_material_peligroso = 'La clave de material peligroso es requerida';
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {mercancia ? `Editar Mercancía #${index + 1}` : `Nueva Mercancía #${index + 1}`}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <MercanciaBasicInfo 
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
          />

          <MercanciaCantidades 
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
          />

          <MercanciaMaterialPeligroso 
            formData={formData}
            errors={errors}
            onFieldChange={handleFieldChange}
          />

          <MercanciaComercial 
            formData={formData}
            onFieldChange={handleFieldChange}
          />

          <div className="flex justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? 'Guardando...' : (mercancia ? 'Actualizar' : 'Agregar')} Mercancía
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
