
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
import { MercanciaCompleta } from '@/types/cartaPorte';
import { Package, Upload, ArrowRight, ArrowLeft, Plus, Sparkles, Brain, FileText, Bot } from 'lucide-react';
import { toast } from 'sonner';

interface SmartMercanciasSectionProps {
  data: MercanciaCompleta[];
  ubicaciones: any[];
  onChange: (data: MercanciaCompleta[]) => void;
  onNext: () => void;
  onPrev: () => void;
}

// Helper function to convert Mercancia to MercanciaCompleta
const convertToMercanciaCompleta = (mercancia: Mercancia): MercanciaCompleta => {
  return {
    id: mercancia.id || crypto.randomUUID(),
    descripcion: mercancia.descripcion || '',
    bienes_transp: mercancia.bienes_transp || '',
    clave_unidad: mercancia.clave_unidad || 'KGM',
    cantidad: mercancia.cantidad || 1,
    peso_kg: mercancia.peso_kg || 0,
    valor_mercancia: mercancia.valor_mercancia || 0,
    material_peligroso: mercancia.material_peligroso || false,
    moneda: mercancia.moneda || 'MXN',
    cve_material_peligroso: mercancia.cve_material_peligroso,
    embalaje: mercancia.embalaje,
    fraccion_arancelaria: mercancia.fraccion_arancelaria,
    uuid_comercio_ext: mercancia.uuid_comercio_ext,
    carta_porte_id: mercancia.carta_porte_id,
    numero_autorizacion: mercancia.numero_autorizacion,
    folio_acreditacion: mercancia.folio_acreditacion,
    requiere_semarnat: mercancia.requiere_semarnat || false,
    categoria_transporte: mercancia.categoria_transporte,
    regulaciones_especiales: mercancia.regulaciones_especiales || [],
    temperatura_transporte: mercancia.temperatura_transporte,
    tipo_refrigeracion: mercancia.tipo_refrigeracion,
    dimensiones_especiales: mercancia.dimensiones_especiales,
    peso_especial: mercancia.peso_especial,
    peso_bruto_total: mercancia.peso_bruto_total,
    descripcion_detallada: mercancia.descripcion_detallada,
    especie_protegida: mercancia.especie_protegida || false,
    tipo_embalaje: mercancia.tipo_embalaje,
    material_embalaje: mercancia.material_embalaje,
    unidad_peso_bruto: mercancia.unidad_peso_bruto,
    dimensiones: mercancia.dimensiones,
    uuid_comercio_exterior: mercancia.uuid_comercio_ext,
    peso_neto_total: mercancia.peso_neto_total,
    numero_piezas: mercancia.numero_piezas,
    requiere_cites: mercancia.requiere_cites || false,
    permisos_semarnat: mercancia.permisos_semarnat || [],
    documentacion_aduanera: mercancia.documentacion_aduanera || []
  };
};

