
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Package, AlertTriangle, DollarSign } from 'lucide-react';
import { useCatalogos } from '@/hooks/useCatalogos';

interface MercanciaFormOptimizadaProps {
  mercancia?: any;
  onSave: (mercancia: any) => Promise<boolean>;
  onCancel: () => void;
  index: number;
}

export function MercanciaFormOptimizada({ 
  mercancia, 
  onSave, 
  onCancel,
  index 
}: MercanciaFormOptimizadaProps) {
  const { clavesUnidad, clavesProdServ, loading } = useCatalogos();
  
  const [formData, setFormData] = React.useState({
    id: mercancia?.id || `mercancia-${Date.now()}`,
    descripcion: mercancia?.descripcion || '',
    bienes_transp: mercancia?.bienes_transp || '',
    clave_unidad: mercancia?.clave_unidad || '',
    cantidad: mercancia?.cantidad || 0,
    peso_kg: mercancia?.peso_kg || 0,
    valor_mercancia: mercancia?.valor_mercancia || 0,
    material_peligroso: mercancia?.material_peligroso || false,
    cve_material_peligroso: mercancia?.cve_material_peligroso || '',
    embalaje: mercancia?.embalaje || '',
    fraccion_arancelaria: mercancia?.fraccion_arancelaria || '',
    moneda: mercancia?.moneda || 'MXN',
    uuid_comercio_ext: mercancia?.uuid_comercio_ext || ''
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = React.useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.descripcion?.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }

    if (!formData.bienes_transp?.trim()) {
      newErrors.bienes_transp = 'La clave de producto/servicio es requerida';
    }

    if (!formData.clave_unidad?.trim()) {
      newErrors.clave_unidad = 'La unidad de medida es requerida';
    }

    if (!formData.cantidad || formData.cantidad <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0';
    }

    if (!formData.peso_kg || formData.peso_kg <= 0) {
      newErrors.peso_kg = 'El peso debe ser mayor a 0';
    }

    if (formData.material_peligroso && !formData.cve_material_peligroso?.trim()) {
      newErrors.cve_material_peligroso = 'La clave de material peligroso es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const success = await onSave(formData);
      if (success) {
        // Form will be closed by parent component
      }
    } catch (error) {
      console.error('Error saving mercancia:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Auto-calculate values based on other fields
  const calcularValorTotal = () => {
    if (formData.cantidad && formData.valor_mercancia) {
      return formData.cantidad * formData.valor_mercancia;
    }
    return 0;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {mercancia ? `Editar Mercancía #${index + 1}` : `Nueva Mercancía #${index + 1}`}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Información Básica
            </h4>
            
            <div>
              <Label htmlFor="descripcion">Descripción de la Mercancía *</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => handleFieldChange('descripcion', e.target.value)}
                placeholder="Describe detalladamente la mercancía a transportar"
                className={errors.descripcion ? 'border-red-500' : ''}
                rows={3}
              />
              {errors.descripcion && <p className="text-sm text-red-500 mt-1">{errors.descripcion}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bienes_transp">Clave Producto/Servicio SAT *</Label>
                <Select value={formData.bienes_transp} onValueChange={(value) => handleFieldChange('bienes_transp', value)}>
                  <SelectTrigger className={errors.bienes_transp ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona la clave SAT" />
                  </SelectTrigger>
                  <SelectContent>
                    {clavesProdServ.map((clave) => (
                      <SelectItem key={clave.clave_prod_serv} value={clave.clave_prod_serv}>
                        {clave.clave_prod_serv} - {clave.descripcion}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bienes_transp && <p className="text-sm text-red-500 mt-1">{errors.bienes_transp}</p>}
              </div>

              <div>
                <Label htmlFor="clave_unidad">Unidad de Medida *</Label>
                <Select value={formData.clave_unidad} onValueChange={(value) => handleFieldChange('clave_unidad', value)}>
                  <SelectTrigger className={errors.clave_unidad ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecciona la unidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {clavesUnidad.map((unidad) => (
                      <SelectItem key={unidad.clave_unidad} value={unidad.clave_unidad}>
                        {unidad.clave_unidad} - {unidad.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.clave_unidad && <p className="text-sm text-red-500 mt-1">{errors.clave_unidad}</p>}
              </div>
            </div>
          </div>

          {/* Cantidades y Medidas */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Cantidades y Medidas
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cantidad">Cantidad *</Label>
                <Input
                  id="cantidad"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.cantidad}
                  onChange={(e) => handleFieldChange('cantidad', parseFloat(e.target.value) || 0)}
                  className={errors.cantidad ? 'border-red-500' : ''}
                />
                {errors.cantidad && <p className="text-sm text-red-500 mt-1">{errors.cantidad}</p>}
              </div>

              <div>
                <Label htmlFor="peso_kg">Peso (kg) *</Label>
                <Input
                  id="peso_kg"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.peso_kg}
                  onChange={(e) => handleFieldChange('peso_kg', parseFloat(e.target.value) || 0)}
                  className={errors.peso_kg ? 'border-red-500' : ''}
                />
                {errors.peso_kg && <p className="text-sm text-red-500 mt-1">{errors.peso_kg}</p>}
              </div>

              <div>
                <Label htmlFor="valor_mercancia" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Valor Unitario
                </Label>
                <Input
                  id="valor_mercancia"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.valor_mercancia}
                  onChange={(e) => handleFieldChange('valor_mercancia', parseFloat(e.target.value) || 0)}
                />
                {calcularValorTotal() > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Valor Total: ${calcularValorTotal().toLocaleString('es-MX', { minimumFractionDigits: 2 })} {formData.moneda}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Material Peligroso */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="material_peligroso"
                checked={formData.material_peligroso}
                onCheckedChange={(checked) => handleFieldChange('material_peligroso', checked)}
              />
              <Label htmlFor="material_peligroso" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Es Material Peligroso
              </Label>
            </div>

            {formData.material_peligroso && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-4">
                <div>
                  <Label htmlFor="cve_material_peligroso">Clave Material Peligroso *</Label>
                  <Input
                    id="cve_material_peligroso"
                    value={formData.cve_material_peligroso}
                    onChange={(e) => handleFieldChange('cve_material_peligroso', e.target.value)}
                    placeholder="Ej: 1203"
                    className={errors.cve_material_peligroso ? 'border-red-500' : ''}
                  />
                  {errors.cve_material_peligroso && (
                    <p className="text-sm text-red-500 mt-1">{errors.cve_material_peligroso}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="embalaje">Tipo de Embalaje</Label>
                  <Input
                    id="embalaje"
                    value={formData.embalaje}
                    onChange={(e) => handleFieldChange('embalaje', e.target.value)}
                    placeholder="Ej: Tambor metálico"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Información Comercial */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Información Comercial
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fraccion_arancelaria">Fracción Arancelaria</Label>
                <Input
                  id="fraccion_arancelaria"
                  value={formData.fraccion_arancelaria}
                  onChange={(e) => handleFieldChange('fraccion_arancelaria', e.target.value)}
                  placeholder="Ej: 84159090"
                />
              </div>

              <div>
                <Label htmlFor="moneda">Moneda</Label>
                <Select value={formData.moneda} onValueChange={(value) => handleFieldChange('moneda', value)}>
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
          </div>

          <div className="flex justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? 'Guardando...' : (mercancia ? 'Actualizar' : 'Agregar')} Mercancía
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
