
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MercanciaFormOptimizada } from './MercanciaFormOptimizada';
import { Plus, Package, ArrowRight, ArrowLeft, AlertCircle, FileText } from 'lucide-react';

interface MercanciaCompleta {
  id: string;
  descripcion: string;
  bienes_transp: string;
  clave_unidad: string;
  cantidad: number;
  peso_kg: number;
  valor_mercancia: number;
  material_peligroso: boolean;
  moneda: string;
  cve_material_peligroso?: string;
  embalaje?: string;
  fraccion_arancelaria?: string;
  uuid_comercio_ext?: string;
}

interface MercanciasSectionOptimizadaProps {
  data: MercanciaCompleta[];
  onChange: (data: MercanciaCompleta[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function MercanciasSectionOptimizada({ data, onChange, onNext, onPrev }: MercanciasSectionOptimizadaProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Validar que hay al menos una mercancía con datos mínimos
  const isDataComplete = () => {
    return data.length > 0 && data.every(mercancia => 
      mercancia.descripcion && 
      mercancia.cantidad > 0 && 
      mercancia.bienes_transp &&
      mercancia.clave_unidad
    );
  };

  const handleAddMercancia = () => {
    setEditingIndex(null);
    setFormErrors([]);
    setShowForm(true);
  };

  const handleEditMercancia = (index: number) => {
    setEditingIndex(index);
    setFormErrors([]);
    setShowForm(true);
  };

  const handleSaveMercancia = async (mercanciaData: MercanciaCompleta): Promise<boolean> => {
    try {
      const errors = validateMercancia(mercanciaData);
      if (errors.length > 0) {
        setFormErrors(errors);
        return false;
      }

      setFormErrors([]);
      
      if (editingIndex !== null) {
        const newData = [...data];
        newData[editingIndex] = mercanciaData;
        onChange(newData);
      } else {
        onChange([...data, mercanciaData]);
      }
      
      setShowForm(false);
      setEditingIndex(null);
      return true;
    } catch (error) {
      console.error('Error saving mercancia:', error);
      setFormErrors(['Error al guardar la mercancía. Verifique los datos ingresados.']);
      return false;
    }
  };

  const validateMercancia = (mercancia: MercanciaCompleta): string[] => {
    const errors: string[] = [];
    
    if (!mercancia.descripcion?.trim()) {
      errors.push('La descripción es requerida');
    }
    
    if (!mercancia.bienes_transp?.trim()) {
      errors.push('La clave de producto/servicio es requerida');
    }
    
    if (!mercancia.clave_unidad?.trim()) {
      errors.push('La unidad de medida es requerida');
    }
    
    if (!mercancia.cantidad || mercancia.cantidad <= 0) {
      errors.push('La cantidad debe ser mayor a 0');
    }
    
    if (!mercancia.peso_kg || mercancia.peso_kg <= 0) {
      errors.push('El peso debe ser mayor a 0');
    }
    
    if (mercancia.material_peligroso && !mercancia.cve_material_peligroso?.trim()) {
      errors.push('La clave de material peligroso es requerida cuando es material peligroso');
    }
    
    return errors;
  };

  const handleRemoveMercancia = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    onChange(newData);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingIndex(null);
    setFormErrors([]);
  };

  const calcularTotales = () => {
    return {
      totalCantidad: data.reduce((sum, m) => sum + m.cantidad, 0),
      totalPeso: data.reduce((sum, m) => sum + m.peso_kg, 0),
      totalValor: data.reduce((sum, m) => sum + (m.cantidad * m.valor_mercancia), 0),
      materialesPeligrosos: data.filter(m => m.material_peligroso).length
    };
  };

  const totales = calcularTotales();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Gestión de Mercancías</span>
            </CardTitle>
            
            {!showForm && (
              <Button 
                type="button"
                onClick={handleAddMercancia}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Agregar Mercancía</span>
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {showForm ? (
            <div className="space-y-4">
              {formErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <p className="font-medium">Corrija los siguientes errores:</p>
                      <ul className="list-disc list-inside">
                        {formErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              <MercanciaFormOptimizada
                mercancia={editingIndex !== null ? data[editingIndex] : undefined}
                onSave={handleSaveMercancia}
                onCancel={handleCancelForm}
                index={editingIndex !== null ? editingIndex : data.length}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {data.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    No hay mercancías agregadas. Agrega al menos una mercancía para continuar.
                  </p>
                  <Button onClick={handleAddMercancia}>
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Primera Mercancía
                  </Button>
                </div>
              ) : (
                <>
                  {/* Lista de mercancías */}
                  <div className="space-y-3">
                    {data.map((mercancia, index) => (
                      <Card key={mercancia.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-medium">Mercancía #{index + 1}</h4>
                                {mercancia.material_peligroso && (
                                  <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                    Material Peligroso
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-2">
                                {mercancia.descripcion}
                              </p>
                              
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">Cantidad:</span>
                                  <span className="ml-1 font-medium">{mercancia.cantidad}</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Peso:</span>
                                  <span className="ml-1 font-medium">{mercancia.peso_kg} kg</span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Valor Unit.:</span>
                                  <span className="ml-1 font-medium">
                                    ${mercancia.valor_mercancia.toLocaleString('es-MX')} {mercancia.moneda}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Clave SAT:</span>
                                  <span className="ml-1 font-medium">{mercancia.bienes_transp}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-4">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditMercancia(index)}
                              >
                                Editar
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveMercancia(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Eliminar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Resumen de totales */}
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-3 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Resumen de Mercancías
                      </h4>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total Artículos:</span>
                          <span className="ml-1 font-medium">{data.length}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cantidad Total:</span>
                          <span className="ml-1 font-medium">{totales.totalCantidad.toLocaleString('es-MX')}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Peso Total:</span>
                          <span className="ml-1 font-medium">{totales.totalPeso.toLocaleString('es-MX')} kg</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Valor Total:</span>
                          <span className="ml-1 font-medium">
                            ${totales.totalValor.toLocaleString('es-MX')}
                          </span>
                        </div>
                      </div>

                      {totales.materialesPeligrosos > 0 && (
                        <div className="mt-3 p-2 bg-orange-100 rounded text-sm">
                          <span className="text-orange-800">
                            ⚠️ Contiene {totales.materialesPeligrosos} material(es) peligroso(s)
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validaciones */}
      {!showForm && !isDataComplete() && data.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Algunas mercancías tienen datos incompletos. Revise que todas tengan descripción, cantidad, peso y claves SAT válidas.
          </AlertDescription>
        </Alert>
      )}

      {/* Botones de navegación */}
      {!showForm && (
        <div className="flex justify-between">
          <Button 
            type="button"
            variant="outline" 
            onClick={onPrev} 
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Anterior</span>
          </Button>
          
          <Button 
            type="button"
            onClick={onNext} 
            disabled={!isDataComplete()}
            className="flex items-center space-x-2"
          >
            <span>Continuar a Autotransporte</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
