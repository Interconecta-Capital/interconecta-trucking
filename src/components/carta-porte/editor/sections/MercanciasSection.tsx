import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Upload, AlertTriangle } from 'lucide-react';
import { DocumentUploadDialog } from '../../mercancias/DocumentUploadDialog';
import { toast } from 'sonner';

interface MercanciasSectionProps {
  data: any[];
  onChange: (data: any[]) => void;
}

export function MercanciasSection({ data, onChange }: MercanciasSectionProps) {
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  const addMercancia = () => {
    const nuevaMercancia = {
      id: crypto.randomUUID(),
      bienes_transp: '',
      descripcion: '',
      cantidad: 1,
      clave_unidad: 'KGM',
      peso_kg: 0,
      moneda: 'MXN',
      valor_mercancia: 0,
      material_peligroso: false,
      especie_protegida: false,
      fraccion_arancelaria: '',
      regimen_aduanero: ''
    };
    
    onChange([...data, nuevaMercancia]);
  };

  const updateMercancia = (index: number, field: string, value: any) => {
    const updatedData = [...data];
    updatedData[index] = { ...updatedData[index], [field]: value };
    onChange(updatedData);
  };

  const removeMercancia = (index: number) => {
    const updatedData = data.filter((_, i) => i !== index);
    onChange(updatedData);
  };

  const handleDocumentProcessed = (mercancias: any[]) => {
    if (Array.isArray(mercancias) && mercancias.length > 0) {
      const nuevasMercancias = mercancias.map(m => ({
        id: crypto.randomUUID(),
        moneda: 'MXN',
        ...m
      }));
      onChange([...data, ...nuevasMercancias]);
      toast.success(`${nuevasMercancias.length} mercancías cargadas desde el documento`);
    } else {
      toast.info('No se encontraron mercancías en el documento');
    }
    setShowDocumentUpload(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-600">
          Configure las mercancías que serán transportadas.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowDocumentUpload(true)}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Cargar desde Archivo
          </Button>
          <Button onClick={addMercancia} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Agregar Mercancía
          </Button>
        </div>
      </div>

      {data.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No hay mercancías configuradas</p>
            <p className="text-sm text-gray-400 mt-1">
              Agregue al menos una mercancía para transportar
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.map((mercancia, index) => (
            <Card key={mercancia.id || index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    Mercancía {index + 1}
                    {mercancia.material_peligroso && (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    )}
                    {mercancia.especie_protegida && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeMercancia(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`bienes_transp_${index}`}>Clave de Producto/Servicio *</Label>
                    <Input
                      id={`bienes_transp_${index}`}
                      value={mercancia.bienes_transp || ''}
                      onChange={(e) => updateMercancia(index, 'bienes_transp', e.target.value)}
                      placeholder="Ej: 78101500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`fraccion_arancelaria_${index}`}>Fracción Arancelaria</Label>
                    <Input
                      id={`fraccion_arancelaria_${index}`}
                      value={mercancia.fraccion_arancelaria || ''}
                      onChange={(e) => updateMercancia(index, 'fraccion_arancelaria', e.target.value)}
                      placeholder="8 dígitos"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`descripcion_${index}`}>Descripción *</Label>
                  <Textarea
                    id={`descripcion_${index}`}
                    value={mercancia.descripcion || ''}
                    onChange={(e) => updateMercancia(index, 'descripcion', e.target.value)}
                    placeholder="Descripción detallada de la mercancía"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`cantidad_${index}`}>Cantidad *</Label>
                    <Input
                      id={`cantidad_${index}`}
                      type="number"
                      value={mercancia.cantidad || 0}
                      onChange={(e) => updateMercancia(index, 'cantidad', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`clave_unidad_${index}`}>Unidad</Label>
                    <Select
                      value={mercancia.clave_unidad || 'KGM'}
                      onValueChange={(value) => updateMercancia(index, 'clave_unidad', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="KGM">Kilogramo</SelectItem>
                        <SelectItem value="LTR">Litro</SelectItem>
                        <SelectItem value="PZA">Pieza</SelectItem>
                        <SelectItem value="TON">Tonelada</SelectItem>
                        <SelectItem value="M3">Metro cúbico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`peso_kg_${index}`}>Peso (Kg) *</Label>
                    <Input
                      id={`peso_kg_${index}`}
                      type="number"
                      value={mercancia.peso_kg || 0}
                      onChange={(e) => updateMercancia(index, 'peso_kg', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`valor_mercancia_${index}`}>Valor</Label>
                    <Input
                      id={`valor_mercancia_${index}`}
                      type="number"
                      value={mercancia.valor_mercancia || 0}
                      onChange={(e) => updateMercancia(index, 'valor_mercancia', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`moneda_${index}`}>Moneda</Label>
                    <Select
                      value={mercancia.moneda || 'MXN'}
                      onValueChange={(value) => updateMercancia(index, 'moneda', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MXN">Peso Mexicano</SelectItem>
                        <SelectItem value="USD">Dólar Americano</SelectItem>
                        <SelectItem value="EUR">Euro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`regimen_aduanero_${index}`}>Régimen Aduanero</Label>
                    <Input
                      id={`regimen_aduanero_${index}`}
                      value={mercancia.regimen_aduanero || ''}
                      onChange={(e) => updateMercancia(index, 'regimen_aduanero', e.target.value)}
                      placeholder="Ej: A1"
                    />
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`material_peligroso_${index}`}
                      checked={!!mercancia.material_peligroso}
                      onCheckedChange={(checked) => updateMercancia(index, 'material_peligroso', checked)}
                    />
                    <Label htmlFor={`material_peligroso_${index}`}>
                      Material Peligroso
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`especie_protegida_${index}`}
                      checked={!!mercancia.especie_protegida}
                      onCheckedChange={(checked) => updateMercancia(index, 'especie_protegida', checked)}
                    />
                    <Label htmlFor={`especie_protegida_${index}`}>
                      Especie Protegida
                    </Label>
                  </div>
                </div>

                {mercancia.material_peligroso && (
                  <div className="space-y-2">
                    <Label htmlFor={`cve_material_peligroso_${index}`}>Clave Material Peligroso</Label>
                    <Input
                      id={`cve_material_peligroso_${index}`}
                      value={mercancia.cve_material_peligroso || ''}
                      onChange={(e) => updateMercancia(index, 'cve_material_peligroso', e.target.value)}
                      placeholder="Clave del material peligroso"
                    />
                  </div>
                )}

                {mercancia.especie_protegida && (
                  <div className="space-y-2">
                    <Label htmlFor={`descripcion_detallada_${index}`}>Descripción Detallada (Especie Protegida)</Label>
                    <Textarea
                      id={`descripcion_detallada_${index}`}
                      value={mercancia.descripcion_detallada || ''}
                      onChange={(e) => updateMercancia(index, 'descripcion_detallada', e.target.value)}
                      placeholder="Descripción detallada requerida para especies protegidas (mínimo 50 caracteres)"
                      rows={3}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DocumentUploadDialog
        open={showDocumentUpload}
        onOpenChange={setShowDocumentUpload}
        onDocumentProcessed={handleDocumentProcessed}
      />
    </div>
  );
}
