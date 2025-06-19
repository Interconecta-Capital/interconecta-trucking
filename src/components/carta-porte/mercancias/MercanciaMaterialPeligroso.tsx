
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CatalogSelect } from '@/components/catalogos/components/CatalogSelect';
import { useCatalogosHibrido } from '@/hooks/useCatalogosHibrido';
import { AlertTriangle } from 'lucide-react';

interface MercanciaMaterialPeligrosoProps {
  formData: any;
  errors: Record<string, string>;
  onFieldChange: (field: string, value: any) => void;
}

export function MercanciaMaterialPeligroso({ formData, errors, onFieldChange }: MercanciaMaterialPeligrosoProps) {
  const [materialesSearch, setMaterialesSearch] = useState('');
  const materialesQuery = useCatalogosHibrido('materiales_peligrosos', materialesSearch);

  console.log('🔍 MaterPelig - Materiales query:', {
    isLoading: materialesQuery.isLoading,
    dataLength: materialesQuery.data?.length || 0,
    error: materialesQuery.error
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-orange-500" />
        Material Peligroso
      </h3>
      
      <div className="flex flex-row items-center justify-between rounded-lg border border-gray-200 p-4 bg-gray-50">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium text-gray-700">Material Peligroso</Label>
          <div className="text-sm text-gray-500">
            ¿Esta mercancía es considerada material peligroso?
          </div>
        </div>
        <Switch
          checked={!!formData.material_peligroso}
          onCheckedChange={(checked) => onFieldChange('material_peligroso', checked)}
        />
      </div>

      {formData.material_peligroso && (
        <div className="space-y-2">
          <Label>Clave Material Peligroso *</Label>
          <CatalogSelect
            value={formData.cve_material_peligroso || ''}
            onValueChange={(value) => {
              console.log('🔄 Material peligroso seleccionado:', value);
              onFieldChange('cve_material_peligroso', value);
              setMaterialesSearch('');
            }}
            disabled={materialesQuery.isLoading}
            showLoading={materialesQuery.isLoading}
            placeholder="Buscar material peligroso..."
            options={materialesQuery.data || []}
            searchTerm={materialesSearch}
            tipo="materiales_peligrosos"
          />
          {errors.cve_material_peligroso && (
            <p className="text-sm text-red-500">{errors.cve_material_peligroso}</p>
          )}
        </div>
      )}
    </div>
  );
}
