
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CatalogoSelectorMejorado } from '@/components/catalogos/CatalogoSelectorMejorado';
import { AlertTriangle, Package } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
        Material Peligroso y Embalaje
      </h3>
      
      {/* Tipo de Embalaje - Siempre visible */}
      <div className="space-y-2">
        <CatalogoSelectorMejorado
          tipo="embalajes"
          label="Tipo de Embalaje"
          value={formData.embalaje}
          onValueChange={(value) => onFieldChange('embalaje', value)}
          placeholder="Buscar tipo de embalaje..."
          allowSearch={true}
          showRefresh={true}
        />
        <p className="text-xs text-gray-500">
          Tipo de embalaje utilizado para el transporte de la mercancía
        </p>
      </div>

      {/* Material Peligroso */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="material_peligroso"
          checked={formData.material_peligroso}
          onCheckedChange={(checked) => {
            onFieldChange('material_peligroso', !!checked);
            // Limpiar campos relacionados si se desmarca
            if (!checked) {
              onFieldChange('cve_material_peligroso', '');
            }
          }}
        />
        <Label htmlFor="material_peligroso" className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Esta mercancía es material peligroso
        </Label>
      </div>

      {formData.material_peligroso && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Material Peligroso:</strong> Se requiere información adicional según la normativa de transporte de materiales peligrosos.
          </AlertDescription>
        </Alert>
      )}

      {formData.material_peligroso && (
        <div className="grid grid-cols-1 gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <CatalogoSelectorMejorado
            tipo="materiales_peligrosos"
            label="Clave de Material Peligroso *"
            value={formData.cve_material_peligroso}
            onValueChange={(value) => onFieldChange('cve_material_peligroso', value)}
            placeholder="Buscar material peligroso..."
            required={formData.material_peligroso}
            error={errors.cve_material_peligroso}
            allowSearch={true}
            showRefresh={true}
          />

          <div className="bg-white p-3 rounded border border-amber-200">
            <h4 className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Requisitos Adicionales
            </h4>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• El embalaje debe ser compatible con el material peligroso</li>
              <li>• Se requiere documentación especial de transporte</li>
              <li>• Verificar restricciones de rutas y horarios</li>
              <li>• El conductor debe tener capacitación específica</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
