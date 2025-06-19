
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import { AutotransporteCompleto } from '@/types/autotransporte';

interface VehiculoPermitsProps {
  data: {
    numero_permisos_adicionales?: string | string[];
    vigencia_permiso?: string;
  };
  onChange?: (field: string, value: any) => void;
  onFieldChange?: <K extends keyof AutotransporteCompleto>(field: K, value: AutotransporteCompleto[K]) => void;
}

export function VehiculoPermits({ data, onChange, onFieldChange }: VehiculoPermitsProps) {
  const handleChange = (field: string, value: any) => {
    if (onFieldChange) {
      onFieldChange(field as keyof AutotransporteCompleto, value);
    } else if (onChange) {
      onChange(field, value);
    }
  };
  
  const permisos = Array.isArray(data.numero_permisos_adicionales) 
    ? data.numero_permisos_adicionales 
    : data.numero_permisos_adicionales 
      ? [data.numero_permisos_adicionales] 
      : [];

  const agregarPermiso = () => {
    const nuevosPermisos = [...permisos, ''];
    handleChange('numero_permisos_adicionales', nuevosPermisos);
  };

  const actualizarPermiso = (index: number, valor: string) => {
    const nuevosPermisos = [...permisos];
    nuevosPermisos[index] = valor;
    handleChange('numero_permisos_adicionales', nuevosPermisos);
  };

  const eliminarPermiso = (index: number) => {
    const nuevosPermisos = permisos.filter((_, i) => i !== index);
    handleChange('numero_permisos_adicionales', nuevosPermisos.length === 0 ? undefined : nuevosPermisos);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Permisos Adicionales</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Vigencia del Permiso</Label>
            <Input
              type="date"
              value={data.vigencia_permiso || ''}
              onChange={(e) => handleChange('vigencia_permiso', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Números de Permisos Adicionales</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={agregarPermiso}
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          </div>

          {permisos.map((permiso, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                value={permiso}
                onChange={(e) => actualizarPermiso(index, e.target.value)}
                placeholder="Número de permiso"
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => eliminarPermiso(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          {permisos.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {permisos.filter(p => p.trim()).map((permiso, index) => (
                <Badge key={index} variant="secondary">
                  {permiso}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
