
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CatalogoSelectorMejorado } from '@/components/catalogos/CatalogoSelectorMejorado';
import { MercanciaCompleta } from '@/types/cartaPorte';
import { PermisosSEMARNATSection } from './PermisosSEMARNATSection';

interface MercanciaFormV31Props {
  mercancia?: MercanciaCompleta;
  onSave: (mercancia: MercanciaCompleta) => Promise<boolean>;
  onCancel: () => void;
  index: number;
}

export function MercanciaFormV31({ mercancia, onSave, onCancel, index }: MercanciaFormV31Props) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentMercancia, setCurrentMercancia] = useState<MercanciaCompleta>(
    mercancia || {
      id: crypto.randomUUID(),
      descripcion: '',
      bienes_transp: '',
      cantidad: 1,
      clave_unidad: 'KGM',
      peso_kg: 0,
      peso_bruto_total: 0,
      unidad_peso_bruto: 'KGM',
      valor_mercancia: 0,
      moneda: 'MXN',
      material_peligroso: false,
      especie_protegida: false,
      uuid_comercio_exterior: '',
      fraccion_arancelaria: '',
      cve_material_peligroso: '',
      tipo_embalaje: '',
      descripcion_detallada: '',
      permisos_semarnat: []
    }
  );

  const handleFieldChange = (field: keyof MercanciaCompleta, value: any) => {
    setCurrentMercancia(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    await onSave(currentMercancia);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información Básica de la Mercancía v3.1</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Descripción básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Descripción *</Label>
              <Input
                value={currentMercancia.descripcion || ''}
                onChange={(e) => handleFieldChange('descripcion', e.target.value)}
                placeholder="Descripción general"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Bienes a Transportar *</Label>
              <Input
                value={currentMercancia.bienes_transp || ''}
                onChange={(e) => handleFieldChange('bienes_transp', e.target.value)}
                placeholder="Código de bienes a transportar"
                required
              />
            </div>
          </div>

          {/* Cantidad y unidades */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Cantidad *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={currentMercancia.cantidad || ''}
                onChange={(e) => handleFieldChange('cantidad', parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Clave Unidad *</Label>
              <CatalogoSelectorMejorado
                tipo="unidades"
                value={currentMercancia.clave_unidad || ''}
                onValueChange={(value) => handleFieldChange('clave_unidad', value)}
                placeholder="Selecciona unidad..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Peso (kg) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={currentMercancia.peso_kg || ''}
                onChange={(e) => handleFieldChange('peso_kg', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          {/* Pesos totales v3.1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Peso Bruto Total</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={currentMercancia.peso_bruto_total || ''}
                onChange={(e) => handleFieldChange('peso_bruto_total', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label>Peso Neto Total</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={currentMercancia.peso_neto_total || ''}
                onChange={(e) => handleFieldChange('peso_neto_total', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label>Unidad Peso Bruto</Label>
              <Input
                value={currentMercancia.unidad_peso_bruto || 'KGM'}
                onChange={(e) => handleFieldChange('unidad_peso_bruto', e.target.value)}
                placeholder="KGM"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información Comercial */}
      <Card>
        <CardHeader>
          <CardTitle>Información Comercial</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Valor Mercancía</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={currentMercancia.valor_mercancia || ''}
                onChange={(e) => handleFieldChange('valor_mercancia', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label>Moneda</Label>
              <Input
                value={currentMercancia.moneda || 'MXN'}
                onChange={(e) => handleFieldChange('moneda', e.target.value)}
                placeholder="MXN"
              />
            </div>

            <div className="space-y-2">
              <Label>UUID Comercio Exterior</Label>
              <Input
                value={currentMercancia.uuid_comercio_exterior || ''}
                onChange={(e) => handleFieldChange('uuid_comercio_exterior', e.target.value)}
                placeholder="UUID del complemento"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Fracción Arancelaria (Opcional en v3.1)</Label>
            <Input
              value={currentMercancia.fraccion_arancelaria || ''}
              onChange={(e) => handleFieldChange('fraccion_arancelaria', e.target.value)}
              placeholder="Ej: 01234567"
            />
          </div>
        </CardContent>
      </Card>

      {/* Material Peligroso */}
      <Card>
        <CardHeader>
          <CardTitle>Material Peligroso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={currentMercancia.material_peligroso || false}
              onCheckedChange={(checked) => handleFieldChange('material_peligroso', checked)}
            />
            <Label>¿Es material peligroso?</Label>
          </div>

          {currentMercancia.material_peligroso && (
            <div className="space-y-2">
              <Label>Clave Material Peligroso</Label>
              <CatalogoSelectorMejorado
                tipo="materiales_peligrosos"
                value={currentMercancia.cve_material_peligroso || ''}
                onValueChange={(value) => handleFieldChange('cve_material_peligroso', value)}
                placeholder="Selecciona material peligroso..."
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fauna Silvestre v3.1 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Fauna Silvestre v3.1</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              checked={currentMercancia.especie_protegida || false}
              onCheckedChange={(checked) => handleFieldChange('especie_protegida', checked)}
            />
            <Label>¿Es especie protegida?</Label>
          </div>

          {currentMercancia.especie_protegida && (
            <>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  **v3.1**: Para especies protegidas se requiere descripción detallada y permisos SEMARNAT válidos.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Descripción Detallada *</Label>
                <Textarea
                  value={currentMercancia.descripcion_detallada || ''}
                  onChange={(e) => handleFieldChange('descripcion_detallada', e.target.value)}
                  placeholder="Descripción específica de la especie, características, etc."
                  rows={3}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={currentMercancia.requiere_cites || false}
                  onCheckedChange={(checked) => handleFieldChange('requiere_cites', checked)}
                />
                <Label>Requiere permiso CITES</Label>
              </div>

              <PermisosSEMARNATSection
                permisos={currentMercancia.permisos_semarnat || []}
                onChange={(permisos) => handleFieldChange('permisos_semarnat', permisos)}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Embalaje */}
      <Card>
        <CardHeader>
          <CardTitle>Embalaje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo Embalaje</Label>
              <CatalogoSelectorMejorado
                tipo="embalajes"
                value={currentMercancia.tipo_embalaje || ''}
                onValueChange={(value) => handleFieldChange('tipo_embalaje', value)}
                placeholder="Selecciona tipo..."
              />
            </div>

            <div className="space-y-2">
              <Label>Número de Piezas</Label>
              <Input
                type="number"
                min="1"
                value={currentMercancia.numero_piezas || ''}
                onChange={(e) => handleFieldChange('numero_piezas', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          Guardar Mercancía
        </Button>
      </div>
    </div>
  );
}
