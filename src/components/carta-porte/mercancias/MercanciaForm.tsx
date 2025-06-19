
import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { useCatalogosHibrido } from '@/hooks/useCatalogosHibrido';
import { Mercancia } from '@/hooks/useMercancias';
import { MercanciaBasicFields } from './components/MercanciaBasicFields';
import { MercanciaQuantityFields } from './components/MercanciaQuantityFields';
import { MercanciaDangerousFields } from './components/MercanciaDangerousFields';
import { MercanciaCommercialFields } from './components/MercanciaCommercialFields';
import { MercanciaFormActions } from './components/MercanciaFormActions';

interface MercanciaFormProps {
  index: number;
  onRemove?: () => void;
  mercancia?: Mercancia;
  onSave?: (mercancia: Mercancia) => Promise<boolean> | boolean;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function MercanciaForm({ index, onRemove, mercancia, onSave, onCancel, isLoading }: MercanciaFormProps) {
  const form = useForm<Mercancia>({
    defaultValues: mercancia || {
      bienes_transp: '',
      descripcion: '',
      cantidad: 0,
      clave_unidad: '',
      peso_kg: 0,
      valor_mercancia: 0,
      material_peligroso: false,
      cve_material_peligroso: '',
      moneda: 'MXN',
      embalaje: '',
      fraccion_arancelaria: '',
      uuid_comercio_ext: '',
      descripcion_detallada: '',
      numero_piezas: undefined,
      tipo_embalaje: '',
      regimen_aduanero: '',
      codigo_producto: ''
    }
  });
  
  const materialPeligroso = form.watch('material_peligroso') || false;

  // Search states for catalogs
  const [productosSearch, setProductosSearch] = useState('');
  const [unidadesSearch, setUnidadesSearch] = useState('');
  const [embalajesSearch, setEmbalajesSearch] = useState('');
  const [materialesSearch, setMaterialesSearch] = useState('');

  // Catalog queries
  const productosQuery = useCatalogosHibrido('productos', productosSearch);
  const unidadesQuery = useCatalogosHibrido('unidades', unidadesSearch);
  const embalajesQuery = useCatalogosHibrido('embalajes', embalajesSearch);
  const materialesQuery = useCatalogosHibrido('materiales_peligrosos', materialesSearch);

  const handleAISuggestion = (suggestion: any) => {
    if (suggestion.data) {
      // Apply AI suggestion to form with proper type checking
      Object.entries(suggestion.data).forEach(([key, value]) => {
        if (key === 'bienes_transp' || key === 'clave_unidad' || key === 'descripcion' || key === 'embalaje') {
          form.setValue(key as keyof Mercancia, String(value));
        } else if (key === 'cantidad' || key === 'peso_kg' || key === 'valor_mercancia') {
          form.setValue(key as keyof Mercancia, Number(value) || 0);
        } else if (key === 'material_peligroso') {
          form.setValue(key as keyof Mercancia, Boolean(value));
        } else if (key === 'cve_material_peligroso') {
          form.setValue(key as keyof Mercancia, String(value));
        }
      });
    }
  };

  const handleSave = async (data: Mercancia) => {
    if (onSave) {
      const result = await onSave(data);
      if (result && onCancel) {
        onCancel();
      }
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6 p-6 border border-gray-200 rounded-lg bg-white shadow-sm">
        <MercanciaFormActions
          index={index}
          onRemove={onRemove}
          onCancel={onCancel}
          isLoading={isLoading}
          onAISuggestion={handleAISuggestion}
        />

        <MercanciaBasicFields
          control={form.control}
          productosQuery={productosQuery}
          unidadesQuery={unidadesQuery}
          embalajesQuery={embalajesQuery}
          productosSearch={productosSearch}
          unidadesSearch={unidadesSearch}
          embalajesSearch={embalajesSearch}
          setProductosSearch={setProductosSearch}
          setUnidadesSearch={setUnidadesSearch}
          setEmbalajesSearch={setEmbalajesSearch}
        />

        <MercanciaCommercialFields control={form.control} />

        <MercanciaQuantityFields control={form.control} />

        <MercanciaDangerousFields
          control={form.control}
          materialPeligroso={materialPeligroso}
          materialesQuery={materialesQuery}
          materialesSearch={materialesSearch}
          setMaterialesSearch={setMaterialesSearch}
        />
      </form>
    </FormProvider>
  );
}
