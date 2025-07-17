import { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, Check, Route, Package, MapPin, Users, Truck, Save, FileText } from 'lucide-react';
import { ViajeWizardMision } from './wizard/ViajeWizardMision';
import { ViajeWizardRuta } from './wizard/ViajeWizardRuta';
import { ViajeWizardActivos } from './wizard/ViajeWizardActivos';
import { ViajeWizardResumen } from './wizard/ViajeWizardResumen';
import { WizardTutorial } from '@/components/onboarding/WizardTutorial';
import { toast } from 'sonner';
import { useViajes } from '@/hooks/useViajes';
import { ViajeCartaPorteService } from '@/services/viajes/ViajeCartaPorteService';
import { ViajeWizardValidacionesEnhanced } from './wizard/ViajeWizardValidacionesEnhanced';
import { AdaptiveFlowProvider, FlowModeSelector } from './wizard/AdaptiveFlowManager';
import { ValidationProvider } from '@/contexts/ValidationProvider';
import { useOnboarding } from '@/contexts/OnboardingProvider';

export interface ViajeWizardData {
  // Paso A: Misión
  cliente?: any;
  tipoServicio?: 'flete_pagado' | 'traslado_propio';
  descripcionMercancia?: string;
  claveBienesTransp?: string;
  categoriaMercancia?: string;
  fraccionArancelaria?: string;
  // Paso B: Ruta
  origen?: any;
  destino?: any;
  distanciaRecorrida?: number;
  // Paradas autorizadas
  tieneParadasAutorizadas?: boolean;
  paradasAutorizadas?: Array<{
    id: string;
    nombre: string;
    direccion: string;
    coordenadas?: { latitud: number; longitud: number };
    codigoPostal?: string;
    orden: number;
  }>;
  // Paso C: Activos
  vehiculo?: any;
  conductor?: any;
  remolque?: any;
  // Fechas del viaje
  fechaInicio?: string;
  fechaFin?: string;
  // Estado general
  currentStep: number;
  isValid: boolean;
  // Validaciones específicas
  clienteRfcValido?: boolean;
}

const STEPS = [
  {
    id: 1,
    title: 'Definir la Misión',
    subtitle: 'Cliente, mercancía y tipo de servicio',
    icon: Package
  },
  {
    id: 2,
    title: 'Establecer la Ruta',
    subtitle: 'Origen, destino y trazado',
    icon: MapPin
  },
  {
    id: 3,
    title: 'Asignar Activos',
    subtitle: 'Vehículo y conductor',
    icon: Truck
  },
  {
    id: 4,
    title: 'Validaciones Avanzadas',
    subtitle: 'Cumplimiento SAT 3.1',
    icon: CheckCircle
  },
  {
    id: 5,
    title: 'Confirmar y Despachar',
    subtitle: 'Resumen y emisión de documentos',
    icon: Route
  }
];

interface ViajeWizardProps {
  onCancel?: () => void
  onComplete?: () => void
  borradorId?: string // NUEVO: Para cargar un borrador existente
}

export interface ViajeWizardHandle {
  requestClose: () => void
}

