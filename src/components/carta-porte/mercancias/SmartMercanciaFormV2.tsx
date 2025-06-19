
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MercanciaCompleta } from '@/types/cartaPorte';
import { IAMercanciaClassifier } from './IAMercanciaClassifier';
import { Save, X, Package, Brain, AlertTriangle } from 'lucide-react';

interface SmartMercanciaFormV2Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mercancia: MercanciaCompleta | null;
  onSave: (mercancia: MercanciaCompleta) => void;
}

export function SmartMercanciaFormV2({
  open,
  onOpenChange,
  mercancia,
  onSave
}: SmartMercanciaFormV2Props) {
  const [formData, setFormData] = useState<MercanciaCompleta>({
    id: '',
    bienes_transp: '',
    descripcion: '',
    cantidad: 1,
    clave_unidad: 'PZA',
    peso_kg: 0,
    valor_mercancia: 0,
    moneda: 'MXN',
    material_peligroso: false
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [useIA, setUseIA] = useState(true);

  React.useEffect(() => {
    if (mercancia) {
      setFormData(mercancia);
    } else {
      const newId = `MERC_${Date.now()}`;
      setFormData({
        id: newId,
        bienes_transp: '',
        descripcion: '',
        cantidad: 1,
        clave_unidad: 'PZA',
        peso_kg: 0,
        valor_mercancia: 0,
        moneda: 'MXN',
        material_peligroso: false
      });
    }
    setErrors([]);
  }, [mercancia, open]);

  const handleInputChange = (field: keyof MercanciaCompleta, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIAClassification = (result: {
    bienes_transp: string;
    descripcion: string;
    clave_unidad: string;
    material_peligroso?: boolean;
    cve_material_peligroso?: string;
    fraccion_arancelaria?: string;
    tipo_embalaje?: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      bienes_transp: result.bienes_transp,
      descripcion: result.descripcion,
      clave_unidad: result.clave_unidad,
      material_peligroso: result.material_peligroso || false,
      cve_material_peligroso: result.cve_material_peligroso,
      fraccion_arancelaria: result.fraccion_arancelaria,
      tipo_embalaje: result.tipo_embalaje
    }));
    
    // Cambiar a la pestaña manual para revisar los datos
    setUseIA(false);
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    if (!formData.bienes_transp?.trim()) {
      newErrors.push('Clave SAT de bienes transportados es obligatoria');
    }

    if (!formData.descripcion?.trim()) {
      newErrors.push('Descripción es obligatoria');
    }

    if (!formData.cantidad || formData.cantidad <= 0) {
      newErrors.push('Cantidad debe ser mayor a 0');
    }

    if (!formData.peso_kg || formData.peso_kg <= 0) {
      newErrors.push('Peso debe ser mayor a 0');
    }

    if (!formData.clave_unidad?.trim()) {
      newErrors.push('Unidad de medida es obligatoria');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {mercancia ? 'Editar Mercancía' : 'Agregar Nueva Mercancía'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-4">
          {/* Errores */}
          {errors.length > 0 && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {errors.map((error, index) => (
                    <li key={index} className="text-red-800">{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Tabs value={useIA ? 'ia' : 'manual'} onValueChange={(value) => setUseIA(value === 'ia')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ia" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Clasificación IA
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Manual
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ia" className="space-y-4">
              <IAMercanciaClassifier
                descripcionInicial={formData.descripcion}
                onClassificationResult={handleIAClassification}
              />
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              {/* Información básica */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bienes_transp">Clave SAT Bienes Transportados *</Label>
                  <Input
                    id="bienes_transp"
                    value={formData.bienes_transp}
                    onChange={(e) => handleInputChange('bienes_transp', e.target.value)}
                    placeholder="78101800"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clave_unidad">Unidad de Medida *</Label>
                  <Input
                    id="clave_unidad"
                    value={formData.clave_unidad}
                    onChange={(e) => handleInputChange('clave_unidad', e.target.value)}
                    placeholder="PZA, KGM, LTR..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange('descripcion', e.target.value)}
                  placeholder="Descripción detallada de la mercancía"
                  rows={3}
                />
              </div>

              {/* Cantidades */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cantidad">Cantidad *</Label>
                  <Input
                    id="cantidad"
                    type="number"
                    value={formData.cantidad}
                    onChange={(e) => handleInputChange('cantidad', Number(e.target.value))}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="peso_kg">Peso (Kg) *</Label>
                  <Input
                    id="peso_kg"
                    type="number"
                    value={formData.peso_kg}
                    onChange={(e) => handleInputChange('peso_kg', Number(e.target.value))}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="valor_mercancia">Valor</Label>
                  <Input
                    id="valor_mercancia"
                    type="number"
                    value={formData.valor_mercancia}
                    onChange={(e) => handleInputChange('valor_mercancia', Number(e.target.value))}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Material peligroso */}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cve_material_peligroso">Clave Material Peligroso</Label>
                      <Input
                        id="cve_material_peligroso"
                        value={formData.cve_material_peligroso || ''}
                        onChange={(e) => handleInputChange('cve_material_peligroso', e.target.value)}
                        placeholder="1203"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Campos adicionales para v3.1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fraccion_arancelaria">Fracción Arancelaria</Label>
                  <Input
                    id="fraccion_arancelaria"
                    value={formData.fraccion_arancelaria || ''}
                    onChange={(e) => handleInputChange('fraccion_arancelaria', e.target.value)}
                    placeholder="27101211"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo_embalaje">Tipo de Embalaje</Label>
                  <Input
                    id="tipo_embalaje"
                    value={formData.tipo_embalaje || ''}
                    onChange={(e) => handleInputChange('tipo_embalaje', e.target.value)}
                    placeholder="Caja, Palet, Tanque..."
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Guardar Mercancía
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