// Helper function to convert MercanciaCompleta to Mercancia
const convertToMercancia = (mercanciaCompleta: MercanciaCompleta): Mercancia => {
  return {
    id: mercanciaCompleta.id,
    descripcion: mercanciaCompleta.descripcion,
    bienes_transp: mercanciaCompleta.bienes_transp,
    clave_unidad: mercanciaCompleta.clave_unidad,
    cantidad: mercanciaCompleta.cantidad,
    peso_kg: mercanciaCompleta.peso_kg,
    valor_mercancia: mercanciaCompleta.valor_mercancia || 0,
    material_peligroso: mercanciaCompleta.material_peligroso || false,
    moneda: mercanciaCompleta.moneda || 'MXN',
    cve_material_peligroso: mercanciaCompleta.cve_material_peligroso,
    embalaje: mercanciaCompleta.embalaje,
    fraccion_arancelaria: mercanciaCompleta.fraccion_arancelaria,
    uuid_comercio_ext: mercanciaCompleta.uuid_comercio_exterior,
    carta_porte_id: mercanciaCompleta.carta_porte_id,
    numero_autorizacion: mercanciaCompleta.numero_autorizacion,
    folio_acreditacion: mercanciaCompleta.folio_acreditacion,
    requiere_semarnat: mercanciaCompleta.requiere_semarnat,
    categoria_transporte: mercanciaCompleta.categoria_transporte,
    regulaciones_especiales: mercanciaCompleta.regulaciones_especiales,
    temperatura_transporte: mercanciaCompleta.temperatura_transporte,
    tipo_refrigeracion: mercanciaCompleta.tipo_refrigeracion,
    dimensiones_especiales: mercanciaCompleta.dimensiones_especiales,
    peso_especial: mercanciaCompleta.peso_especial,
    peso_bruto_total: mercanciaCompleta.peso_bruto_total,
    descripcion_detallada: mercanciaCompleta.descripcion_detallada,
    especie_protegida: mercanciaCompleta.especie_protegida,
    tipo_embalaje: mercanciaCompleta.tipo_embalaje,
    material_embalaje: mercanciaCompleta.material_embalaje,
    unidad_peso_bruto: mercanciaCompleta.unidad_peso_bruto,
    dimensiones: mercanciaCompleta.dimensiones,
    peso_neto_total: mercanciaCompleta.peso_neto_total,
    numero_piezas: mercanciaCompleta.numero_piezas,
    requiere_cites: mercanciaCompleta.requiere_cites,
    permisos_semarnat: mercanciaCompleta.permisos_semarnat,
    documentacion_aduanera: mercanciaCompleta.documentacion_aduanera
  };
};

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
  const [editingMercancia, setEditingMercancia] = useState<MercanciaCompleta | undefined>();
  const [editingIndex, setEditingIndex] = useState<number>(-1);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);

  // Sync with prop data when there are changes
  React.useEffect(() => {
    const mercanciasCompletas: MercanciaCompleta[] = mercancias.map(convertToMercanciaCompleta);
    onChange(mercanciasCompletas);
  }, [mercancias, onChange]);

  // Get carta porte ID from URL or context if available
  const getCartaPorteId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id') || undefined;
  };

  const handleSaveMercancia = async (mercancia: MercanciaCompleta): Promise<boolean> => {
    try {
      // Convert to Mercancia for the hook
      const mercanciaForHook = convertToMercancia(mercancia);
      
      if (editingMercancia) {
        actualizarMercancia({ id: editingMercancia.id!, mercancia: mercanciaForHook });
      } else {
        agregarMercancia(mercanciaForHook);
      }
      
      // Learn from successful saves
      addUserPattern('mercancia_tipo', mercancia.descripcion);
      addUserPattern('bienes_transporte', mercancia.bienes_transp);
      
      setShowForm(false);
      setEditingMercancia(undefined);
      setEditingIndex(-1);
      
      return true;
    } catch (error) {
      console.error('Error saving mercancia:', error);
      return false;
    }
  };

  const handleEditMercancia = (mercancia: MercanciaCompleta) => {
    const index = data.findIndex(m => m.id === mercancia.id);
    setEditingMercancia(mercancia);
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleRemoveMercancia = (index: number) => {
    const mercancia = data[index];
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

  const handleDocumentProcessed = async (extractedMercancias: any[]) => {
    try {
      const result = await importarMercancias(extractedMercancias);
      setShowDocumentDialog(false);
      toast.success(`${result.importadas} mercancías importadas exitosamente`);
      if (result.errores > 0) {
        toast.warning(`${result.errores} mercancías con errores`);
      }
    } catch (error) {
      console.error('Error processing document:', error);
      toast.error('Error al procesar las mercancías del documento');
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
    if (data.length > 0) {
      onNext();
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPrev();
  };

  const canContinue = data.length > 0;

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
                  disabled={data.length === 0}
                >
                  <Brain className="h-4 w-4" />
                  <span>Sugerencias IA</span>
                </Button>
                <Button 
                  type="button"
                  onClick={handleShowDocuments}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
                >
                  <FileText className="h-4 w-4" />
                  <span>Importar Documento</span>
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
          
          {/* Quick import info */}
          {!showForm && data.length === 0 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Bot className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">¿Tienes un documento con tus mercancías?</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Puedes importar automáticamente desde PDFs, imágenes, archivos Excel o XML. 
                    Nuestra IA extraerá la información y completará los campos SAT requeridos.
                  </p>
                  <Button 
                    onClick={handleShowDocuments}
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    Probar Importación IA
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          {showForm ? (
            <SmartMercanciaForm
              mercancia={editingMercancia}
              onSave={handleSaveMercancia}
              onCancel={handleCancelForm}
              onRemove={editingIndex >= 0 ? () => handleRemoveMercancia(editingIndex) : undefined}
              isLoading={isLoading}
            />
          ) : (
            <MercanciasListWrapper
              mercancias={data}
              onEdit={handleEditMercancia}
              onDelete={(id: string) => eliminarMercancia(id)}
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
            onClick={onPrev} 
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Anterior</span>
          </Button>
          
          <Button 
            type="button"
            onClick={onNext} 
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
        cartaPorteId={getCartaPorteId()}
      />
    </div>
  );
}
