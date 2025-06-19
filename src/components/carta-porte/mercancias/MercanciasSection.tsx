import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MercanciaFormOptimizada } from './MercanciaFormOptimizada';
import { DocumentUploadDialog } from './DocumentUploadDialog';
import { MercanciasHeader } from './MercanciasHeader';
import { MercanciasEmptyState } from './MercanciasEmptyState';
import { MercanciasList } from './MercanciasList';
import { MercanciasResumen } from './MercanciasResumen';
import { MercanciasValidation } from './MercanciasValidation';
import { MercanciasNavigation } from './MercanciasNavigation';
import { useMercanciasLogic } from './hooks/useMercanciasLogic';
import { Package, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MercanciaCompleta {
  id: string;
  descripcion: string;
  bienes_transp: string;
  clave_unidad: string;
  cantidad: number;
  peso_kg: number;
  valor_mercancia?: number;
  material_peligroso?: boolean;
  moneda?: string; // FIXED: Made optional to match global type
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
  cartaPorteId?: string;
}

export function MercanciasSectionOptimizada({ 
  data, 
  onChange, 
  onNext, 
  onPrev, 
  cartaPorteId 
}: MercanciasSectionOptimizadaProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
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
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingIndex(null);
    setFormErrors([]);
  };

  const totales = calcularTotales();

  return (
    <div className="space-y-6">
      <Card>
        <MercanciasHeader
          showForm={showForm}
          onAddMercancia={handleAddMercancia}
          onShowUploadDialog={() => setShowUploadDialog(true)}
        />
        
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
                <MercanciasEmptyState
                  onAddMercancia={handleAddMercancia}
                  onShowUploadDialog={() => setShowUploadDialog(true)}
                />
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
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <MercanciasValidation
        showForm={showForm}
        isDataComplete={isDataComplete}
        hasData={data.length > 0}
      />

      <MercanciasNavigation
        showForm={showForm}
        isDataComplete={isDataComplete}
        onPrev={onPrev}
        onNext={onNext}
      />

      <DocumentUploadDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        onDocumentProcessed={handleDocumentProcessed}
        cartaPorteId={cartaPorteId}
      />
    </div>
  );
}
