
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SmartMercanciaForm } from './mercancias/SmartMercanciaForm';
import { MercanciasListWrapper } from './mercancias/MercanciasListWrapper';
import { ImportDialog } from './mercancias/ImportDialog';
import { DocumentUploadDialog } from './mercancias/DocumentUploadDialog';
import { useMercancias, Mercancia } from '@/hooks/useMercancias';
import { useAIContext } from '@/hooks/ai/useAIContext';
import { geminiCore } from '@/services/ai/GeminiCoreService';
import { Package, Upload, ArrowRight, ArrowLeft, Plus, Sparkles, Brain } from 'lucide-react';
import { toast } from 'sonner';

interface SmartMercanciasSectionProps {
  data: any[];
  ubicaciones: any[];
  onChange: (data: any[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function SmartMercanciasSection({ 
  data, 
  ubicaciones, 
  onChange, 
  onNext, 
  onPrev 
}: SmartMercanciasSectionProps) {
  const { context, addUserPattern } = useAIContext();
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
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);

  // Sync with prop data when there are changes
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
      
      // Learn from successful saves
      addUserPattern('mercancia_tipo', mercancia.descripcion);
      addUserPattern('producto_servicio', mercancia.claveProdServ);
      
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

  const handleShowImport = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowImportDialog(true);
  };

  const handleShowDocuments = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDocumentDialog(true);
  };

  const handleDocumentProcessed = async (extractedMercancias: Mercancia[]) => {
    try {
      await importarMercancias(extractedMercancias);
      setShowDocumentDialog(false);
    } catch (error) {
      console.error('Error processing document:', error);
    }
  };

  const handleGetAISuggestions = async () => {
    if (mercancias.length === 0) {
      toast.error('Agregue al menos una mercancía para obtener sugerencias');
      return;
    }

    try {
      const insights = await geminiCore.getBusinessInsights(
        { mercancias, ubicaciones },
        'daily',
        context
      );

      setAiSuggestions([
        {
          type: 'optimization',
          title: 'Optimización de Carga',
          content: insights.recommendations[0] || 'Considere consolidar mercancías similares',
          confidence: 0.8
        },
        {
          type: 'compliance',
          title: 'Cumplimiento Regulatorio',
          content: 'Verifique que todas las claves SAT sean correctas',
          confidence: 0.9
        },
        {
          type: 'efficiency',
          title: 'Eficiencia de Transporte',
          content: insights.recommendations[1] || 'La carga está bien distribuida',
          confidence: 0.75
        }
      ]);
      
      setShowAiSuggestions(true);
      toast.success('Sugerencias de IA generadas');
    } catch (error) {
      toast.error('Error obteniendo sugerencias de IA');
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
              <span>Gestión Inteligente de Mercancías</span>
            </CardTitle>
            
            {!showForm && (
              <div className="flex flex-wrap gap-2">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleGetAISuggestions}
                  className="flex items-center space-x-2"
                  disabled={mercancias.length === 0}
                >
                  <Brain className="h-4 w-4" />
                  <span>Sugerencias IA</span>
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleShowDocuments}
                  className="flex items-center space-x-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>IA: PDF/XML/OCR</span>
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleShowImport}
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
            <SmartMercanciaForm
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

      {/* AI Suggestions Panel */}
      {showAiSuggestions && aiSuggestions.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                Análisis Inteligente de Mercancías
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAiSuggestions(false)}
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3">
              {aiSuggestions.map((suggestion, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900">{suggestion.title}</h4>
                      <p className="text-sm text-blue-700 mt-1">{suggestion.content}</p>
                    </div>
                    <div className="ml-3 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {Math.round(suggestion.confidence * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Dialogs */}
      <ImportDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onImport={importarMercancias}
      />

      <DocumentUploadDialog
        open={showDocumentDialog}
        onOpenChange={setShowDocumentDialog}
        onDocumentProcessed={handleDocumentProcessed}
      />
    </div>
  );
}
