
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MercanciaForm } from './mercancias/MercanciaForm';
import { MercanciasListWrapper } from './mercancias/MercanciasListWrapper';
import { ImportDialog } from './mercancias/ImportDialog';
import { DocumentUploadDialog } from './mercancias/DocumentUploadDialog';
import { useMercancias, Mercancia } from '@/hooks/useMercancias';
import { Package, Upload, ArrowRight, ArrowLeft, Plus, Sparkles } from 'lucide-react';

interface MercanciasSectionProps {
  data: any[];
  ubicaciones: any[];
  onChange: (data: any[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function MercanciasSection({ data, ubicaciones, onChange, onNext, onPrev }: MercanciasSectionProps) {
  const {
    mercancias,
    isLoading,
    agregarMercancia,
    actualizarMercancia,
    eliminarMercancia,
    importarMercancias
  } = useMercancias();

  const [showForm, setShowForm] = useState(false);
  const [editingMercancia, setEditingMercancia] = useState<Mercancia | undefined>();
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);

  // Sincronizar con prop data cuando hay cambios
  React.useEffect(() => {
    onChange(mercancias);
  }, [mercancias, onChange]);

  const handleSaveMercancia = async (mercancia: Mercancia) => {
    try {
      if (editingMercancia) {
        await actualizarMercancia(editingMercancia.id!, mercancia);
      } else {
        await agregarMercancia(mercancia);
      }
      
      // Cerrar formulario después de guardar exitosamente
      setShowForm(false);
      setEditingMercancia(undefined);
      setEditingIndex(-1);
      
      return true;
    } catch (error) {
      console.error('Error saving mercancia:', error);
      return false;
    }
  };

  const handleEditMercancia = (mercancia: Mercancia, index: number) => {
    setEditingMercancia(mercancia);
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleRemoveMercancia = (index: number) => {
    const mercancia = mercancias[index];
    if (mercancia?.id) {
      eliminarMercancia(mercancia.id);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingMercancia(undefined);
    setEditingIndex(-1);
  };

  const handleAddManually = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowForm(true);
  };

  const handleDocumentProcessed = async (extractedMercancias: Mercancia[]) => {
    try {
      await importarMercancias(extractedMercancias);
      setShowDocumentDialog(false);
    } catch (error) {
      console.error('Error processing document:', error);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (mercancias.length > 0) {
      onNext();
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPrev();
  };

  const canContinue = mercancias.length > 0;

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
              <div className="flex flex-wrap gap-2">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={(e) => {
                    e.preventDefault();
                    setShowDocumentDialog(true);
                  }}
                  className="flex items-center space-x-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>IA: PDF/XML/OCR</span>
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={(e) => {
                    e.preventDefault();
                    setShowImportDialog(true);
                  }}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Excel/CSV</span>
                </Button>
                <Button 
                  type="button"
                  onClick={handleAddManually}
                  className="flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Agregar Manual</span>
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {showForm ? (
            <MercanciaForm
              index={editingIndex >= 0 ? editingIndex : mercancias.length}
              mercancia={editingMercancia}
              onSave={handleSaveMercancia}
              onCancel={handleCancelForm}
              onRemove={editingIndex >= 0 ? () => handleRemoveMercancia(editingIndex) : undefined}
              isLoading={isLoading}
            />
          ) : (
            <MercanciasListWrapper
              mercancias={mercancias}
              onEdit={(mercancia: Mercancia) => {
                const index = mercancias.findIndex(m => m.id === mercancia.id);
                handleEditMercancia(mercancia, index);
              }}
              onDelete={eliminarMercancia}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      {!showForm && (
        <div className="flex justify-between">
          <Button 
            type="button"
            variant="outline" 
            onClick={handlePrev} 
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Anterior</span>
          </Button>
          
          <Button 
            type="button"
            onClick={handleNext} 
            disabled={!canContinue}
            className="flex items-center space-x-2"
          >
            <span>Continuar a Transporte</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Dialog de importación tradicional */}
      <ImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={importarMercancias}
      />

      {/* Dialog de procesamiento de documentos con IA */}
      <DocumentUploadDialog
        open={showDocumentDialog}
        onOpenChange={setShowDocumentDialog}
        onDocumentProcessed={handleDocumentProcessed}
      />
    </div>
  );
}
