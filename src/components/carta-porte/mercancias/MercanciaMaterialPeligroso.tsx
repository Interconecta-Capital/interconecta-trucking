
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CatalogoSelectorMejorado } from '@/components/catalogos/CatalogoSelectorMejorado';
import { AlertTriangle } from 'lucide-react';

interface MercanciaMaterialPeligrosoProps {
  formData: any;
  errors: Record<string, string>;
  onFieldChange: (field: string, value: any) => void;
}

export function MercanciaMaterialPeligroso({ formData, errors, onFieldChange }: MercanciaMaterialPeligrosoProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        Material Peligroso
      </h3>
      
      <div className="flex items-center space-x-2">
        <Checkbox
          id="material_peligroso"
          checked={formData.material_peligroso}
          onCheckedChange={(checked) => onFieldChange('material_peligroso', checked)}
        />
        <Label htmlFor="material_peligroso">
          Esta mercancía es material peligroso
        </Label>
      </div>

      {formData.material_peligroso && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <CatalogoSelectorMejorado
            tipo="materiales_peligrosos"
            label="Clave de Material Peligroso"
            value={formData.cve_material_peligroso}
            onValueChange={(value) => onFieldChange('cve_material_peligroso', value)}
            placeholder="Buscar material peligroso..."
            required={formData.material_peligroso}
            error={errors.cve_material_peligroso}
          />

          <CatalogoSelectorMejorado
            tipo="embalajes"
            label="Tipo de Embalaje"
            value={formData.embalaje}
            onValueChange={(value) => onFieldChange('embalaje', value)}
            placeholder="Seleccionar embalaje..."
            required={formData.material_peligroso}
            error={errors.embalaje}
          />
        </div>
      )}
    </div>
  );
}
