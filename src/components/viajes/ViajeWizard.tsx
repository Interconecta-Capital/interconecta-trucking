import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Step } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ClienteSelect } from '@/components/clientes/ClienteSelect';
import { VehiculoSelect } from '@/components/vehiculos/VehiculoSelect';
import { ConductorSelect } from '@/components/conductores/ConductorSelect';
import { toast } from 'sonner';
import { UbicacionesStep } from './steps/UbicacionesStep';
import { RecursosStep } from './steps/RecursosStep';
import { MercanciaStep } from './steps/MercanciaStep';
import { ViajeConfirmationButton } from './ViajeConfirmationButton';

export interface ViajeWizardData {
  currentStep: number;
  isValid: boolean;
  cliente?: {
    id: string;
    nombre_razon_social: string;
    rfc: string;
  };
  origen?: {
    domicilio: {
      calle: string;
    };
    direccion?: string;
    codigoPostal?: string;
    coordenadas?: {
      lat: number;
      lng: number;
    };
    fechaHoraSalidaLlegada: string;
  };
  destino?: {
    domicilio: {
      calle: string;
    };
    direccion?: string;
    codigoPostal?: string;
    coordenadas?: {
      lat: number;
      lng: number;
    };
    fechaHoraSalidaLlegada: string;
  };
  distanciaRecorrida?: number;
  vehiculo?: {
    id: string;
    placa: string;
    configuracion_vehicular: string;
    peso_bruto_vehicular: number;
    anio: number;
  };
  conductor?: {
    id: string;
    nombre: string;
    rfc?: string;
    num_licencia?: string;
    tipo_licencia?: string;
  };
  mercancias?: any[];
  descripcionMercancia?: string;
  tipoServicio?: string;
}

interface ViajeWizardProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

export interface ViajeWizardHandle {
  nextStep: () => void;
  prevStep: () => void;
  requestClose: () => void;
}

