
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, CheckCircle, Route, Package, MapPin, Users, Truck } from 'lucide-react';
import { ViajeWizardMision } from './wizard/ViajeWizardMision';
import { ViajeWizardRuta } from './wizard/ViajeWizardRuta';
import { ViajeWizardActivos } from './wizard/ViajeWizardActivos';
import { ViajeWizardResumen } from './wizard/ViajeWizardResumen';
import { toast } from 'sonner';
import { useViajes } from '@/hooks/useViajes';
import { ViajeCartaPorteService } from '@/services/viajes/ViajeCartaPorteService';
import { ViajeWizardValidacionesEnhanced } from './wizard/ViajeWizardValidacionesEnhanced';
import { AdaptiveFlowProvider, FlowModeSelector } from './wizard/AdaptiveFlowManager';
import { ValidationProvider } from '@/contexts/ValidationProvider';

export interface ViajeWizardData {
  // Paso A: Misión
  cliente?: any;
  tipoServicio?: 'flete_pagado' | 'traslado_propio';
  descripcionMercancia?: string;
  // Paso B: Ruta
  origen?: any;
  destino?: any;
  distanciaRecorrida?: number;
  // Paso C: Activos
  vehiculo?: any;
  conductor?: any;
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

export function ViajeWizard() {
  const navigate = useNavigate();
  const { crearViaje, isCreatingViaje } = useViajes();
  const [data, setData] = useState<ViajeWizardData>({
    currentStep: 1,
    isValid: false,
    clienteRfcValido: false
  });
  const [isGeneratingDocuments, setIsGeneratingDocuments] = useState(false);
  const [viajeConfirmado, setViajeConfirmado] = useState(false);

  const updateData = (updates: Partial<ViajeWizardData>) => {
    setData(prev => ({ ...prev, ...updates }));
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

  const handleCancel = () => {
    navigate('/viajes');
  };

  const handleConfirmarViaje = async () => {
    // Prevenir múltiples ejecuciones
    if (isGeneratingDocuments || isCreatingViaje || viajeConfirmado) {
      console.log('🚫 Proceso ya en curso, ignorando clic adicional');
      return;
    }

    try {
      setIsGeneratingDocuments(true);
      console.log('🚛 Iniciando proceso de confirmación de viaje...');

      // 1. Crear el viaje primero
      console.log('📝 Paso 1: Creando viaje en base de datos...');
      const nuevoViaje = await new Promise<any>((resolve, reject) => {
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

      // Marcar como confirmado para prevenir duplicados
      setViajeConfirmado(true);

      // 2. Generar Carta Porte desde el viaje
      console.log('📄 Paso 2: Generando Carta Porte...');
      const resultado = await ViajeCartaPorteService.crearCartaPorteDesdeViaje(
        nuevoViaje.id,
        data
      );

      console.log('✅ Documentos generados exitosamente');
      toast.success('Viaje programado y documentos generados exitosamente');

      // 3. Redirigir después de un breve delay
      setTimeout(() => {
        navigate('/viajes', { 
          state: { 
            message: 'Viaje programado y documentos generados exitosamente',
            viajeId: nuevoViaje.id,
            cartaPorteId: resultado.carta_porte.id
          }
        });
      }, 2000);

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
        return <ViajeWizardMision data={data} updateData={updateData} />;
      case 2:
        return <ViajeWizardRuta data={data} updateData={updateData} />;
      case 3:
        return <ViajeWizardActivos data={data} updateData={updateData} />;
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
  const isProcessing = isCreatingViaje || isGeneratingDocuments;

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
          {/* Header del Wizard */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Route className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold">Programar Nuevo Viaje</h1>
              </div>
              <Button 
                variant="outline" 
                onClick={handleCancel} 
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
                    {isGeneratingDocuments && !isCreatingViaje && 'Generando documentos fiscales...'}
                    {viajeConfirmado && !isProcessing && 'Viaje confirmado exitosamente'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Flow Mode Selector - Solo mostrar en el primer paso */}
          {data.currentStep === 1 && <FlowModeSelector />}

          {/* Steps Navigation */}
          <div className="grid grid-cols-5 gap-4 mb-6" data-onboarding="wizard-steps">
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
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={data.currentStep === 1 || isProcessing || viajeConfirmado}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

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
      </ValidationProvider>
    </AdaptiveFlowProvider>
  );
}
