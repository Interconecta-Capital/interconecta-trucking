
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { FileText, Info } from 'lucide-react';
import { CatalogoSelectorMejorado } from '@/components/catalogos/CatalogoSelectorMejorado';

interface VehiculoPermisosSCTFieldsProps {
  formData: any;
  onFieldChange: (field: string, value: any) => void;
}

export function VehiculoPermisosSCTFields({ formData, onFieldChange }: VehiculoPermisosSCTFieldsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Permisos SCT
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <CatalogoSelectorMejorado
              tipo="tipos_permiso"
              label="Tipo de Permiso SCT"
              value={formData.perm_sct || ''}
              onValueChange={(value) => onFieldChange('perm_sct', value)}
              placeholder="Selecciona el tipo de permiso"
              required
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Label htmlFor="num_permiso_sct">Número de Permiso SCT</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Formato: Letras, números y guiones</p>
                    <p className="text-xs text-muted-foreground">Ej: SCT-123456 o TPAF01-2024-001</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="num_permiso_sct"
              value={formData.num_permiso_sct || ''}
              onChange={(e) => onFieldChange('num_permiso_sct', e.target.value.toUpperCase())}
              placeholder="Ej: SCT-123456"
              maxLength={50}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="vigencia_permiso">Vigencia del Permiso</Label>
          <Input
            id="vigencia_permiso"
            type="date"
            value={formData.vigencia_permiso || ''}
            onChange={(e) => onFieldChange('vigencia_permiso', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
