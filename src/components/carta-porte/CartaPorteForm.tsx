
import { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ConfiguracionInicial } from './ConfiguracionInicial';
import { UbicacionesSection } from './UbicacionesSection';
import { MercanciasSection } from './MercanciasSection';
import { AutotransporteSection } from './AutotransporteSection';
import { FigurasTransporteSection } from './FigurasTransporteSection';
import { XMLGenerationPanel } from './xml/XMLGenerationPanel';
import { GuardarPlantillaDialog } from './plantillas/GuardarPlantillaDialog';
import { AIValidationAlerts } from '@/components/ai/AIValidationAlerts';
import { useCartaPorteForm } from '@/hooks/useCartaPorteForm';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import { CartaPorteVersion } from '@/types/cartaPorteVersions';
import { useCartaPorteMappers } from '@/hooks/carta-porte/useCartaPorteMappers';
import { 
  FileText, 
  MapPin, 
  Package, 
  Truck, 
  Users,
  CheckCircle,
  Save,
  Stamp,
  Brain
} from 'lucide-react';

export interface CartaPorteData {
  // Configuración inicial
  tipoCreacion: 'plantilla' | 'carga' | 'manual';
  tipoCfdi: 'Ingreso' | 'Traslado';
  rfcEmisor: string;
  nombreEmisor: string;
  rfcReceptor: string;
  nombreReceptor: string;
  transporteInternacional: boolean;
  registroIstmo: boolean;
  
  // Nueva: Versión del complemento
  cartaPorteVersion: CartaPorteVersion;
  
  // Ubicaciones
  ubicaciones: any[];
  
  // Mercancías
  mercancias: any[];
  
  // Autotransporte
  autotransporte: any;
  
  // Figuras
  figuras: any[];

  // Campos adicionales para transporte internacional
  entrada_salida_merc?: string;
  pais_origen_destino?: string;
  via_entrada_salida?: string;

  // Campos específicos de versión 3.1
  regimenesAduaneros?: string[];
  version31Fields?: {
    transporteEspecializado?: boolean;
    tipoCarroceria?: string;
    registroISTMO?: boolean;
    [key: string]: any;
  };

  // Campos específicos de versión 3.0 (legacy)
  regimenAduanero?: string;

  // ID para tracking
  cartaPorteId?: string;
}

const steps = [
  { id: 'configuracion', label: 'Configuración', icon: FileText },
  { id: 'ubicaciones', label: 'Ubicaciones', icon: MapPin },
  { id: 'mercancias', label: 'Mercancías', icon: Package },
  { id: 'autotransporte', label: 'Transporte', icon: Truck },
  { id: 'figuras', label: 'Figuras', icon: Users },
  { id: 'xml', label: 'XML/Timbrado', icon: Stamp },
];

interface CartaPorteFormProps {
  cartaPorteId?: string;
}

