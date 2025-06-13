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
import { useCartaPorteForm } from '@/hooks/useCartaPorteForm';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import { 
  FileText, 
  MapPin, 
  Package, 
  Truck, 
  Users,
  CheckCircle,
  Save,
  Stamp
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
  
  // Usar hook optimizado para el manejo del formulario
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
  } = useCartaPorteForm({ cartaPorteId });

  // Usar hook optimizado para navegación de pestañas
  const { activeStep, handleTabChange } = useTabNavigation({
    initialTab: 'configuracion',
    persistInURL: false,
  });

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

  // Memoizar validaciones complejas
  const canSaveAsTemplate = useMemo(() => {
    return stepValidations.configuracion && formData.ubicaciones.length > 0;
  }, [stepValidations.configuracion, formData.ubicaciones.length]);

  const canGenerateXML = useMemo(() => {
    return Object.entries(stepValidations)
      .filter(([key]) => key !== 'xml')
      .every(([, isValid]) => isValid);
  }, [stepValidations]);

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
      {/* Header con progreso */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              {cartaPorteId ? 'Editar Carta Porte 3.1' : 'Nueva Carta Porte 3.1'}
              {currentCartaPorteId && (
                <span className="text-sm font-normal text-green-600 ml-2">
                  ✓ Guardando automáticamente
                </span>
              )}
            </CardTitle>
            <div className="flex items-center space-x-4">
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
                Progreso: {Math.round(totalProgress)}%
              </div>
            </div>
          </div>
          <Progress value={totalProgress} className="w-full" />
        </CardHeader>
      </Card>

      {/* Navegación por pasos */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeStep} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-6 h-auto">
              {tabTriggers}
            </TabsList>

            <div className="p-6">
              <TabsContent value="configuracion">
                <ConfiguracionInicial
                  data={formData}
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
                  data={formData.autotransporte}
                  onChange={(data) => updateFormData('autotransporte', data)}
                  onNext={() => handleNextStep('figuras')}
                  onPrev={() => handlePrevStep('mercancias')}
                />
              </TabsContent>

              <TabsContent value="figuras">
                <FigurasTransporteSection
                  data={formData.figuras}
                  onChange={(data) => updateFormData('figuras', data)}
                  onPrev={() => handlePrevStep('autotransporte')}
                  onFinish={() => handleNextStep('xml')}
                />
              </TabsContent>

              <TabsContent value="xml">
                <XMLGenerationPanel
                  cartaPorteData={formData}
                  cartaPorteId={currentCartaPorteId}
                  onXMLGenerated={handleXMLGenerated}
                  onTimbrado={handleTimbrado}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Acciones finales cuando está completo */}
      {canGenerateXML && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">
                    Carta Porte Lista para Generar XML
                  </h3>
                  <p className="text-sm text-green-600">
                    Todos los datos requeridos han sido completados
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
        cartaPorteData={formData}
      />
    </div>
  );
}
