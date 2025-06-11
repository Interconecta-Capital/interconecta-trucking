
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MercanciaForm } from './mercancias/MercanciaForm';
import { MercanciasList } from './mercancias/MercanciasList';
import { ImportDialog } from './mercancias/ImportDialog';
import { useMercancias, Mercancia } from '@/hooks/useMercancias';
import { Package, Upload, ArrowRight, ArrowLeft, Plus } from 'lucide-react';

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
  const [showImportDialog, setShowImportDialog] = useState(false);

  // Sincronizar con prop data cuando hay cambios
  React.useEffect(() => {
    onChange(mercancias);
  }, [mercancias, onChange]);

  const handleSaveMercancia = async (mercancia: Mercancia) => {
    if (editingMercancia) {
      return await actualizarMercancia(editingMercancia.id!, mercancia);
    } else {
      return await agregarMercancia(mercancia);
    }
  };

  const handleEditMercancia = (mercancia: Mercancia) => {
    setEditingMercancia(mercancia);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingMercancia(undefined);
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
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowImportDialog(true)}
                  className="flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Importar Excel/CSV</span>
                </Button>
                <Button 
                  onClick={() => setShowForm(true)}
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
            <MercanciaForm
              mercancia={editingMercancia}
              onSave={handleSaveMercancia}
              onCancel={handleCancelForm}
              isLoading={isLoading}
            />
          ) : (
            <MercanciasList
              mercancias={mercancias}
              onEdit={handleEditMercancia}
              onDelete={eliminarMercancia}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>

      {/* Botones de navegación */}
      {!showForm && (
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={onPrev} 
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Anterior</span>
          </Button>
          
          <Button 
            onClick={onNext} 
            disabled={!canContinue}
            className="flex items-center space-x-2"
          >
            <span>Continuar a Transporte</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Dialog de importación */}
      <ImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={importarMercancias}
      />
    </div>
  );
}
