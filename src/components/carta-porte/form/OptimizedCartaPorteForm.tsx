
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useCartaPorteLifecycle } from '@/hooks/cartaPorte/useCartaPorteLifecycle';
import { useCartaPorteFormSimplified } from '@/hooks/useCartaPorteFormSimplified';
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
  const { id } = useParams();
  const currentId = cartaPorteId || id;
  
  const {
    cargarBorrador,
    guardarBorrador,
    crearBorrador
  } = useCartaPorteLifecycle();

  const {
    formData,
    updateFormData,
    stepValidations,
    totalProgress,
    isLoading
  } = useCartaPorteFormSimplified();

  const [currentStep, setCurrentStep] = useState(0);
  const [nombreBorrador, setNombreBorrador] = useState('');
  const [esBorrador, setEsBorrador] = useState(true);
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);

  // Cargar borrador si existe un ID
  useEffect(() => {
    if (currentId) {
      loadBorradorData();
    } else {
      // Crear nuevo borrador automáticamente
      handleCrearNuevoBorrador();
    }
  }, [currentId]);

  // Auto-save cada 30 segundos
  useEffect(() => {
    if (currentId && formData) {
      const interval = setInterval(() => {
        handleAutoSave();
      }, 30000);

      setAutoSaveInterval(interval);
      return () => {
        if (interval) clearInterval(interval);
      };
    }
  }, [currentId, formData]);

  const loadBorradorData = async () => {
    if (!currentId) return;

    try {
      const borrador = await cargarBorrador(currentId);
      if (borrador) {
        setNombreBorrador(borrador.nombre_borrador);
        setEsBorrador(true);
        
        // Cargar datos del formulario
        if (borrador.datos_formulario) {
          Object.keys(borrador.datos_formulario).forEach(key => {
            updateFormData(key as any, borrador.datos_formulario[key]);
          });
        }
      }
    } catch (error) {
      console.error('Error cargando borrador:', error);
      toast.error('Error cargando el borrador');
    }
  };

  const handleCrearNuevoBorrador = async () => {
    try {
      const nuevoBorrador = await crearBorrador({
        nombre_borrador: `Borrador ${new Date().toLocaleDateString()}`
      });
      
      setNombreBorrador(nuevoBorrador.nombre_borrador);
      setEsBorrador(true);
      
      // Actualizar URL sin recargar
      window.history.replaceState({}, '', `/carta-porte/${nuevoBorrador.id}`);
    } catch (error) {
      console.error('Error creando borrador:', error);
      toast.error('Error creando nuevo borrador');
    }
  };

  const handleAutoSave = async () => {
    if (!currentId || !formData) return;

    try {
      await guardarBorrador(currentId, {
        datos_formulario: formData,
        auto_saved: true
      });
    } catch (error) {
      console.error('Error en auto-save:', error);
    }
  };

  const handleSave = async () => {
    if (!currentId) return;

    try {
      await guardarBorrador(currentId, {
        nombre_borrador: nombreBorrador,
        datos_formulario: formData,
        auto_saved: false
      });
      
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
      valid: stepValidations.configuracion
    },
    {
      title: 'Ubicaciones',
      component: UbicacionesSection,
      key: 'ubicaciones',
      valid: stepValidations.ubicaciones
    },
    {
      title: 'Mercancías',
      component: MercanciasSection,
      key: 'mercancias',
      valid: stepValidations.mercancias
    },
    {
      title: 'Autotransporte',
      component: AutotransporteSection,
      key: 'autotransporte',
      valid: stepValidations.autotransporte
    },
    {
      title: 'Figuras',
      component: FigurasSection,
      key: 'figuras',
      valid: stepValidations.figuras
    }
  ];

  const CurrentStepComponent = steps[currentStep]?.component;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p>Cargando carta porte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fijo */}
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
                <h1 className="text-xl font-bold">{nombreBorrador}</h1>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {esBorrador ? 'Borrador' : 'Carta Porte'}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {totalProgress}% completado
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navegación de pasos */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Progreso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {steps.map((step, index) => (
                  <button
                    key={step.key}
                    onClick={() => setCurrentStep(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      currentStep === index
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{step.title}</span>
                      {step.valid ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Contenido del paso actual */}
          <div className="lg:col-span-3">
            {CurrentStepComponent && (
              <CurrentStepComponent
                data={formData[steps[currentStep].key as keyof typeof formData]}
                onChange={(data: any) => updateFormData(steps[currentStep].key as any, data)}
                onNext={() => {
                  if (currentStep < steps.length - 1) {
                    setCurrentStep(currentStep + 1);
                  }
                }}
                onPrev={() => {
                  if (currentStep > 0) {
                    setCurrentStep(currentStep - 1);
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
