
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

interface CartaPorteFormProps {
  cartaPorteId?: string;
}

export function CartaPorteForm({ cartaPorteId }: CartaPorteFormProps) {
  const [activeStep, setActiveStep] = useState('configuracion');
  const [showGuardarPlantilla, setShowGuardarPlantilla] = useState(false);
  const [currentCartaPorteId, setCurrentCartaPorteId] = useState<string | undefined>(cartaPorteId);
  const [isLoading, setIsLoading] = useState(false);
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
  const { crearCartaPorte, actualizarCartaPorte, isCreating, isUpdating, cartasPorte } = useCartasPorte();
  const { guardarUbicaciones } = useUbicacionesPersistence(currentCartaPorteId);
  const { guardarMercancias } = useMercanciasPersistence(currentCartaPorteId);

  // Persistir estado en localStorage para evitar pérdidas
  useEffect(() => {
    const savedFormData = localStorage.getItem(`cartaporte-form-${currentCartaPorteId || 'new'}`);
    if (savedFormData && !cartaPorteId) {
      try {
        const parsed = JSON.parse(savedFormData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, [currentCartaPorteId, cartaPorteId]);

  // Auto-guardar en localStorage
  useEffect(() => {
    if (formData.rfcEmisor || formData.rfcReceptor) {
      localStorage.setItem(`cartaporte-form-${currentCartaPorteId || 'new'}`, JSON.stringify(formData));
    }
  }, [formData, currentCartaPorteId]);

  // Cargar datos existentes si estamos editando
  useEffect(() => {
    if (cartaPorteId && cartasPorte.length > 0) {
      setIsLoading(true);
      const cartaExistente = cartasPorte.find(carta => carta.id === cartaPorteId);
      
      if (cartaExistente) {
        setFormData(prev => ({
          ...prev,
          rfcEmisor: cartaExistente.rfc_emisor || '',
          nombreEmisor: cartaExistente.nombre_emisor || '',
          rfcReceptor: cartaExistente.rfc_receptor || '',
          nombreReceptor: cartaExistente.nombre_receptor || '',
          tipoCfdi: cartaExistente.tipo_cfdi as 'Ingreso' | 'Traslado' || 'Traslado',
          transporteInternacional: cartaExistente.transporte_internacional || false,
          registroIstmo: cartaExistente.registro_istmo || false,
          entrada_salida_merc: cartaExistente.entrada_salida_merc || '',
          pais_origen_destino: cartaExistente.pais_origen_destino || '',
          via_entrada_salida: cartaExistente.via_entrada_salida || '',
          cartaPorteId: cartaExistente.id,
        }));
        setCurrentCartaPorteId(cartaExistente.id);
      }
      setIsLoading(false);
    }
  }, [cartaPorteId, cartasPorte]);

  // Auto-guardar cuando se completa la configuración inicial
  useEffect(() => {
    if (formData.rfcEmisor && formData.rfcReceptor && !currentCartaPorteId && !cartaPorteId) {
      const cartaPortePayload = {
        tipo_cfdi: formData.tipoCfdi,
        rfc_emisor: formData.rfcEmisor,
        nombre_emisor: formData.nombreEmisor,
        rfc_receptor: formData.rfcReceptor,
        nombre_receptor: formData.nombreReceptor,
        transporte_internacional: formData.transporteInternacional,
        registro_istmo: formData.registroIstmo,
        entrada_salida_merc: formData.entrada_salida_merc,
        pais_origen_destino: formData.pais_origen_destino,
        via_entrada_salida: formData.via_entrada_salida,
      };

      crearCartaPorte(cartaPortePayload)
        .then((nuevaCartaPorte) => {
          setCurrentCartaPorteId(nuevaCartaPorte.id);
          setFormData(prev => ({ ...prev, cartaPorteId: nuevaCartaPorte.id }));
        })
        .catch((error) => {
          console.error('Error al crear carta porte:', error);
        });
    }
  }, [formData.rfcEmisor, formData.rfcReceptor, currentCartaPorteId, cartaPorteId, crearCartaPorte]);

  // Auto-guardar ubicaciones cuando cambian
  useEffect(() => {
    if (currentCartaPorteId && formData.ubicaciones.length > 0) {
      const timer = setTimeout(() => {
        guardarUbicaciones(formData.ubicaciones);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [formData.ubicaciones, currentCartaPorteId, guardarUbicaciones]);

  // Auto-guardar mercancías cuando cambian
  useEffect(() => {
    if (currentCartaPorteId && formData.mercancias.length > 0) {
      const timer = setTimeout(() => {
        guardarMercancias(formData.mercancias);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [formData.mercancias, currentCartaPorteId, guardarMercancias]);

  const updateFormData = (section: string, data: any) => {
    if (section === 'configuracion') {
      const newData = { ...formData, ...data };
      setFormData(newData);
      
      // Actualizar carta porte si ya existe
      if (currentCartaPorteId) {
        const updatePayload = {
          tipo_cfdi: newData.tipoCfdi,
          rfc_emisor: newData.rfcEmisor,
          nombre_emisor: newData.nombreEmisor,
          rfc_receptor: newData.rfcReceptor,
          nombre_receptor: newData.nombreReceptor,
          transporte_internacional: newData.transporteInternacional,
          registro_istmo: newData.registroIstmo,
          entrada_salida_merc: newData.entrada_salida_merc,
          pais_origen_destino: newData.pais_origen_destino,
          via_entrada_salida: newData.via_entrada_salida,
        };
        actualizarCartaPorte({ id: currentCartaPorteId, data: updatePayload });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: data,
      }));
    }
  };

  const handleTabChange = (value: string) => {
    // Prevenir navegación automática, solo cambiar si el usuario hace clic
    setActiveStep(value);
  };

  const handleNextStep = (targetStep: string) => {
    setActiveStep(targetStep);
  };

  const handlePrevStep = (targetStep: string) => {
    setActiveStep(targetStep);
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
        return formData.ubicaciones.length >= 2;
      case 'mercancias':
        return formData.mercancias.length > 0;
      case 'autotransporte':
        return formData.autotransporte.placaVm;
      case 'figuras':
        return formData.figuras.length > 0;
      case 'xml':
        return true;
      default:
        return false;
    }
  };

  const getTotalProgress = () => {
    const completedSteps = steps.slice(0, -1).filter(step => isStepComplete(step.id)).length;
    return (completedSteps / (steps.length - 1)) * 100;
  };

  const canSaveAsTemplate = () => {
    return isStepComplete('configuracion') && formData.ubicaciones.length > 0;
  };

  const canGenerateXML = () => {
    return ['configuracion', 'ubicaciones', 'mercancias', 'autotransporte', 'figuras']
      .every(step => isStepComplete(step));
  };

  const handleXMLGenerated = (xml: string) => {
    console.log('XML generado exitosamente', xml.length, 'caracteres');
  };

  const handleTimbrado = (datos: any) => {
    console.log('Carta Porte timbrada exitosamente:', datos);
  };

  const handleSaveTemplate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowGuardarPlantilla(true);
  };

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
              {canSaveAsTemplate() && (
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
          <Tabs value={activeStep} onValueChange={handleTabChange} className="w-full">
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
