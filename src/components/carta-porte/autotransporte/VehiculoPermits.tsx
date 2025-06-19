
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CatalogoSelectorMejorado } from '@/components/catalogos/CatalogoSelectorMejorado';
import { AutotransporteCompleto } from '@/types/cartaPorte';
import { CatalogosSATService } from '@/services/catalogosSAT';

interface VehiculoPermitsProps {
  data: AutotransporteCompleto;
  onFieldChange: <K extends keyof AutotransporteCompleto>(
    field: K, 
    value: AutotransporteCompleto[K]
  ) => void;
}

export function VehiculoPermits({ data, onFieldChange }: VehiculoPermitsProps) {
  const [permisoError, setPermisoError] = useState('');

  useEffect(() => {
    const validar = async () => {
      if (!data.perm_sct) {
        setPermisoError('El tipo de permiso es requerido');
        return;
      }
      const existe = await CatalogosSATService.existeTipoPermiso(data.perm_sct);
      setPermisoError(existe ? '' : 'Permiso no válido');
    };
    validar();
  }, [data.perm_sct]);

  const handlePermisosAdicionalesChange = (value: string) => {
    const permisos = value.split(',').map(p => p.trim()).filter(p => p);
    onFieldChange('numero_permisos_adicionales', permisos);
  };

  const getPermisosAdicionalesValue = (): string => {
    if (!data.numero_permisos_adicionales) return '';
    if (Array.isArray(data.numero_permisos_adicionales)) {
      return data.numero_permisos_adicionales.join(', ');
    }
    return String(data.numero_permisos_adicionales);
  };

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
          error={permisoError}
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
            value={getPermisosAdicionalesValue()}
            onChange={(e) => handlePermisosAdicionalesChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
