
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle } from 'lucide-react';

interface MercanciaMaterialPeligrosoProps {
  formData: {
    material_peligroso: boolean;
    cve_material_peligroso: string;
    embalaje: string;
  };
  errors: Record<string, string>;
  onFieldChange: (field: string, value: any) => void;
}

export function MercanciaMaterialPeligroso({ formData, errors, onFieldChange }: MercanciaMaterialPeligrosoProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="material_peligroso"
          checked={formData.material_peligroso}
          onCheckedChange={(checked) => onFieldChange('material_peligroso', checked)}
        />
        <Label htmlFor="material_peligroso" className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-orange-500" />
          Es Material Peligroso
        </Label>
      </div>

      {formData.material_peligroso && (
        <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-4">
          <div>
            <Label htmlFor="cve_material_peligroso">Clave Material Peligroso *</Label>
            <Input
              id="cve_material_peligroso"
              value={formData.cve_material_peligroso}
              onChange={(e) => onFieldChange('cve_material_peligroso', e.target.value)}
              placeholder="Ej: 1203"
              className={errors.cve_material_peligroso ? 'border-red-500' : ''}
            />
            {errors.cve_material_peligroso && (
              <p className="text-sm text-red-500 mt-1">{errors.cve_material_peligroso}</p>
            )}
          </div>

          <div>
            <Label htmlFor="embalaje">Tipo de Embalaje</Label>
            <Input
              id="embalaje"
              value={formData.embalaje}
              onChange={(e) => onFieldChange('embalaje', e.target.value)}
              placeholder="Ej: Tambor metálico"
            />
          </div>
        </div>
      )}
    </div>
  );
}
