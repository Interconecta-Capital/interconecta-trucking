import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, Plus, Upload, AlertCircle, ArrowLeft, ArrowRight, Shield } from 'lucide-react';
import { MercanciaCompleta } from '@/types/cartaPorte';
import { MercanciaFormV31 } from './MercanciaFormV31';
import { DocumentUploadDialog } from './DocumentUploadDialog';
import { MercanciasList } from './MercanciasList';
import { MercanciasResumen } from './MercanciasResumen';
import { ValidacionSATv31Component } from '../validaciones/ValidacionSATv31';
import { useMercanciasLogic } from './hooks/useMercanciasLogic';
import { useToast } from '@/hooks/use-toast';

interface MercanciasSectionProps {
  data: MercanciaCompleta[];
  onChange: (data: MercanciaCompleta[]) => void;
  onNext: () => void;
  onPrev: () => void;
  cartaPorteId?: string;
}

export function MercanciasSection({ 
  data, 
  onChange, 
  onNext, 
  onPrev, 
  cartaPorteId 
}: MercanciasSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const { toast } = useToast();

  const {
    isDataComplete,
    handleSaveMercancia,
    handleDocumentProcessed,
    calcularTotales
  } = useMercanciasLogic(data, onChange, setFormErrors, toast);

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

  const handleRemoveMercancia = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    onChange(newData);
    
    toast({
      title: "Mercancía eliminada",
      description: `Se eliminó la mercancía #${index + 1}`,
    });
  };

  const handleSaveMercanciaSuccess = async (mercanciaData: MercanciaCompleta): Promise<boolean> => {
    try {
      const errors = validateMercanciaV31(mercanciaData);
      if (errors.length > 0) {
        setFormErrors(errors);
        return false;
      }

      setFormErrors([]);
      
      if (editingIndex !== null) {
        // Editar existente
        const newData = [...data];
        newData[editingIndex] = mercanciaData;
        onChange(newData);
        
        toast({
          title: "Mercancía actualizada",
          description: `Se actualizó la mercancía #${editingIndex + 1}`,
        });
      } else {
        // Agregar nueva
        onChange([...data, mercanciaData]);
        
        toast({
          title: "Mercancía agregada",
          description: "Nueva mercancía agregada exitosamente",
        });
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

  const validateMercanciaV31 = (mercancia: MercanciaCompleta): string[] => {
    const errors: string[] = [];
    
    // Validaciones básicas
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
      errors.push('El peso unitario debe ser mayor a 0');
    }

    // VALIDACIONES v3.1
    if (!mercancia.peso_bruto_total || mercancia.peso_bruto_total <= 0) {
      errors.push('El peso bruto total es obligatorio en v3.1');
    }

    // Validaciones específicas fauna silvestre
    if (mercancia.especie_protegida) {
      if (!mercancia.descripcion_detallada?.trim() || mercancia.descripcion_detallada.length < 50) {
        errors.push('Especies protegidas requieren descripción detallada (mínimo 50 caracteres)');
      }

      if (!mercancia.permisos_semarnat || mercancia.permisos_semarnat.length === 0) {
        errors.push('Especies protegidas requieren al menos un permiso SEMARNAT');
      } else {
        // Validar vigencia de permisos
        const now = new Date();
        const permisosVencidos = mercancia.permisos_semarnat.filter(p => 
          new Date(p.fecha_vencimiento) < now
        );
        if (permisosVencidos.length > 0) {
          errors.push(`Tiene ${permisosVencidos.length} permiso(s) SEMARNAT vencido(s)`);
        }
      }

      // Validación CITES si se requiere
      if (mercancia.requiere_cites && !mercancia.documentacion_aduanera?.some(doc => 
        doc.tipo_documento === 'cites'
      )) {
        errors.push('Especies que requieren CITES deben tener documentación aduanera correspondiente');
      }
    }
    
    // Validaciones material peligroso
    if (mercancia.material_peligroso && !mercancia.cve_material_peligroso?.trim()) {
      errors.push('La clave de material peligroso es requerida cuando es material peligroso');
    }
    
    return errors;
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingIndex(null);
    setFormErrors([]);
  };

  const totales = calcularTotales();
  const hasEspeciesProtegidas = data.some(m => m.especie_protegida);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Gestión de Mercancías</span>
              <span className="text-sm font-normal text-muted-foreground">(SAT v3.1)</span>
              {hasEspeciesProtegidas && (
                <Shield className="h-4 w-4 text-green-600" />
              )}
            </CardTitle>
            
            {!showForm && (
              <div className="flex gap-2">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setShowUploadDialog(true)}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Importar Documento</span>
                </Button>
                
                <Button 
                  type="button"
                  onClick={handleAddMercancia}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Agregar Mercancía</span>
                </Button>
              </div>
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
              
              <MercanciaFormV31
                mercancia={editingIndex !== null ? data[editingIndex] : undefined}
                onSave={handleSaveMercanciaSuccess}
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
                    No hay mercancías agregadas. Agrega mercancías manualmente o importa desde un documento.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
                      <Upload className="h-4 w-4 mr-2" />
                      Importar Documento
                    </Button>
                    <Button onClick={handleAddMercancia}>
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Manualmente
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <MercanciasList
                    data={data}
                    onEditMercancia={handleEditMercancia}
                    onRemoveMercancia={handleRemoveMercancia}
                  />
                  
                  <MercanciasResumen
                    data={data}
                    totales={totales}
                  />

                  {hasEspeciesProtegidas && (
                    <Alert className="border-green-200 bg-green-50">
                      <Shield className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>Especies Protegidas Detectadas:</strong> Este envío contiene fauna silvestre protegida. 
                        Asegúrese de que todos los permisos SEMARNAT estén vigentes y la documentación esté completa.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowValidation(!showValidation)}
                    >
                      {showValidation ? 'Ocultar' : 'Mostrar'} Validación SAT v3.1
                    </Button>
                  </div>

                  {showValidation && (
                    <ValidacionSATv31Component
                      cartaPorteData={{
                        cartaPorteVersion: '3.1',
                        mercancias: data,
                        // Simular otros datos necesarios para validación
                        ubicaciones: [],
                        autotransporte: {} as any,
                        figuras: []
                      }}
                      autoValidate={true}
                    />
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validación y Navegación */}
      {!showForm && (
        <>
          {!isDataComplete() && data.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Algunas mercancías tienen datos incompletos. Revise que todas tengan descripción, cantidad, peso bruto total y claves SAT válidas.
              </AlertDescription>
            </Alert>
          )}

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
        </>
      )}

      <DocumentUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onDocumentProcessed={handleDocumentProcessed}
        cartaPorteId={cartaPorteId}
      />
    </div>
  );
}
