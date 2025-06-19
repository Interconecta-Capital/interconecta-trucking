
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useCartaPorteLifecycle } from '@/hooks/cartaPorte/useCartaPorteLifecycle';
import { useCartaPorteFormManager } from '@/hooks/carta-porte/useCartaPorteFormManager';
import { ConfiguracionSection } from '../ConfiguracionSection';
import { UbicacionesSection } from '../UbicacionesSection';
import { MercanciasSection } from '../MercanciasSection';
import { AutotransporteSection } from '../AutotransporteSection';
import { FigurasSection } from '../FigurasSection';
import { toast } from 'sonner';

interface OptimizedCartaPorteFormProps {
  cartaPorteId?: string;
}

export function OptimizedCartaPorteForm({ cartaPorteId }: OptimizedCartaPorteFormProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const currentId = cartaPorteId || id;

  // Use the comprehensive form manager
  const {
    configuracion,
    ubicaciones,
    mercancias,
    autotransporte,
    figuras,
    currentStep,
    setCurrentStep,
    handleConfiguracionChange,
    setUbicaciones,
    setMercancias,
    setAutotransporte,
    setFiguras,
    handleGuardarBorrador,
    validationSummary,
    isGuardando,
    borradorCargado
  } = useCartaPorteFormManager(currentId);

  const [nombreBorrador, setNombreBorrador] = useState('');

  // Initialize form data if it's empty
  useEffect(() => {
    if (!configuracion.rfcEmisor && !configuracion.rfcReceptor) {
      // Set default values to prevent undefined access
      handleConfiguracionChange({
        tipoCfdi: 'Traslado',
        transporteInternacional: 'No',
        cartaPorteVersion: '3.1',
        tipoCreacion: 'manual',
        rfcEmisor: '',
        nombreEmisor: '',
        rfcReceptor: '',
        nombreReceptor: ''
      });
    }
  }, [handleConfiguracionChange, configuracion]);

  const handleSave = async () => {
    try {
      await handleGuardarBorrador();
      toast.success('Borrador guardado exitosamente');
    } catch (error) {
      console.error('Error guardando:', error);
      toast.error('Error guardando el borrador');
    }
  };

  const steps = [
    {
      title: 'Configuración',
      component: ConfiguracionSection,
      key: 'configuracion',
      valid: validationSummary.configuracion
    },
    {
      title: 'Ubicaciones',
      component: UbicacionesSection,
      key: 'ubicaciones',
      valid: validationSummary.ubicaciones
    },
    {
      title: 'Mercancías',
      component: MercanciasSection,
      key: 'mercancias',
      valid: validationSummary.mercancias
    },
    {
      title: 'Autotransporte',
      component: AutotransporteSection,
      key: 'autotransporte',
      valid: validationSummary.autotransporte
    },
    {
      title: 'Figuras',
      component: FigurasSection,
      key: 'figuras',
      valid: validationSummary.figuras
    }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ConfiguracionSection
            data={configuracion}
            onChange={handleConfiguracionChange}
            onNext={() => setCurrentStep(1)}
            onPrev={() => {}}
          />
        );
      case 1:
        return (
          <UbicacionesSection
            data={ubicaciones}
            onChange={setUbicaciones}
            onNext={() => setCurrentStep(2)}
            onPrev={() => setCurrentStep(0)}
          />
        );
      case 2:
        return (
          <MercanciasSection
            data={mercancias}
            onChange={setMercancias}
            onNext={() => setCurrentStep(3)}
            onPrev={() => setCurrentStep(1)}
          />
        );
      case 3:
        return (
          <AutotransporteSection
            data={autotransporte}
            onChange={setAutotransporte}
            onNext={() => setCurrentStep(4)}
            onPrev={() => setCurrentStep(2)}
          />
        );
      case 4:
        return (
          <FigurasSection
            data={figuras}
            onChange={setFiguras}
            onNext={() => toast.success('Formulario completado')}
            onPrev={() => setCurrentStep(3)}
          />
        );
      default:
        return null;
    }
  };

  if (!borradorCargado && currentId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p>Cargando carta porte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/borradores')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>

              <div>
                <h1 className="text-xl font-bold">
                  {currentId ? 'Editar Carta Porte' : 'Nueva Carta Porte'}
                </h1>
                <p className="text-sm text-gray-600">
                  Paso {currentStep + 1} de {steps.length}: {steps[currentStep]?.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleSave}
                disabled={isGuardando}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isGuardando ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              {steps.map((step, index) => (
                <div key={step.key} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                      index <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step.valid ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : index <= currentStep ? (
                      index + 1
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className="w-12 h-px bg-gray-300 mx-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
}
