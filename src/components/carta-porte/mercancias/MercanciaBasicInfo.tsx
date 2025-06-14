
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBuscarProductosServicios } from '@/hooks/useCatalogos';

interface MercanciaBasicInfoProps {
  formData: {
    descripcion: string;
    bienes_transp: string;
  };
  errors: Record<string, string>;
  onFieldChange: (field: string, value: any) => void;
}

export function MercanciaBasicInfo({ formData, errors, onFieldChange }: MercanciaBasicInfoProps) {
  const { data: clavesProdServ = [], isLoading: loadingProdServ } = useBuscarProductosServicios('');

  if (loadingProdServ) {
    return <div className="animate-pulse h-32 bg-gray-200 rounded"></div>;
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
        Información Básica
      </h4>
      
      <div>
        <Label htmlFor="descripcion">Descripción de la Mercancía *</Label>
        <Textarea
          id="descripcion"
          value={formData.descripcion}
          onChange={(e) => onFieldChange('descripcion', e.target.value)}
          placeholder="Describe detalladamente la mercancía a transportar"
          className={errors.descripcion ? 'border-red-500' : ''}
          rows={3}
        />
        {errors.descripcion && <p className="text-sm text-red-500 mt-1">{errors.descripcion}</p>}
      </div>

      <div>
        <Label htmlFor="bienes_transp">Clave Producto/Servicio SAT *</Label>
        <Select value={formData.bienes_transp} onValueChange={(value) => onFieldChange('bienes_transp', value)}>
          <SelectTrigger className={errors.bienes_transp ? 'border-red-500' : ''}>
            <SelectValue placeholder="Selecciona la clave SAT" />
          </SelectTrigger>
          <SelectContent>
            {clavesProdServ.map((clave) => (
              <SelectItem key={clave.value} value={clave.value}>
                {clave.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.bienes_transp && <p className="text-sm text-red-500 mt-1">{errors.bienes_transp}</p>}
      </div>
    </div>
  );
}
