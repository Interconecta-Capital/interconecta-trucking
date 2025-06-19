
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Package, AlertTriangle, Shield, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MercanciaCompleta, PermisoSEMARNAT, DocumentacionAduanera } from '@/types/cartaPorte';
import { CatalogosSATService } from '@/services/catalogosSAT';

interface MercanciaFormV31Props {
  mercancia?: MercanciaCompleta;
  onSave: (mercancia: MercanciaCompleta) => Promise<boolean>;
  onCancel: () => void;
  index: number;
}

export function MercanciaFormV31({ 
  mercancia, 
  onSave, 
  onCancel,
  index 
}: MercanciaFormV31Props) {
  const [formData, setFormData] = useState<MercanciaCompleta>({
    id: mercancia?.id || `mercancia-${Date.now()}`,
    descripcion: mercancia?.descripcion || '',
    descripcion_detallada: mercancia?.descripcion_detallada || '',
    bienes_transp: mercancia?.bienes_transp || '',
    clave_unidad: mercancia?.clave_unidad || '',
    cantidad: mercancia?.cantidad || 0,
    peso_kg: mercancia?.peso_kg || 0,
    peso_bruto_total: mercancia?.peso_bruto_total || 0,
    peso_neto_total: mercancia?.peso_neto_total || 0,
    unidad_peso_bruto: mercancia?.unidad_peso_bruto || 'KGM',
    valor_mercancia: mercancia?.valor_mercancia || 0,
    material_peligroso: mercancia?.material_peligroso || false,
    cve_material_peligroso: mercancia?.cve_material_peligroso || '',
    embalaje: mercancia?.embalaje || '',
    fraccion_arancelaria: mercancia?.fraccion_arancelaria || '',
    moneda: mercancia?.moneda || 'MXN',
    uuid_comercio_ext: mercancia?.uuid_comercio_ext || '',
    // NUEVOS CAMPOS v3.1
    especie_protegida: mercancia?.especie_protegida || false,
    requiere_cites: mercancia?.requiere_cites || false,
    permisos_semarnat: mercancia?.permisos_semarnat || [],
    documentacion_aduanera: mercancia?.documentacion_aduanera || [],
    numero_piezas: mercancia?.numero_piezas || undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Calcular peso bruto total automáticamente
  useEffect(() => {
    if (formData.cantidad > 0 && formData.peso_kg > 0) {
      setFormData(prev => ({
        ...prev,
        peso_bruto_total: prev.cantidad * prev.peso_kg
      }));
    }
  }, [formData.cantidad, formData.peso_kg]);

  // Validaciones SAT
  useEffect(() => {
    const validar = async () => {
      if (formData.bienes_transp) {
        const ok = await CatalogosSATService.existeProductoServicio(formData.bienes_transp);
        setErrors(prev => ({ ...prev, bienes_transp: ok ? '' : 'Clave no válida en catálogo SAT' }));
      }
    };
    validar();
  }, [formData.bienes_transp]);

  useEffect(() => {
    const validar = async () => {
      if (formData.clave_unidad) {
        const ok = await CatalogosSATService.existeUnidad(formData.clave_unidad);
        setErrors(prev => ({ ...prev, clave_unidad: ok ? '' : 'Unidad no válida en catálogo SAT' }));
      }
    };
    validar();
  }, [formData.clave_unidad]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validaciones básicas obligatorias
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
      newErrors.peso_kg = 'El peso unitario debe ser mayor a 0';
    }

    if (!formData.valor_mercancia || formData.valor_mercancia <= 0) {
      newErrors.valor_mercancia = 'El valor debe ser mayor a 0';
    }

    // Validaciones específicas fauna silvestre
    if (formData.especie_protegida) {
      if (!formData.descripcion_detallada?.trim() || formData.descripcion_detallada.length < 50) {
        newErrors.descripcion_detallada = 'Especies protegidas requieren descripción detallada (mínimo 50 caracteres)';
      }

      if (!formData.permisos_semarnat || formData.permisos_semarnat.length === 0) {
        newErrors.permisos_semarnat = 'Especies protegidas requieren al menos un permiso SEMARNAT';
      }
    }

    // Validaciones material peligroso
    if (formData.material_peligroso && !formData.cve_material_peligroso?.trim()) {
      newErrors.cve_material_peligroso = 'La clave de material peligroso es requerida';
    }

    // Validaciones peso v3.1
    if (formData.peso_bruto_total && formData.peso_bruto_total !== (formData.cantidad * formData.peso_kg)) {
      newErrors.peso_bruto_total = 'El peso bruto total debe coincidir con cantidad × peso unitario';
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

  const addPermisoSEMARNAT = () => {
    const nuevoPermiso: PermisoSEMARNAT = {
      tipo_permiso: 'traslado',
      numero_permiso: '',
      fecha_expedicion: '',
      fecha_vencimiento: '',
      autoridad_expedidora: 'SEMARNAT',
      vigente: true
    };
    
    setFormData(prev => ({
      ...prev,
      permisos_semarnat: [...(prev.permisos_semarnat || []), nuevoPermiso]
    }));
  };

  const removePermisoSEMARNAT = (index: number) => {
    setFormData(prev => ({
      ...prev,
      permisos_semarnat: prev.permisos_semarnat?.filter((_, i) => i !== index) || []
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {mercancia ? `Editar Mercancía #${index + 1}` : `Nueva Mercancía #${index + 1}`}
          <span className="text-sm font-normal text-muted-foreground">(SAT v3.1)</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Información Básica</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bienes_transp">Clave Producto/Servicio SAT *</Label>
                <Input
                  id="bienes_transp"
                  value={formData.bienes_transp}
                  onChange={(e) => handleFieldChange('bienes_transp', e.target.value)}
                  placeholder="ej. 01010101 (Animales vivos)"
                  className={errors.bienes_transp ? 'border-red-500' : ''}
                />
                {errors.bienes_transp && (
                  <p className="text-sm text-red-500 mt-1">{errors.bienes_transp}</p>
                )}
              </div>

              <div>
                <Label htmlFor="clave_unidad">Unidad de Medida SAT *</Label>
                <Input
                  id="clave_unidad"
                  value={formData.clave_unidad}
                  onChange={(e) => handleFieldChange('clave_unidad', e.target.value)}
                  placeholder="ej. H87 (Pieza), EA (Elemento)"
                  className={errors.clave_unidad ? 'border-red-500' : ''}
                />
                {errors.clave_unidad && (
                  <p className="text-sm text-red-500 mt-1">{errors.clave_unidad}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="descripcion">Descripción Básica *</Label>
              <Input
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => handleFieldChange('descripcion', e.target.value)}
                placeholder="ej. Jaguares"
                className={errors.descripcion ? 'border-red-500' : ''}
              />
              {errors.descripcion && (
                <p className="text-sm text-red-500 mt-1">{errors.descripcion}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cantidad">Cantidad *</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="0"
                  step="1"
                  value={formData.cantidad}
                  onChange={(e) => handleFieldChange('cantidad', Number(e.target.value))}
                  className={errors.cantidad ? 'border-red-500' : ''}
                />
                {errors.cantidad && (
                  <p className="text-sm text-red-500 mt-1">{errors.cantidad}</p>
                )}
              </div>

              <div>
                <Label htmlFor="peso_kg">Peso Unitario (kg) *</Label>
                <Input
                  id="peso_kg"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.peso_kg}
                  onChange={(e) => handleFieldChange('peso_kg', Number(e.target.value))}
                  className={errors.peso_kg ? 'border-red-500' : ''}
                />
                {errors.peso_kg && (
                  <p className="text-sm text-red-500 mt-1">{errors.peso_kg}</p>
                )}
              </div>

              <div>
                <Label htmlFor="peso_bruto_total">Peso Bruto Total (kg) *</Label>
                <Input
                  id="peso_bruto_total"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.peso_bruto_total}
                  onChange={(e) => handleFieldChange('peso_bruto_total', Number(e.target.value))}
                  className={errors.peso_bruto_total ? 'border-red-500' : ''}
                />
                {errors.peso_bruto_total && (
                  <p className="text-sm text-red-500 mt-1">{errors.peso_bruto_total}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Calculado: {(formData.cantidad * formData.peso_kg).toFixed(2)} kg
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="valor_mercancia">Valor Unitario *</Label>
              <Input
                id="valor_mercancia"
                type="number"
                min="0"
                step="0.01"
                value={formData.valor_mercancia}
                onChange={(e) => handleFieldChange('valor_mercancia', Number(e.target.value))}
                className={errors.valor_mercancia ? 'border-red-500' : ''}
              />
              {errors.valor_mercancia && (
                <p className="text-sm text-red-500 mt-1">{errors.valor_mercancia}</p>
              )}
            </div>
          </div>

          <Separator />

          {/* Especies Protegidas - NUEVO */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="especie_protegida"
                checked={formData.especie_protegida}
                onCheckedChange={(checked) => handleFieldChange('especie_protegida', checked)}
              />
              <Label htmlFor="especie_protegida" className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                Especie Protegida (Fauna Silvestre)
              </Label>
            </div>

            {formData.especie_protegida && (
              <div className="space-y-4 p-4 border rounded-lg bg-green-50">
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Las especies protegidas requieren descripción detallada y permisos SEMARNAT válidos.
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="descripcion_detallada">Descripción Detallada * (min. 50 caracteres)</Label>
                  <Textarea
                    id="descripcion_detallada"
                    value={formData.descripcion_detallada || ''}
                    onChange={(e) => handleFieldChange('descripcion_detallada', e.target.value)}
                    placeholder="ej. Jaguar (Panthera onca), macho, 5 años, microchip 985100012345678, amparado por Autorización SEMARNAT..."
                    rows={4}
                    className={errors.descripcion_detallada ? 'border-red-500' : ''}
                  />
                  {errors.descripcion_detallada && (
                    <p className="text-sm text-red-500 mt-1">{errors.descripcion_detallada}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Caracteres: {(formData.descripcion_detallada || '').length}/50 mínimo
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Permisos SEMARNAT *</Label>
                    <Button type="button" onClick={addPermisoSEMARNAT} size="sm" variant="outline">
                      Agregar Permiso
                    </Button>
                  </div>
                  
                  {formData.permisos_semarnat?.map((permiso, idx) => (
                    <div key={idx} className="p-3 border rounded space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <Label>Tipo Permiso</Label>
                          <Select
                            value={permiso.tipo_permiso}
                            onValueChange={(value) => {
                              const nuevosPermisos = [...(formData.permisos_semarnat || [])];
                              nuevosPermisos[idx] = { ...permiso, tipo_permiso: value as any };
                              handleFieldChange('permisos_semarnat', nuevosPermisos);
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="traslado">Autorización de Traslado</SelectItem>
                              <SelectItem value="aprovechamiento">Permiso de Aprovechamiento</SelectItem>
                              <SelectItem value="legal_procedencia">Acreditación Legal Procedencia</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label>Número Permiso</Label>
                          <Input
                            value={permiso.numero_permiso}
                            onChange={(e) => {
                              const nuevosPermisos = [...(formData.permisos_semarnat || [])];
                              nuevosPermisos[idx] = { ...permiso, numero_permiso: e.target.value };
                              handleFieldChange('permisos_semarnat', nuevosPermisos);
                            }}
                            placeholder="ej. GTO-123/2025"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <Label>Fecha Expedición</Label>
                          <Input
                            type="date"
                            value={permiso.fecha_expedicion}
                            onChange={(e) => {
                              const nuevosPermisos = [...(formData.permisos_semarnat || [])];
                              nuevosPermisos[idx] = { ...permiso, fecha_expedicion: e.target.value };
                              handleFieldChange('permisos_semarnat', nuevosPermisos);
                            }}
                          />
                        </div>
                        
                        <div>
                          <Label>Fecha Vencimiento</Label>
                          <Input
                            type="date"
                            value={permiso.fecha_vencimiento}
                            onChange={(e) => {
                              const nuevosPermisos = [...(formData.permisos_semarnat || [])];
                              nuevosPermisos[idx] = { ...permiso, fecha_vencimiento: e.target.value };
                              handleFieldChange('permisos_semarnat', nuevosPermisos);
                            }}
                          />
                        </div>
                      </div>
                      
                      <Button 
                        type="button" 
                        onClick={() => removePermisoSEMARNAT(idx)} 
                        size="sm" 
                        variant="destructive"
                      >
                        Eliminar Permiso
                      </Button>
                    </div>
                  ))}
                  
                  {errors.permisos_semarnat && (
                    <p className="text-sm text-red-500">{errors.permisos_semarnat}</p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="requiere_cites"
                    checked={formData.requiere_cites}
                    onCheckedChange={(checked) => handleFieldChange('requiere_cites', checked)}
                  />
                  <Label htmlFor="requiere_cites">Requiere CITES (Comercio Internacional)</Label>
                </div>
              </div>
            )}
          </div>

          {/* Material Peligroso */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="material_peligroso"
                checked={formData.material_peligroso}
                onCheckedChange={(checked) => handleFieldChange('material_peligroso', checked)}
              />
              <Label htmlFor="material_peligroso" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Material Peligroso
              </Label>
            </div>

            {formData.material_peligroso && (
              <div>
                <Label htmlFor="cve_material_peligroso">Clave Material Peligroso *</Label>
                <Input
                  id="cve_material_peligroso"
                  value={formData.cve_material_peligroso}
                  onChange={(e) => handleFieldChange('cve_material_peligroso', e.target.value)}
                  placeholder="ej. 1234"
                  className={errors.cve_material_peligroso ? 'border-red-500' : ''}
                />
                {errors.cve_material_peligroso && (
                  <p className="text-sm text-red-500 mt-1">{errors.cve_material_peligroso}</p>
                )}
              </div>
            )}
          </div>

          {/* Información Adicional */}
          <div className="space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? 'Ocultar' : 'Mostrar'} Información Adicional
            </Button>

            {showAdvanced && (
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fraccion_arancelaria">Fracción Arancelaria</Label>
                    <Input
                      id="fraccion_arancelaria"
                      value={formData.fraccion_arancelaria}
                      onChange={(e) => handleFieldChange('fraccion_arancelaria', e.target.value)}
                      placeholder="ej. 01063900"
                    />
                  </div>

                  <div>
                    <Label htmlFor="numero_piezas">Número de Piezas</Label>
                    <Input
                      id="numero_piezas"
                      type="number"
                      min="0"
                      value={formData.numero_piezas || ''}
                      onChange={(e) => handleFieldChange('numero_piezas', Number(e.target.value) || undefined)}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="embalaje">Tipo de Embalaje</Label>
                  <Input
                    id="embalaje"
                    value={formData.embalaje}
                    onChange={(e) => handleFieldChange('embalaje', e.target.value)}
                    placeholder="ej. Jaula de acero reforzado"
                  />
                </div>
              </div>
            )}
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
