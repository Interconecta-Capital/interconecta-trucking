
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { InfoIcon, Save, AlertTriangle, FileText, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConfiguracionInicial } from './ConfiguracionInicial';
import { UbicacionesSection } from './UbicacionesSection';
import { MercanciasSection } from './MercanciasSection';
import { AutotransporteSection } from './AutotransporteSection';
import { FigurasTransporteSection } from './FigurasTransporteSection';
import { XMLGenerationPanel } from './xml/XMLGenerationPanel';
import { AutotransporteCompleto, FiguraCompleta } from '@/types/cartaPorte';
import { BorradorService } from '@/services/borradorService';

export interface CartaPorteData {
  tipoRelacion: string;
  version: string;
  transporteInternacional: string;
  entradaSalidaMerc: string;
  viaTransporte: string;
  totalDistRec: number;
  // Additional fields needed by components
  tipoCreacion?: 'plantilla' | 'carga' | 'manual';
  cartaPorteVersion?: string;
  tipoCfdi?: string;
  rfcEmisor?: string;
  nombreEmisor?: string;
  rfcReceptor?: string;
  nombreReceptor?: string;
  registroIstmo?: boolean;
  mercancias?: any[];
}

interface CartaPorteFormData {
  configuracion: CartaPorteData;
  ubicaciones: any[];
  mercancias: any;
  autotransporte: AutotransporteCompleto;
  figuras: FiguraCompleta[];
}

interface Step {
  title: string;
  icon: React.ComponentType<any>;
  component: React.ReactNode;
}