export function CartaPorteForm({ cartaPorteId }: CartaPorteFormProps) {
  const [showGuardarPlantilla, setShowGuardarPlantilla] = useState(false);
  const [showAIAlerts, setShowAIAlerts] = useState(true);
  
  // Usar hook optimizado para el manejo del formulario con IA
  const {
    formData,
    currentCartaPorteId,
    isLoading,
    updateFormData,
    stepValidations,
    totalProgress,
    clearSavedData,
    isCreating,
    isUpdating,
    // Nuevas propiedades IA
    aiValidation,
    hasAIEnhancements,
    validationMode,
    overallScore,
    // Mappers
    formDataToCartaPorteData,
    formAutotransporteToData,
    formFigurasToData,
  } = useCartaPorteForm({ cartaPorteId });

  // Usar hook optimizado para navegación de pestañas
  const { activeTab, handleTabChange } = useTabNavigation({
    initialTab: 'configuracion',
    persistInURL: false,
  });

  // Nuevo handler para aplicar fixes de IA
  const handleApplyAIFix = useCallback((fix: any) => {
    console.log('[CartaPorteForm] Aplicando fix de IA:', fix);
    if (fix.field && fix.suggestedValue) {
      console.log(`Aplicando fix en ${fix.field}: ${fix.suggestedValue}`);
    }
  }, []);

  // Memoizar handlers para evitar re-renders
  const handleNextStep = useCallback((targetStep: string) => {
    handleTabChange(targetStep);
  }, [handleTabChange]);

  const handlePrevStep = useCallback((targetStep: string) => {
    handleTabChange(targetStep);
  }, [handleTabChange]);

  const handleSaveTemplate = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowGuardarPlantilla(true);
  }, []);

  const handleXMLGenerated = useCallback((xml: string) => {
    console.log('XML generado exitosamente', xml.length, 'caracteres');
  }, []);

  const handleTimbrado = useCallback((datos: any) => {
    console.log('Carta Porte timbrada exitosamente:', datos);
  }, []);

  // Handlers específicos para cada sección con conversión de tipos
  const handleAutotransporteChange = useCallback((data: any) => {
    // Convertir de AutotransporteData a formato de formulario
    const formAutotransporte = {
      placaVm: data.placa_vm || '',
      configuracionVehicular: data.config_vehicular || '',
      seguro: {
        aseguradora: data.asegura_resp_civil || '',
        poliza: data.poliza_resp_civil || '',
        vigencia: '',
      },
      remolques: (data.remolques || []).map((r: any) => ({
        placa: r.placa,
        subtipo: r.subtipo_rem
      })),
    };
    updateFormData('autotransporte', formAutotransporte);
  }, [updateFormData]);

  const handleFigurasChange = useCallback((data: any[]) => {
    // Convertir de FiguraTransporte[] a formato de formulario
    const formFiguras = data.map(figura => ({
      id: figura.id,
      tipoFigura: figura.tipo_figura || '',
      rfc: figura.rfc_figura || '',
      nombre: figura.nombre_figura || '',
      licencia: figura.num_licencia,
      vigenciaLicencia: undefined,
    }));
    updateFormData('figuras', formFiguras);
  }, [updateFormData]);

  // Memoizar validaciones complejas
  const canSaveAsTemplate = useMemo(() => {
    return stepValidations.configuracion && formData.ubicaciones.length > 0;
  }, [stepValidations.configuracion, formData.ubicaciones.length]);

  const canGenerateXML = useMemo(() => {
    return Object.entries(stepValidations)
      .filter(([key]) => key !== 'xml')
      .every(([, isValid]) => isValid);
  }, [stepValidations]);

  // Convertir formData a CartaPorteData cuando sea necesario
  const cartaPorteData = useMemo(() => {
    return formDataToCartaPorteData(formData);
  }, [formData, formDataToCartaPorteData]);

  // Determinar título dinámico con indicador IA
  const getFormTitle = useMemo(() => {
    const version = formData.cartaPorteVersion || '3.1';
    const baseTitle = cartaPorteId ? 'Editar Carta Porte' : 'Nueva Carta Porte';
    const aiIndicator = hasAIEnhancements ? '🧠' : '';
    return `${baseTitle} ${version} ${aiIndicator}`;
  }, [cartaPorteId, formData.cartaPorteVersion, hasAIEnhancements]);

  // Memoizar renderizado de pestañas
  const tabTriggers = useMemo(() => {
    return steps.map((step) => {
      const Icon = step.icon;
      const isComplete = stepValidations[step.id as keyof typeof stepValidations];
      
      return (
        <TabsTrigger
          key={step.id}
          value={step.id}
          className="flex flex-col items-center p-4 space-y-2"
          disabled={step.id === 'xml' && !canGenerateXML}
        >
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5" />
            {isComplete && step.id !== 'xml' && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
          <span className="text-xs">{step.label}</span>
        </TabsTrigger>
      );
    });
  }, [stepValidations, canGenerateXML]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-2">Cargando carta porte...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header con progreso mejorado */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              {getFormTitle}
              {currentCartaPorteId && (
                <span className="text-sm font-normal text-green-600 ml-2">
                  ✓ Guardando automáticamente
                </span>
              )}
            </CardTitle>
            <div className="flex items-center space-x-4">
              {hasAIEnhancements && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAIAlerts(!showAIAlerts)}
                  className="flex items-center space-x-2"
                >
                  <Brain className="h-4 w-4" />
                  <span>{showAIAlerts ? 'Ocultar' : 'Mostrar'} IA</span>
                </Button>
              )}
              {canSaveAsTemplate && (
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleSaveTemplate}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Guardar como Plantilla</span>
                </Button>
              )}
              <div className="text-sm text-muted-foreground">
                Progreso: {validationMode === 'ai-enhanced' ? overallScore : Math.round(totalProgress)}%
              </div>
            </div>
          </div>
          <Progress 
            value={validationMode === 'ai-enhanced' ? overallScore : totalProgress} 
            className="w-full" 
          />
          {validationMode === 'ai-enhanced' && (
            <p className="text-xs text-purple-600 mt-1">
              ✨ Validación mejorada con IA activa
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Alertas de IA */}
      {showAIAlerts && aiValidation && hasAIEnhancements && (
        <AIValidationAlerts
          validation={aiValidation}
          onDismiss={() => setShowAIAlerts(false)}
          onApplyFix={handleApplyAIFix}
        />
      )}

      {/* Navegación por pasos */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-6 h-auto">
              {tabTriggers}
            </TabsList>

            <div className="p-6">
              <TabsContent value="configuracion">
                <ConfiguracionInicial
                  data={cartaPorteData}
                  onChange={(data) => updateFormData('configuracion', data)}
                  onNext={() => handleNextStep('ubicaciones')}
                />
              </TabsContent>

              <TabsContent value="ubicaciones">
                <UbicacionesSection
                  data={formData.ubicaciones}
                  onChange={(data) => updateFormData('ubicaciones', data)}
                  onNext={() => handleNextStep('mercancias')}
                  onPrev={() => handlePrevStep('configuracion')}
                />
              </TabsContent>

              <TabsContent value="mercancias">
                <MercanciasSection
                  data={formData.mercancias}
                  ubicaciones={formData.ubicaciones}
                  onChange={(data) => updateFormData('mercancias', data)}
                  onNext={() => handleNextStep('autotransporte')}
                  onPrev={() => handlePrevStep('ubicaciones')}
                />
              </TabsContent>

              <TabsContent value="autotransporte">
                <AutotransporteSection
                  data={formAutotransporteToData(formData.autotransporte)}
                  onChange={handleAutotransporteChange}
                  onNext={() => handleNextStep('figuras')}
                  onPrev={() => handlePrevStep('mercancias')}
                />
              </TabsContent>

              <TabsContent value="figuras">
                <FigurasTransporteSection
                  data={formFigurasToData(formData.figuras)}
                  onChange={handleFigurasChange}
                  onPrev={() => handlePrevStep('autotransporte')}
                  onFinish={() => handleNextStep('xml')}
                />
              </TabsContent>

              <TabsContent value="xml">
                <XMLGenerationPanel
                  cartaPorteData={cartaPorteData}
                  cartaPorteId={currentCartaPorteId}
                  onXMLGenerated={handleXMLGenerated}
                  onTimbrado={handleTimbrado}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Acciones finales mejoradas con IA */}
      {canGenerateXML && (
        <Card className={`border-green-200 ${hasAIEnhancements ? 'bg-gradient-to-r from-green-50 to-purple-50' : 'bg-green-50'}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800 flex items-center gap-2">
                    Carta Porte Lista para Generar XML
                    {hasAIEnhancements && <Brain className="h-4 w-4 text-purple-600" />}
                  </h3>
                  <p className="text-sm text-green-600">
                    {hasAIEnhancements 
                      ? 'Validada con IA - Sin errores detectados' 
                      : 'Todos los datos requeridos han sido completados'
                    }
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleSaveTemplate}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Guardar Plantilla</span>
                </Button>
                <Button 
                  type="button"
                  onClick={() => handleNextStep('xml')}
                  className="flex items-center space-x-2"
                >
                  <Stamp className="h-4 w-4" />
                  <span>Generar XML y Timbrar</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog para guardar plantilla */}
      <GuardarPlantillaDialog
        open={showGuardarPlantilla}
        onClose={() => setShowGuardarPlantilla(false)}
        cartaPorteData={cartaPorteData}
      />
    </div>
  );
}
