
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Package } from 'lucide-react';
import { CatalogoSelectorMejorado } from '@/components/catalogos/CatalogoSelectorMejorado';

interface MercanciaMaterialPeligrosoProps {
  formData: any;
  errors: Record<string, string>;
  onFieldChange: (field: string, value: any) => void;
}

export function MercanciaMaterialPeligroso({ formData, errors, onFieldChange }: MercanciaMaterialPeligrosoProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-orange-500" />
        Material Peligroso y Embalaje
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CatalogoSelectorMejorado
          tipo="embalajes"
          label="Tipo de Embalaje"
          value={formData.embalaje}
          onValueChange={(value) => onFieldChange('embalaje', value)}
          placeholder="Seleccionar tipo de embalaje..."
          allowSearch={true}
          showAllOptions={false}
          showRefresh={true}
        />

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="material_peligroso"
              checked={formData.material_peligroso}
              onCheckedChange={(checked) => onFieldChange('material_peligroso', checked)}
            />
            <Label htmlFor="material_peligroso" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Esta mercancía es material peligroso
            </Label>
          </div>

          {formData.material_peligroso && (
            <CatalogoSelectorMejorado
              tipo="materiales_peligrosos"
              label="Clave de Material Peligroso"
              value={formData.cve_material_peligroso}
              onValueChange={(value) => onFieldChange('cve_material_peligroso', value)}
              placeholder="Buscar material peligroso..."
              required
              error={errors.cve_material_peligroso}
              allowSearch={true}
              showAllOptions={false}
              showRefresh={true}
            />
          )}
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Package className="h-5 w-5 text-orange-600 mt-0.5" />
          <div className="text-sm text-orange-800">
            <p className="font-medium">Información sobre Embalaje:</p>
            <p className="mt-1">
              El tipo de embalaje utilizado para el transporte de la mercancía debe cumplir con las regulaciones SAT.
              Si la mercancía es material peligroso, debe especificar la clave correspondiente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