export const ViajeWizard = forwardRef<ViajeWizardHandle, ViajeWizardProps>(
  ({ onComplete, onCancel }, ref) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [wizardData, setWizardData] = useState<ViajeWizardData>({
      currentStep: 0,
      isValid: false,
    });

    const wizardRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      nextStep: () => handleStepChange(currentStep + 1),
      prevStep: () => handleStepChange(currentStep - 1),
      requestClose: () => {
        if (
          window.confirm(
            '¿Estás seguro de que quieres cancelar? Perderás los datos no guardados.'
          )
        ) {
          onCancel?.();
        }
      },
    }));

    const handleStepChange = (step: number) => {
      console.log(`Moving to step ${step}`);
      setCurrentStep(step);
    };

    const handleClienteChange = (cliente: ViajeWizardData['cliente']) => {
      setWizardData((prev) => ({ ...prev, cliente }));
    };

    const handleOrigenChange = (origen: ViajeWizardData['origen']) => {
      setWizardData((prev) => ({ ...prev, origen }));
    };

    const handleDestinoChange = (destino: ViajeWizardData['destino']) => {
      setWizardData((prev) => ({ ...prev, destino }));
    };

    const handleDistanciaChange = (distanciaRecorrida: number) => {
      setWizardData((prev) => ({ ...prev, distanciaRecorrida }));
    };

    const handleVehiculoChange = (vehiculo: ViajeWizardData['vehiculo']) => {
      setWizardData((prev) => ({ ...prev, vehiculo }));
    };

    const handleConductorChange = (conductor: ViajeWizardData['conductor']) => {
      setWizardData((prev) => ({ ...prev, conductor }));
    };

    const handleMercanciasChange = (mercancias: ViajeWizardData['mercancias']) => {
      setWizardData((prev) => ({ ...prev, mercancias }));
    };

    const handleDescripcionChange = (descripcionMercancia: string) => {
      setWizardData((prev) => ({ ...prev, descripcionMercancia }));
    };

    const handleTipoServicioChange = (tipoServicio: string) => {
      setWizardData((prev) => ({ ...prev, tipoServicio }));
    };

    const handleConfirmarViaje = async () => {
      console.log('🎯 Confirmando viaje desde wizard:', wizardData);
      
      try {
        setIsSubmitting(true);
        
        // Validaciones finales
        if (!wizardData.cliente) {
          toast.error('Debe seleccionar un cliente');
          return;
        }

        if (!wizardData.origen || !wizardData.destino) {
          toast.error('Debe definir origen y destino');
          return;
        }

        // La creación del viaje se maneja ahora en ViajeConfirmationButton
        console.log('✅ Wizard listo para confirmar viaje');
        
      } catch (error: any) {
        console.error('❌ Error en confirmación:', error);
        toast.error(error.message || 'Error al confirmar el viaje');
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleViajeCreado = () => {
      console.log('🎉 Viaje creado exitosamente desde wizard');
      onComplete?.();
    };

    const handleErrorCreacion = (error: string) => {
      console.error('❌ Error creando viaje desde wizard:', error);
      toast.error(error);
    };

    const totalSteps = 5;
    const progress = ((currentStep + 1) / totalSteps) * 100;

    return (
      <div className="viaje-wizard-container max-w-4xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Programar Nuevo Viaje
          </h2>
          <p className="text-muted-foreground">
            Completa todos los pasos para programar un nuevo viaje
          </p>
        </div>

        <Progress value={progress} className="h-2" />

        <div className="bg-white rounded-lg border shadow-sm">
          {currentStep === 0 && (
            <ClienteStep
              cliente={wizardData.cliente}
              onClienteChange={handleClienteChange}
              onNext={() => handleStepChange(1)}
            />
          )}

          {currentStep === 1 && (
            <UbicacionesStep
              origen={wizardData.origen}
              destino={wizardData.destino}
              distanciaRecorrida={wizardData.distanciaRecorrida}
              onOrigenChange={handleOrigenChange}
              onDestinoChange={handleDestinoChange}
              onDistanciaChange={handleDistanciaChange}
              onNext={() => handleStepChange(2)}
              onBack={() => handleStepChange(0)}
            />
          )}

          {currentStep === 2 && (
            <RecursosStep
              vehiculo={wizardData.vehiculo}
              conductor={wizardData.conductor}
              onVehiculoChange={handleVehiculoChange}
              onConductorChange={handleConductorChange}
              onNext={() => handleStepChange(3)}
              onBack={() => handleStepChange(1)}
            />
          )}

          {currentStep === 3 && (
            <MercanciaStep
              mercancias={wizardData.mercancias}
              descripcionMercancia={wizardData.descripcionMercancia}
              tipoServicio={wizardData.tipoServicio}
              onMercanciasChange={handleMercanciasChange}
              onDescripcionChange={handleDescripcionChange}
              onTipoServicioChange={handleTipoServicioChange}
              onNext={() => handleStepChange(4)}
              onBack={() => handleStepChange(2)}
            />
          )}

          {currentStep === 4 && (
            <div className="p-6 space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold mb-2">Confirmar Viaje</h3>
                <p className="text-gray-600">
                  Revise los datos y confirme la creación del viaje
                </p>
              </div>

              <ViajeConfirmationButton
                wizardData={wizardData}
                onSuccess={handleViajeCreado}
                onError={handleErrorCreacion}
                disabled={isSubmitting}
              />

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleStepChange(3)}
                  disabled={isSubmitting}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Atrás
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

ViajeWizard.displayName = 'ViajeWizard';

function ClienteStep({
  cliente,
  onClienteChange,
  onNext,
}: {
  cliente?: ViajeWizardData['cliente'];
  onClienteChange: (cliente: ViajeWizardData['cliente']) => void;
  onNext: () => void;
}) {
  return (
    <div className="p-6 space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Seleccionar Cliente</h3>
        <p className="text-gray-600">
          Selecciona el cliente para el viaje
        </p>
      </div>

      <ClienteSelect
        clienteSeleccionado={cliente}
        onClienteSeleccionado={onClienteChange}
      />

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} disabled={!cliente}>
          Siguiente
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
