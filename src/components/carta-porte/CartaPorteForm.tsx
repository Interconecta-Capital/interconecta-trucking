
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ConfiguracionInicial } from './ConfiguracionInicial';
import { UbicacionesSection } from './UbicacionesSection';
import { MercanciasSection } from './MercanciasSection';
import { AutotransporteSection } from './AutotransporteSection';
import { FigurasTransporteSection } from './FigurasTransporteSection';
import { 
  FileText, 
  MapPin, 
  Package, 
  Truck, 
  Users,
  CheckCircle,
  AlertCircle
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
}

const steps = [
  { id: 'configuracion', label: 'Configuración', icon: FileText },
  { id: 'ubicaciones', label: 'Ubicaciones', icon: MapPin },
  { id: 'mercancias', label: 'Mercancías', icon: Package },
  { id: 'autotransporte', label: 'Transporte', icon: Truck },
  { id: 'figuras', label: 'Figuras', icon: Users },
];

export function CartaPorteForm() {
  const [activeStep, setActiveStep] = useState('configuracion');
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

  const updateFormData = (section: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: data,
    }));
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
      default:
        return false;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header con progreso */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              Nueva Carta Porte 3.1
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Progreso: {Math.round(getStepProgress())}%
            </div>
          </div>
          <Progress value={getStepProgress()} className="w-full" />
        </CardHeader>
      </Card>

      {/* Navegación por pasos */}
      <Card>
        <CardContent className="p-0">
          <Tabs value={activeStep} onValueChange={setActiveStep} className="w-full">
            <TabsList className="grid w-full grid-cols-5 h-auto">
              {steps.map((step) => {
                const Icon = step.icon;
                const isComplete = isStepComplete(step.id);
                
                return (
                  <TabsTrigger
                    key={step.id}
                    value={step.id}
                    className="flex flex-col items-center p-4 space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-5 w-5" />
                      {isComplete && (
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
                  onFinish={() => console.log('Generar XML', formData)}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