export function CartaPorteForm() {
  const [configuracion, setConfiguracion] = useState<CartaPorteData>({
    tipoRelacion: '01',
    version: '3.0',
    transporteInternacional: 'No',
    entradaSalidaMerc: '',
    viaTransporte: '',
    totalDistRec: 0,
    tipoCreacion: 'manual',
    cartaPorteVersion: '3.1',
    tipoCfdi: 'T',
    rfcEmisor: '',
    nombreEmisor: '',
    rfcReceptor: '',
    nombreReceptor: '',
    registroIstmo: false,
    mercancias: [],
  });
  const [ubicaciones, setUbicaciones] = useState<any[]>([]);
  const [mercancias, setMercancias] = useState<any>(null);
  const [autotransporte, setAutotransporte] = useState<AutotransporteCompleto>({
    placa_vm: '',
    anio_modelo_vm: 2023,
    config_vehicular: '',
    perm_sct: '',
    num_permiso_sct: '',
    asegura_resp_civil: '',
    poliza_resp_civil: '',
    asegura_med_ambiente: '',
    poliza_med_ambiente: '',
    remolques: [],
  });
  const [figuras, setFiguras] = useState<FiguraCompleta[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [xmlGenerated, setXmlGenerated] = useState<string>('');
  const [timbradoData, setTimbradoData] = useState<any>(null);
  const [currentCartaPorteId, setCurrentCartaPorteId] = useState<string | undefined>(undefined);
  
  const [datosFormulario, setDatosFormulario] = useState<any>({});
  const [borradorCargado, setBorradorCargado] = useState(false);
  const [ultimoGuardado, setUltimoGuardado] = useState<Date | null>(null);

  const { toast } = useToast();

  // Cargar borrador al inicializar
  useEffect(() => {
    const borrador = BorradorService.cargarUltimoBorrador();
    if (borrador && !borradorCargado) {
      setDatosFormulario(borrador.datosFormulario);
      setBorradorCargado(true);
      toast({
        title: "Borrador cargado",
        description: `Se ha cargado un borrador guardado el ${new Date(borrador.ultimaModificacion).toLocaleString()}`,
      });
    }
  }, [borradorCargado, toast]);

  // Iniciar guardado automático
  useEffect(() => {
    const getDatos = () => ({
      configuracion: configuracion,
      ubicaciones: ubicaciones,
      mercancias: mercancias,
      autotransporte: autotransporte,
      figuras: figuras,
      currentStep: currentStep
    });

    const onSave = () => {
      setUltimoGuardado(new Date());
    };

    BorradorService.iniciarGuardadoAutomatico(onSave, getDatos);

    return () => {
      BorradorService.detenerGuardadoAutomatico();
    };
  }, [configuracion, ubicaciones, mercancias, autotransporte, figuras, currentStep]);

  // Actualizar datos del formulario cuando cambien
  useEffect(() => {
    setDatosFormulario({
      configuracion,
      ubicaciones,
      mercancias,
      autotransporte,
      figuras,
      currentStep
    });
  }, [configuracion, ubicaciones, mercancias, autotransporte, figuras, currentStep]);

  // Enhanced onChange handler for configuracion
  const handleConfiguracionChange = (data: Partial<CartaPorteData>) => {
    setConfiguracion(prev => ({ ...prev, ...data }));
  };

  const handleGuardarBorrador = async () => {
    await BorradorService.guardarBorradorAutomatico(datosFormulario);
    setUltimoGuardado(new Date());
    toast({
      title: "Borrador guardado",
      description: "El borrador ha sido guardado correctamente.",
    });
  };

  const handleLimpiarBorrador = () => {
    BorradorService.limpiarBorrador();
    toast({
      title: "Borrador eliminado",
      description: "El borrador ha sido eliminado.",
    });
  };

  const steps: Step[] = [
    {
      title: 'Configuración',
      icon: FileText,
      component: (
        <ConfiguracionInicial
          data={configuracion}
          onChange={handleConfiguracionChange}
          onNext={() => setCurrentStep(1)}
        />
      ),
    },
    {
      title: 'Ubicaciones',
      icon: MapPin,
      component: (
        <UbicacionesSection
          data={ubicaciones}
          onChange={setUbicaciones}
          onNext={() => setCurrentStep(2)}
          onPrev={() => setCurrentStep(0)}
        />
      ),
    },
    {
      title: 'Mercancías',
      icon: AlertTriangle,
      component: (
        <MercanciasSection
          data={mercancias}
          onChange={setMercancias}
          onNext={() => setCurrentStep(3)}
          onPrev={() => setCurrentStep(1)}
        />
      ),
    },
    {
      title: 'Autotransporte',
      icon: InfoIcon,
      component: (
        <AutotransporteSection
          data={autotransporte}
          onChange={setAutotransporte}
          onNext={() => setCurrentStep(4)}
          onPrev={() => setCurrentStep(2)}
        />
      ),
    },
    {
      title: 'Figuras',
      icon: InfoIcon,
      component: (
        <FigurasTransporteSection
          data={figuras}
          onChange={setFiguras}
          onPrev={() => setCurrentStep(3)}
          onFinish={() => setCurrentStep(5)}
        />
      ),
    },
    {
      title: 'XML',
      icon: FileText,
      component: (
        <XMLGenerationPanel
          cartaPorteData={configuracion}
          cartaPorteId={currentCartaPorteId}
          onXMLGenerated={setXmlGenerated}
          onTimbrado={setTimbradoData}
        />
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nueva Carta Porte</h1>
            <p className="text-gray-600 mt-2">
              Crea un nuevo comprobante fiscal digital de carta porte
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {ultimoGuardado && (
              <div className="text-sm text-gray-500">
                <Save className="h-4 w-4 inline mr-1" />
                Guardado: {ultimoGuardado.toLocaleTimeString()}
              </div>
            )}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGuardarBorrador}
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Borrador
            </Button>
          </div>
        </div>

        {borradorCargado && (
          <Alert className="mb-4">
            <InfoIcon className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Se ha cargado un borrador previo. Los datos han sido restaurados.</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLimpiarBorrador}
              >
                Eliminar Borrador
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progreso del formulario</span>
            <span>{Math.round((currentStep / (steps.length - 1)) * 100)}%</span>
          </div>
          <Progress value={(currentStep / (steps.length - 1)) * 100} className="h-2" />
        </div>

        {/* Steps navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${
                  index === currentStep
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : index < currentStep
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-gray-50 border-gray-200 text-gray-500'
                }`}
              >
                <step.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{step.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Current step content */}
      <Card>
        <CardContent className="p-6">
          {steps[currentStep].component}
        </CardContent>
      </Card>

      {/* Auto-save indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Guardado automático activo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
