import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useCartasPorte } from '@/hooks/useCartasPorte';
import { useUbicacionesPersistence } from '@/hooks/useUbicacionesPersistence';
import { useMercanciasPersistence } from '@/hooks/useMercanciasPersistence';
import { ConfiguracionInicial } from './ConfiguracionInicial';
import { UbicacionesSection } from './UbicacionesSection';
import { MercanciasSection } from './MercanciasSection';
import { AutotransporteSection } from './AutotransporteSection';
import { FigurasTransporteSection } from './FigurasTransporteSection';
import { XMLGenerationPanel } from './xml/XMLGenerationPanel';
import { GuardarPlantillaDialog } from './plantillas/GuardarPlantillaDialog';
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

export function CartaPorteForm() {
  const [activeStep, setActiveStep] = useState('configuracion');
  const [showGuardarPlantilla, setShowGuardarPlantilla] = useState(false);
  const [cartaPorteId, setCartaPorteId] = useState<string>();
  const [formData, setFormData] = useState<CartaPorteData>({
    tipoCreacion: 'manual',
    tipoCfdi: 'Traslado',
    rfcEmisor: '',
    nombreEmisor: '',
    rfcReceptor: '',
    nombreReceptor: '',
    transporteInternacional: false,
    registroIstmo: false,
    ubicaciones: [],
    mercancias: [],
    autotransporte: {},
    figuras: [],
  });

  // Hooks de persistencia
  const { crearCartaPorte, actualizarCartaPorte, isCreating, isUpdating } = useCartasPorte();
  const { guardarUbicaciones } = useUbicacionesPersistence(cartaPorteId);
  const { guardarMercancias } = useMercanciasPersistence(cartaPorteId);

  // Auto-guardar cuando se completa la configuración inicial
  useEffect(() => {
    if (formData.rfcEmisor && formData.rfcReceptor && !cartaPorteId) {
      crearCartaPorte(formData, {
        onSuccess: (nuevaCartaPorte) => {
          setCartaPorteId(nuevaCartaPorte.id);
          setFormData(prev => ({ ...prev, cartaPorteId: nuevaCartaPorte.id }));
        }
      });
    }
  }, [formData.rfcEmisor, formData.rfcReceptor, cartaPorteId, crearCartaPorte]);

  // Auto-guardar ubicaciones cuando cambian
  useEffect(() => {
    if (cartaPorteId && formData.ubicaciones.length > 0) {
      const timer = setTimeout(() => {
        guardarUbicaciones(formData.ubicaciones);
      }, 1000); // Debounce de 1 segundo

      return () => clearTimeout(timer);
    }
  }, [formData.ubicaciones, cartaPorteId, guardarUbicaciones]);

  // Auto-guardar mercancías cuando cambian
  useEffect(() => {
    if (cartaPorteId && formData.mercancias.length > 0) {
      const timer = setTimeout(() => {
        guardarMercancias(formData.mercancias);
      }, 1000); // Debounce de 1 segundo

      return () => clearTimeout(timer);
    }
  }, [formData.mercancias, cartaPorteId, guardarMercancias]);

  const updateFormData = (section: string, data: any) => {
    if (section === 'configuracion') {
      const newData = { ...formData, ...data };
      setFormData(newData);
      
      // Actualizar carta porte si ya existe
      if (cartaPorteId) {
        actualizarCartaPorte({ id: cartaPorteId, data: newData });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: data,
      }));
    }
  };

  const getStepProgress = () => {
    const currentIndex = steps.findIndex(step => step.id === activeStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const isStepComplete = (stepId: string) => {
    switch (stepId) {
      case 'configuracion':
        return formData.rfcEmisor && formData.rfcReceptor;
      case 'ubicaciones':
        return formData.ubicaciones.length >= 2; // Al menos origen y destino
      case 'mercancias':
        return formData.mercancias.length > 0;
      case 'autotransporte':
        return formData.autotransporte.placaVm;
      case 'figuras':
        return formData.figuras.length > 0;
      case 'xml':
        return true; // Siempre disponible si los pasos anteriores están completos
      default:
        return false;
    }
  };

  const getTotalProgress = () => {
    const completedSteps = steps.slice(0, -1).filter(step => isStepComplete(step.id)).length;
    return (completedSteps / (steps.length - 1)) * 100;
  };

  const canSaveAsTemplate = () => {
    // Debe tener al menos configuración básica y una ubicación
    return isStepComplete('configuracion') && formData.ubicaciones.length > 0;
  };

  const canGenerateXML = () => {
    // Verificar que todos los pasos obligatorios estén completos
    return ['configuracion', 'ubicaciones', 'mercancias', 'autotransporte', 'figuras']
      .every(step => isStepComplete(step));
  };

  const handleXMLGenerated = (xml: string) => {
    console.log('XML generado exitosamente', xml.length, 'caracteres');
    // Aquí puedes manejar el XML generado si necesitas hacer algo específico
  };

  const handleTimbrado = (datos: any) => {
    console.log('Carta Porte timbrada exitosamente:', datos);
    // Aquí puedes manejar los datos del timbrado
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header con progreso */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              Nueva Carta Porte 3.1
              {cartaPorteId && (
                <span className="text-sm font-normal text-green-600 ml-2">
                  ✓ Guardando automáticamente
                </span>
              )}
            </CardTitle>
            <div className="flex items-center space-x-4">
              {canSaveAsTemplate() && (
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setShowGuardarPlantilla(true)}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Guardar como Plantilla</span>
                </Button>
              )}
              <div className="text-sm text-muted-foreground">
                Progreso: {Math.round(getTotalProgress())}%
              </div>
            </div>
          </div>
          <Progress value={getTotalProgress()} className="w-full" />
        </CardHeader>
      </Card>

      {/* Navegación por pasos */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeStep} onValueChange={setActiveStep} className="w-full">
            <TabsList className="grid w-full grid-cols-6 h-auto">
              {steps.map((step) => {
                const Icon = step.icon;
                const isComplete = isStepComplete(step.id);
                
                return (
                  <TabsTrigger
                    key={step.id}
                    value={step.id}
                    className="flex flex-col items-center p-4 space-y-2"
                    disabled={step.id === 'xml' && !canGenerateXML()}
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
              })}
            </TabsList>

            <div className="p-6">
              <TabsContent value="configuracion">
                <ConfiguracionInicial
                  data={formData}
                  onChange={(data) => updateFormData('configuracion', data)}
                  onNext={() => setActiveStep('ubicaciones')}
                />
              </TabsContent>

              <TabsContent value="ubicaciones">
                <UbicacionesSection
                  data={formData.ubicaciones}
                  onChange={(data) => updateFormData('ubicaciones', data)}
                  onNext={() => setActiveStep('mercancias')}
                  onPrev={() => setActiveStep('configuracion')}
                />
              </TabsContent>

              <TabsContent value="mercancias">
                <MercanciasSection
                  data={formData.mercancias}
                  ubicaciones={formData.ubicaciones}
                  onChange={(data) => updateFormData('mercancias', data)}
                  onNext={() => setActiveStep('autotransporte')}
                  onPrev={() => setActiveStep('ubicaciones')}
                />
              </TabsContent>

              <TabsContent value="autotransporte">
                <AutotransporteSection
                  data={formData.autotransporte}
                  onChange={(data) => updateFormData('autotransporte', data)}
                  onNext={() => setActiveStep('figuras')}
                  onPrev={() => setActiveStep('mercancias')}
                />
              </TabsContent>

              <TabsContent value="figuras">
                <FigurasTransporteSection
                  data={formData.figuras}
                  onChange={(data) => updateFormData('figuras', data)}
                  onPrev={() => setActiveStep('autotransporte')}
                  onFinish={() => setActiveStep('xml')}
                />
              </TabsContent>

              <TabsContent value="xml">
                <XMLGenerationPanel
                  cartaPorteData={formData}
                  cartaPorteId={cartaPorteId}
                  onXMLGenerated={handleXMLGenerated}
                  onTimbrado={handleTimbrado}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Acciones finales cuando está completo */}
      {canGenerateXML() && (
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
                  variant="outline"
                  onClick={() => setShowGuardarPlantilla(true)}
                  className="flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Guardar Plantilla</span>
                </Button>
                <Button 
                  onClick={() => setActiveStep('xml')}
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