export const ViajeWizard = forwardRef<ViajeWizardHandle, ViajeWizardProps>(function ViajeWizard({ onCancel, onComplete, borradorId }: ViajeWizardProps, ref) {
  const navigate = useNavigate();
  const { 
    crearViaje, 
    isCreatingViaje, 
    guardarBorradorViaje, 
    isSavingDraft,
    cargarBorrador,
    borradorActivo,
    loadingBorrador,
    eliminarBorrador,
    convertirBorradorAViaje,
    isConvertingDraft
  } = useViajes();
  
  const { 
    startWizardTutorial, 
    isWizardTutorialActive,
    wizardStep 
  } = useOnboarding();
  
  const [data, setData] = useState<ViajeWizardData>({
    currentStep: 1,
    isValid: false,
    clienteRfcValido: false
  });
  
  const [isGeneratingDocuments, setIsGeneratingDocuments] = useState(false);
  const [viajeConfirmado, setViajeConfirmado] = useState(false);
  const [tutorialStarted, setTutorialStarted] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(borradorId || null);
  const [initialSnapshot, setInitialSnapshot] = useState(JSON.stringify({ currentStep: 1 }));
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [showBorradorOptions, setShowBorradorOptions] = useState(false);

  // Cargar borrador existente al inicializar
  useEffect(() => {
    const loadExistingDraft = async () => {
      // Si se pasó un borradorId específico, cargarlo
      if (borradorId) {
        console.log('🔄 Cargando borrador específico:', borradorId);
        const borradorData = await cargarBorrador(borradorId);
        if (borradorData) {
          setData(borradorData);
          setCurrentDraftId(borradorId);
          setInitialSnapshot(JSON.stringify(borradorData));
          toast.success('Borrador cargado exitosamente');
        }
      }
      // Si no hay borradorId pero existe un borrador activo, preguntar si cargarlo
      else if (borradorActivo && !loadingBorrador) {
        console.log('🔍 Borrador activo encontrado:', borradorActivo.id);
        setShowBorradorOptions(true);
      }
    };

    loadExistingDraft();
  }, [borradorId, borradorActivo, loadingBorrador, cargarBorrador]);

  // Iniciar tutorial solo la primera vez que se abre el wizard
  useEffect(() => {
    const hasStartedTutorial = sessionStorage.getItem('wizard_tutorial_started');
    const neverShow = localStorage.getItem('never_show_wizard_tutorial');
    
    if (!hasStartedTutorial && neverShow !== 'true' && !tutorialStarted) {
      console.log('🎓 Starting wizard tutorial for first-time user in ViajeWizard');
      startWizardTutorial();
      setTutorialStarted(true);
      sessionStorage.setItem('wizard_tutorial_started', 'true');
    }
  }, [startWizardTutorial, tutorialStarted]);

  const updateData = (updates: Partial<ViajeWizardData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  useEffect(() => {
    setHasUnsavedChanges(JSON.stringify(data) !== initialSnapshot);
  }, [data, initialSnapshot]);

  // Cargar borrador activo
  const handleCargarBorradorActivo = async () => {
    if (borradorActivo) {
      const borradorData = await cargarBorrador(borradorActivo.id);
      if (borradorData) {
        setData(borradorData);
        setCurrentDraftId(borradorActivo.id);
        setInitialSnapshot(JSON.stringify(borradorData));
        setShowBorradorOptions(false);
        toast.success('Borrador cargado exitosamente');
      }
    }
  };

  // Crear nuevo viaje (ignorar borrador)
  const handleCrearNuevoViaje = () => {
    setShowBorradorOptions(false);
    // El wizard ya está limpio, solo cerramos el diálogo
  };

  // Eliminar borrador activo
  const handleEliminarBorrador = () => {
    if (borradorActivo) {
      eliminarBorrador(borradorActivo.id);
      setShowBorradorOptions(false);
    }
  };

  const canAdvance = () => {
    switch (data.currentStep) {
      case 1:
        // Validación estricta: todos los campos requeridos Y RFC válido
        const hasBasicData = data.cliente && data.tipoServicio && data.descripcionMercancia;
        const hasValidRfc = data.clienteRfcValido === true;
        
        // Solo permitir avanzar si tiene datos básicos Y RFC válido
        return hasBasicData && hasValidRfc;
      case 2:
        return data.origen && data.destino;
      case 3:
        return data.vehiculo && data.conductor;
      case 4:
        return true; // Las validaciones se manejan internamente
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canAdvance() && data.currentStep < 5) {
      updateData({ currentStep: data.currentStep + 1 });
    }
  };

  const handlePrevious = () => {
    if (data.currentStep > 1) {
      updateData({ currentStep: data.currentStep - 1 });
    }
  };

  // Guardar borrador - MEJORADO
  const handleSaveDraft = async () => {
    try {
      const result = await guardarBorradorViaje({ 
        wizardData: data, 
        borradorId: currentDraftId || undefined 
      });
      
      setCurrentDraftId(result.id);
      setInitialSnapshot(JSON.stringify(data));
      setHasUnsavedChanges(false);
      
      console.log('💾 Borrador guardado con ID:', result.id);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  // Guardar y salir - MEJORADO
  const handleSaveAndExit = async () => {
    try {
      await handleSaveDraft();
      toast.success('Borrador guardado. Puedes continuar editándolo más tarde.', {
        duration: 4000,
        action: {
          label: 'Continuar editando',
          onClick: () => {
            // El modal ya está abierto, no hacer nada
          }
        }
      });
      forceClose();
    } catch (error) {
      console.error('Error saving and exiting:', error);
    }
  };

  const forceClose = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate('/viajes');
    }
  };

  const handleRequestClose = () => {
    if (hasUnsavedChanges) {
      setExitDialogOpen(true);
    } else {
      forceClose();
    }
  };

  useImperativeHandle(ref, () => ({
    requestClose: handleRequestClose
  }));

  // Finalizar viaje (convertir borrador o crear nuevo)
  const handleConfirmarViaje = async () => {
    // Prevenir múltiples ejecuciones
    if (isGeneratingDocuments || isCreatingViaje || viajeConfirmado || isConvertingDraft) {
      console.log('🚫 Proceso ya en curso, ignorando clic adicional');
      return;
    }

    try {
      setIsGeneratingDocuments(true);
      console.log('🚛 Iniciando proceso de confirmación de viaje...');

      let nuevoViaje;

      // Si es un borrador existente, convertirlo a viaje
      if (currentDraftId) {
        console.log('📝 Convirtiendo borrador a viaje programado...');
        nuevoViaje = await new Promise<any>((resolve, reject) => {
          convertirBorradorAViaje(currentDraftId, {
            onSuccess: (viaje) => {
              console.log('✅ Borrador convertido con ID:', viaje.id);
              resolve(viaje);
            },
            onError: (error) => {
              console.error('❌ Error convirtiendo borrador:', error);
              reject(error);
            }
          });
        });
      } else {
        // Crear nuevo viaje
        console.log('📝 Creando nuevo viaje...');
        nuevoViaje = await new Promise<any>((resolve, reject) => {
          crearViaje(data, {
            onSuccess: (viaje) => {
              console.log('✅ Viaje creado con ID:', viaje.id);
              resolve(viaje);
            },
            onError: (error) => {
              console.error('❌ Error creando viaje:', error);
              reject(error);
            }
          });
        });
      }

      // Marcar como confirmado para prevenir duplicados
      setViajeConfirmado(true);

      // 2. Generar borrador de Carta Porte desde el viaje
      console.log('📄 Generando borrador de Carta Porte...');
      const resultado = await ViajeCartaPorteService.crearBorradorDesdeViaje(
        nuevoViaje.id,
        data
      );

      console.log('✅ Borrador creado exitosamente');
      toast.success('Viaje programado correctamente', {
        description: `Se generó el borrador de carta porte. ID: ${resultado.borrador_id}`,
        duration: 8000,
        action: {
          label: 'Abrir Carta Porte',
          onClick: () => {
            navigate(`/carta-porte/editor/${resultado.borrador_id}`);
          }
        }
      });
      setInitialSnapshot(JSON.stringify(data));
      setHasUnsavedChanges(false);

      // 3. Redirigir después de un breve delay
      setTimeout(() => {
        if (onComplete) {
          onComplete();
        } else {
          navigate(`/carta-porte/editor/${resultado.borrador_id}`);
        }
      }, 3000);

    } catch (error) {
      console.error('❌ Error en proceso de confirmación:', error);
      toast.error('Error al programar el viaje: ' + (error as Error).message);
      setViajeConfirmado(false); // Permitir retry en caso de error
    } finally {
      setIsGeneratingDocuments(false);
    }
  };

  const renderStepContent = () => {
    switch (data.currentStep) {
      case 1:
        return (
          <div data-onboarding="cliente-section">
            <ViajeWizardMision data={data} updateData={updateData} />
          </div>
        );
      case 2:
        return (
          <div data-onboarding="ruta-section">
            <ViajeWizardRuta data={data} updateData={updateData} />
          </div>
        );
      case 3:
        return (
          <div data-onboarding="activos-section">
            <ViajeWizardActivos data={data} updateData={updateData} />
          </div>
        );
      case 4:
        return <ViajeWizardValidacionesEnhanced data={data} updateData={updateData} onNext={handleNext} onPrev={handlePrevious} />;
      case 5:
        return <ViajeWizardResumen data={data} onConfirm={handleConfirmarViaje} />;
      default:
        return null;
    }
  };

  const currentStepInfo = STEPS.find(step => step.id === data.currentStep);
  const progress = (data.currentStep / STEPS.length) * 100;
  const isProcessing = isCreatingViaje || isGeneratingDocuments || isConvertingDraft;

  // Obtener mensaje de validación específico para el paso 1
  const getStep1ValidationMessage = () => {
    if (data.currentStep !== 1) return null;
    
    if (!data.cliente) {
      return "Selecciona un cliente para continuar";
    }
    
    if (!data.tipoServicio) {
      return "Selecciona el tipo de servicio";
    }
    
    if (!data.descripcionMercancia) {
      return "Describe la mercancía a transportar";
    }
    
    if (data.clienteRfcValido === false) {
      return "El RFC del cliente debe ser válido para continuar";
    }
    
    return null;
  };

  return (
    <AdaptiveFlowProvider>
      <ValidationProvider>
        <div className="container mx-auto py-6 max-w-4xl">
          {/* Tutorial Component - Solo aparece si está activo */}
          {isWizardTutorialActive && (
            <WizardTutorial 
              currentWizardStep={data.currentStep}
              onNext={() => {
                // Tutorial navigation logic if needed
              }}
              onSkip={() => {
                console.log('Tutorial skipped by user');
              }}
            />
          )}

          {/* Header del Wizard */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Route className="h-6 w-6 text-blue-600" />
                <div>
                  <h1 className="text-2xl font-bold">
                    {currentDraftId ? 'Continuar Viaje' : 'Programar Nuevo Viaje'}
                  </h1>
                  {currentDraftId && (
                    <p className="text-sm text-blue-600 mt-1">
                      📝 Editando borrador guardado
                    </p>
                  )}
                  {isWizardTutorialActive && (
                    <p className="text-sm text-blue-600 mt-1">
                      🎓 Tutorial activo - Te guiaremos paso a paso
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleRequestClose}
                disabled={isProcessing || viajeConfirmado}
              >
                Cancelar
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Paso {data.currentStep} de {STEPS.length}</span>
                <span>{Math.round(progress)}% completado</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>

            {/* Indicador de Estado */}
            {(isProcessing || viajeConfirmado) && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-medium">
                    {isCreatingViaje && 'Registrando viaje en sistema...'}
                    {isConvertingDraft && 'Convirtiendo borrador a viaje...'}
                    {isGeneratingDocuments && !isCreatingViaje && !isConvertingDraft && 'Generando documentos fiscales...'}
                    {viajeConfirmado && !isProcessing && 'Viaje confirmado exitosamente'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Flow Mode Selector - Solo mostrar en el primer paso */}
          {data.currentStep === 1 && <FlowModeSelector />}

          {/* Mobile Stepper */}
          <div className="md:hidden mb-6">
            <div className="relative flex items-center justify-between mobile-stepper">
              <div className="absolute left-0 right-0 top-1/2 h-1 bg-gray-200 rounded-full progress-track"></div>
              <div
                className="absolute left-0 top-1/2 h-1 bg-blue-interconecta rounded-full progress-bar"
                style={{ width: `${progress}%` }}
              ></div>
              {STEPS.map((step) => {
                const isActive = step.id === data.currentStep;
                const isCompleted = step.id < data.currentStep;
                const Icon = step.icon;
                return (
                  <div key={step.id} className="relative z-10 flex-1 text-center">
                    <div
                      className={`mx-auto flex items-center justify-center w-6 h-6 rounded-full border-2 ${
                        isCompleted
                          ? 'bg-blue-interconecta border-blue-interconecta text-pure-white'
                          : isActive
                          ? 'border-blue-interconecta text-blue-interconecta bg-pure-white'
                          : 'border-gray-300 text-gray-400 bg-pure-white'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-center text-sm font-medium">{currentStepInfo?.title}</p>
          </div>

          {/* Steps Navigation */}
          <div className="hidden md:grid grid-cols-5 gap-4 mb-6" data-onboarding="wizard-steps">
            {STEPS.map((step) => {
              const isActive = step.id === data.currentStep;
              const isCompleted = step.id < data.currentStep;
              const Icon = step.icon;

              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    isActive
                      ? 'border-blue-500 bg-blue-50'
                      : isCompleted
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                  data-onboarding={step.id === 4 ? "validaciones-step" : undefined}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`h-4 w-4 ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      isActive ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                  </div>
                  <p className={`text-xs ${
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {step.subtitle}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Main Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                {currentStepInfo && <currentStepInfo.icon className="h-5 w-5" />}
                {currentStepInfo?.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>
          </Card>

          {/* Navigation Buttons - Solo mostrar si no es el paso de validaciones */}
          {data.currentStep !== 4 && data.currentStep !== 5 && (
            <div className="flex justify-between mt-6 mobile-action-row">
              <div className="flex items-center gap-2 mobile-secondary-group">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={data.currentStep === 1 || isProcessing || viajeConfirmado}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>

                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={isSavingDraft || isProcessing}
                  className="flex items-center gap-2 mobile-secondary-action"
                >
                  <Save className="h-4 w-4" />
                  {isSavingDraft ? 'Guardando...' : 'Guardar Borrador'}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleSaveAndExit}
                  disabled={isSavingDraft || isProcessing}
                  className="flex items-center gap-2 mobile-secondary-action"
                >
                  <FileText className="h-4 w-4" />
                  Guardar y Salir
                </Button>
              </div>

              <div className="flex flex-col items-end gap-2">
                {/* Mensaje de validación específico */}
                {getStep1ValidationMessage() && (
                  <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md border border-red-200">
                    {getStep1ValidationMessage()}
                  </div>
                )}

                <Button
                  onClick={handleNext}
                  disabled={!canAdvance() || isProcessing || viajeConfirmado}
                  data-onboarding={data.currentStep === 1 ? "next-step-btn" : undefined}
                  className={!canAdvance() ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Diálogo de opciones de borrador */}
        <AlertDialog open={showBorradorOptions} onOpenChange={setShowBorradorOptions}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Continuar con borrador anterior?</AlertDialogTitle>
              <AlertDialogDescription>
                Tienes un borrador guardado de un viaje anterior. ¿Quieres continuar editándolo o crear un nuevo viaje?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleEliminarBorrador} className="bg-red-50 text-red-700 hover:bg-red-100">
                Eliminar Borrador
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleCrearNuevoViaje} className="bg-gray-100 text-gray-700 hover:bg-gray-200">
                Crear Nuevo Viaje
              </AlertDialogAction>
              <AlertDialogAction onClick={handleCargarBorradorActivo}>
                Continuar Borrador
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Diálogo de salir sin guardar */}
        <AlertDialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Deseas salir sin guardar?</AlertDialogTitle>
              <AlertDialogDescription>
                Hemos detectado cambios que no se han guardado. ¿Estás seguro de que quieres salir?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Continuar Editando</AlertDialogCancel>
              <AlertDialogAction onClick={forceClose} className="bg-red-600 text-white hover:bg-red-700">
                Salir sin Guardar
              </AlertDialogAction>
              <AlertDialogAction onClick={handleSaveAndExit}>Guardar y Salir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </ValidationProvider>
    </AdaptiveFlowProvider>
  );
});
