
import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { ViajeConfirmationButton } from './ViajeConfirmationButton';

// Simple selector components for now
const ClienteSelect = ({ clienteSeleccionado, onClienteSeleccionado }: any) => (
  <div className="p-4 border rounded-lg">
    <p className="text-sm text-gray-600">Selector de cliente (por implementar)</p>
    <Button 
      onClick={() => onClienteSeleccionado({
        id: 'cliente-test',
        nombre_razon_social: 'Cliente de Prueba',
        rfc: 'XAXX010101000'
      })}
      variant="outline"
      className="mt-2"
    >
      Seleccionar Cliente de Prueba
    </Button>
  </div>
);

const UbicacionesStep = ({ origen, destino, onOrigenChange, onDestinoChange, onNext, onBack }: any) => (
  <div className="p-6 space-y-4">
    <div className="text-center">
      <h3 className="text-xl font-semibold mb-2">Definir Ruta</h3>
      <p className="text-gray-600">Establece origen y destino del viaje</p>
    </div>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Origen</label>
        <input
          type="text"
          className="w-full p-2 border rounded-lg"
          placeholder="Ciudad o dirección de origen"
          value={origen?.domicilio?.calle || ''}
          onChange={(e) => onOrigenChange({
            domicilio: { calle: e.target.value },
            fechaHoraSalidaLlegada: new Date().toISOString()
          })}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Destino</label>
        <input
          type="text"
          className="w-full p-2 border rounded-lg"
          placeholder="Ciudad o dirección de destino"
          value={destino?.domicilio?.calle || ''}
          onChange={(e) => onDestinoChange({
            domicilio: { calle: e.target.value },
            fechaHoraSalidaLlegada: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          })}
        />
      </div>
    </div>

    <div className="flex justify-between pt-4">
      <Button type="button" variant="outline" onClick={onBack}>
        <ChevronLeft className="h-4 w-4 mr-2" />
        Atrás
      </Button>
      <Button 
        onClick={onNext} 
        disabled={!origen?.domicilio?.calle || !destino?.domicilio?.calle}
      >
        Siguiente
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  </div>
);

const RecursosStep = ({ vehiculo, conductor, onVehiculoChange, onConductorChange, onNext, onBack }: any) => (
  <div className="p-6 space-y-4">
    <div className="text-center">
      <h3 className="text-xl font-semibold mb-2">Asignar Recursos</h3>
      <p className="text-gray-600">Selecciona vehículo y conductor</p>
    </div>

    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Vehículo</label>
        <Button 
          onClick={() => onVehiculoChange({
            id: 'vehiculo-test',
            placa: 'ABC-123',
            configuracion_vehicular: 'C2',
            peso_bruto_vehicular: 3500,
            anio: 2020,
            marca: 'Freightliner',
            modelo: 'Cascadia',
            tipo_carroceria: 'Caja seca',
            capacidad_carga: 28000,
            rendimiento: 3.5,
            tipo_combustible: 'Diesel',
            costo_mantenimiento_km: 2.07,
            costo_llantas_km: 1.08,
            valor_vehiculo: 1500000,
            configuracion_ejes: 'T3S2',
            factor_peajes: 2.0
          })}
          variant="outline"
          className="w-full"
        >
          {vehiculo ? `${vehiculo.placa} (${vehiculo.configuracion_vehicular})` : 'Seleccionar Vehículo'}
        </Button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Conductor</label>
        <Button 
          onClick={() => onConductorChange({
            id: 'conductor-test',
            nombre: 'Juan Pérez',
            rfc: 'PEPJ800101000',
            num_licencia: '123456',
            tipo_licencia: 'C',
            vigencia_licencia: '2025-12-31'
          })}
          variant="outline"
          className="w-full"
        >
          {conductor ? conductor.nombre : 'Seleccionar Conductor'}
        </Button>
      </div>
    </div>

    <div className="flex justify-between pt-4">
      <Button type="button" variant="outline" onClick={onBack}>
        <ChevronLeft className="h-4 w-4 mr-2" />
        Atrás
      </Button>
      <Button onClick={onNext} disabled={!vehiculo || !conductor}>
        Siguiente
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  </div>
);

const MercanciaStep = ({ descripcionMercancia, onDescripcionChange, onNext, onBack }: any) => (
  <div className="p-6 space-y-4">
    <div className="text-center">
      <h3 className="text-xl font-semibold mb-2">Descripción de Mercancía</h3>
      <p className="text-gray-600">Describe la mercancía a transportar</p>
    </div>

    <div>
      <label className="block text-sm font-medium mb-2">Descripción</label>
      <textarea
        className="w-full p-2 border rounded-lg"
        rows={4}
        placeholder="Describe la mercancía a transportar..."
        value={descripcionMercancia || ''}
        onChange={(e) => onDescripcionChange(e.target.value)}
      />
    </div>

    <div className="flex justify-between pt-4">
      <Button type="button" variant="outline" onClick={onBack}>
        <ChevronLeft className="h-4 w-4 mr-2" />
        Atrás
      </Button>
      <Button onClick={onNext} disabled={!descripcionMercancia}>
        Siguiente
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  </div>
);

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
    marca?: string;
    modelo?: string;
    tipo_carroceria?: string;
    capacidad_carga?: number;
    rendimiento?: number;
    tipo_combustible?: string;
    costo_mantenimiento_km?: number;
    costo_llantas_km?: number;
    valor_vehiculo?: number;
    configuracion_ejes?: string;
    factor_peajes?: number;
  };
  conductor?: {
    id: string;
    nombre: string;
    rfc?: string;
    num_licencia?: string;
    tipo_licencia?: string;
    vigencia_licencia?: string;
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
