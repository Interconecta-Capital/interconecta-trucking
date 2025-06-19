
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Save, X } from 'lucide-react';
import { MercanciaCompleta, PermisoSEMARNAT } from '@/types/cartaPorte';
import { CatalogoSelectorMejorado } from '@/components/catalogos/CatalogoSelectorMejorado';
import { PermisosSEMARNATSection } from './PermisosSEMARNATSection';

interface MercanciaFormV31Props {
  mercancia?: MercanciaCompleta;
  onSave: (data: MercanciaCompleta) => Promise<boolean>;
  onCancel: () => void;
  index: number;
}

export function MercanciaFormV31({ mercancia, onSave, onCancel, index }: MercanciaFormV31Props) {
  const [formData, setFormData] = useState<MercanciaCompleta>({
    id: mercancia?.id || crypto.randomUUID(),
    bienes_transp: mercancia?.bienes_transp || '',
    descripcion: mercancia?.descripcion || '',
    descripcion_detallada: mercancia?.descripcion_detallada || '',
    cantidad: mercancia?.cantidad || 1,
    clave_unidad: mercancia?.clave_unidad || 'H87',
    peso_kg: mercancia?.peso_kg || 0,
    peso_bruto_total: mercancia?.peso_bruto_total || 0,
    peso_neto_total: mercancia?.peso_neto_total || 0,
    unidad_peso_bruto: mercancia?.unidad_peso_bruto || 'KGM',
    valor_mercancia: mercancia?.valor_mercancia || 0,
    moneda: mercancia?.moneda || 'MXN',
    fraccion_arancelaria: mercancia?.fraccion_arancelaria || '',
    uuid_comercio_exterior: mercancia?.uuid_comercio_exterior || '',
    material_peligroso: mercancia?.material_peligroso || false,
    cve_material_peligroso: mercancia?.cve_material_peligroso || '',
    embalaje: mercancia?.embalaje || '',
    numero_piezas: mercancia?.numero_piezas || 1,
    especie_protegida: mercancia?.especie_protegida || false,
    requiere_cites: mercancia?.requiere_cites || false,
    permisos_semarnat: mercancia?.permisos_semarnat || [],
    documentacion_aduanera: mercancia?.documentacion_aduanera || []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof MercanciaCompleta, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-calcular peso bruto total si cambia cantidad o peso unitario
    if (field === 'cantidad' || field === 'peso_kg') {
      const cantidad = field === 'cantidad' ? value : formData.cantidad;
      const pesoUnitario = field === 'peso_kg' ? value : formData.peso_kg;
      const pesoBrutoTotal = cantidad * pesoUnitario;
      
      setFormData(prev => ({
        ...prev,
        peso_bruto_total: pesoBrutoTotal,
        peso_neto_total: pesoBrutoTotal * 0.95 // Estimación
      }));
    }
  };

  const handlePermisosSEMARNATChange = (permisos: PermisoSEMARNAT[]) => {
    setFormData(prev => ({
      ...prev,
      permisos_semarnat: permisos
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const success = await onSave(formData);
      if (success) {
        // El componente padre manejará el cierre del formulario
      }
    } catch (error) {
      console.error('Error saving mercancia:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEspecieProtegida = formData.especie_protegida;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Mercancía #{index + 1}</span>
            {isEspecieProtegida && (
              <Shield className="h-4 w-4 text-green-600" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bienes_transp">Clave Producto/Servicio SAT *</Label>
              <CatalogoSelectorMejorado
                tipo="productos_servicios_cp"
                value={formData.bienes_transp}
                onValueChange={(value) => handleInputChange('bienes_transp', value)}
                placeholder="Selecciona producto..."
                required
              />
            </div>

            <div>
              <Label htmlFor="clave_unidad">Unidad de Medida *</Label>
              <CatalogoSelectorMejorado
                tipo="unidades_medida"
                value={formData.clave_unidad}
                onValueChange={(value) => handleInputChange('clave_unidad', value)}
                placeholder="Selecciona unidad..."
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción Básica *</Label>
            <Input
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Descripción general del bien"
              required
            />
          </div>

          {/* Cantidades y Pesos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="cantidad">Cantidad *</Label>
              <Input
                id="cantidad"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.cantidad}
                onChange={(e) => handleInputChange('cantidad', parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div>
              <Label htmlFor="peso_kg">Peso Unitario (kg) *</Label>
              <Input
                id="peso_kg"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.peso_kg}
                onChange={(e) => handleInputChange('peso_kg', parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div>
              <Label htmlFor="peso_bruto_total">Peso Bruto Total (kg) *</Label>
              <Input
                id="peso_bruto_total"
                type="number"
                min="0.01"
                step="0.01"
                value={formData.peso_bruto_total}
                onChange={(e) => handleInputChange('peso_bruto_total', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          {/* Valor Comercial */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="valor_mercancia">Valor Mercancía</Label>
              <Input
                id="valor_mercancia"
                type="number"
                min="0"
                step="0.01"
                value={formData.valor_mercancia}
                onChange={(e) => handleInputChange('valor_mercancia', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="moneda">Moneda</Label>
              <Select
                value={formData.moneda}
                onValueChange={(value) => handleInputChange('moneda', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                  <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Especies Protegidas */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="especie_protegida"
                checked={formData.especie_protegida}
                onCheckedChange={(checked) => handleInputChange('especie_protegida', checked)}
              />
              <Label htmlFor="especie_protegida" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Especie Protegida (Fauna Silvestre)</span>
              </Label>
            </div>

            {isEspecieProtegida && (
              <>
                <Alert className="border-green-200 bg-green-50">
                  <Shield className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Fauna Silvestre:</strong> Esta mercancía requiere descripción detallada y permisos SEMARNAT vigentes.
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="descripcion_detallada">Descripción Detallada * (mín. 50 caracteres)</Label>
                  <Textarea
                    id="descripcion_detallada"
                    value={formData.descripcion_detallada}
                    onChange={(e) => handleInputChange('descripcion_detallada', e.target.value)}
                    placeholder="Ej: Jaguar (Panthera onca), Macho, 5 años, microchip 985100012345678, amparado por Autorización SEMARNAT..."
                    minLength={50}
                    required={isEspecieProtegida}
                    className="min-h-[100px]"
                  />
                  <div className="text-sm text-muted-foreground mt-1">
                    {formData.descripcion_detallada?.length || 0}/50 caracteres mínimos
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="requiere_cites"
                    checked={formData.requiere_cites}
                    onCheckedChange={(checked) => handleInputChange('requiere_cites', checked)}
                  />
                  <Label htmlFor="requiere_cites">Requiere Permiso CITES</Label>
                </div>

                <PermisosSEMARNATSection
                  permisos={formData.permisos_semarnat || []}
                  onChange={handlePermisosSEMARNATChange}
                  required={isEspecieProtegida}
                />
              </>
            )}
          </div>

          {/* Material Peligroso */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="material_peligroso"
                checked={formData.material_peligroso}
                onCheckedChange={(checked) => handleInputChange('material_peligroso', checked)}
              />
              <Label htmlFor="material_peligroso">Material Peligroso</Label>
            </div>

            {formData.material_peligroso && (
              <div>
                <Label htmlFor="cve_material_peligroso">Clave Material Peligroso *</Label>
                <CatalogoSelectorMejorado
                  tipo="materiales_peligrosos"
                  value={formData.cve_material_peligroso}
                  onValueChange={(value) => handleInputChange('cve_material_peligroso', value)}
                  placeholder="Selecciona material peligroso..."
                  required={formData.material_peligroso}
                />
              </div>
            )}
          </div>

          {/* Comercio Exterior */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fraccion_arancelaria">Fracción Arancelaria</Label>
              <Input
                id="fraccion_arancelaria"
                value={formData.fraccion_arancelaria}
                onChange={(e) => handleInputChange('fraccion_arancelaria', e.target.value)}
                placeholder="8 dígitos"
                maxLength={8}
              />
            </div>

            <div>
              <Label htmlFor="uuid_comercio_exterior">UUID Comercio Exterior</Label>
              <Input
                id="uuid_comercio_exterior"
                value={formData.uuid_comercio_exterior}
                onChange={(e) => handleInputChange('uuid_comercio_exterior', e.target.value)}
                placeholder="UUID del complemento de comercio exterior"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Guardando...' : 'Guardar Mercancía'}
        </Button>
      </div>
    </form>
  );
}
