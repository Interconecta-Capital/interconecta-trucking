
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CatalogoSelectorMejorado } from '@/components/catalogos/CatalogoSelectorMejorado';
import { AutotransporteCompleto } from '@/types/cartaPorte';

interface VehiculoPermitsProps {
  data: AutotransporteCompleto;
  onFieldChange: <K extends keyof AutotransporteCompleto>(
    field: K, 
    value: AutotransporteCompleto[K]
  ) => void;
}

export function VehiculoPermits({ data, onFieldChange }: VehiculoPermitsProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CatalogoSelectorMejorado
          tipo="tipos_permiso"
          label="Tipo de Permiso SCT"
          value={data.perm_sct || ''}
          onValueChange={(value) => onFieldChange('perm_sct', value)}
          placeholder="Buscar tipo de permiso..."
          required
        />

        <div className="space-y-2">
          <Label htmlFor="num_permiso_sct">Número de Permiso SCT *</Label>
          <Input 
            id="num_permiso_sct"
            placeholder="Número de permiso" 
            value={data.num_permiso_sct || ''}
            onChange={(e) => onFieldChange('num_permiso_sct', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vigencia_permiso">Vigencia del Permiso</Label>
          <Input 
            id="vigencia_permiso"
            type="date"
            value={data.vigencia_permiso || ''}
            onChange={(e) => onFieldChange('vigencia_permiso', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="numero_permisos_adicionales">Permisos Adicionales</Label>
          <Input 
            id="numero_permisos_adicionales"
            placeholder="Separados por comas" 
            value={data.numero_permisos_adicionales?.join(', ') || ''}
            onChange={(e) => {
              const permisos = e.target.value.split(',').map(p => p.trim()).filter(p => p);
              onFieldChange('numero_permisos_adicionales', permisos);
            }}
          />
        </div>
      </div>
    </div>
  );
}
