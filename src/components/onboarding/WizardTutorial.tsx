import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowRight, 
  X, 
  Lightbulb,
  SkipForward,
  EyeOff,
  CheckCircle
} from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingProvider';

interface WizardTutorialProps {
  currentWizardStep: number;
  onNext: () => void;
  onSkip: () => void;
}

const WIZARD_STEPS = [
  {
    step: 1,
    title: 'Define la Misión del Viaje',
    content: 'Selecciona el cliente, tipo de servicio y describe detalladamente la mercancía. Para múltiples productos, sepáralos con comas.',
    tips: [
      'Si transportas varios productos, sepáralos con comas: "Televisores, Refrigeradores, Lavadoras"',
      'El sistema detectará automáticamente cada producto y asignará claves SAT',
      'Asegúrate de que el RFC del cliente sea válido'
    ]
  },
  {
    step: 2,
    title: 'Establece la Ruta Completa',
    content: 'Define origen y destino con datos completos. CRÍTICO: código postal y localidad son obligatorios para cumplir con SAT.',
    tips: [
      'Código postal y localidad son OBLIGATORIOS',
      'Direcciones incompletas causan rechazo del SAT',
      'Verifica que las coordenadas sean correctas'
    ]
  },
  {
    step: 3,
    title: 'Asigna Vehículo y Conductor',
    content: 'Selecciona vehículo y conductor. El sistema validará automáticamente capacidades y documentación.',
    tips: [
      'Verifica que el vehículo tenga capacidad suficiente',
      'El conductor debe tener licencia vigente',
      'Configura remolques si es necesario'
    ]
  },
  {
    step: 4,
    title: 'Validaciones SAT 3.1',
    content: 'El sistema verificará cumplimiento fiscal automáticamente antes de generar documentos.',
    tips: [
      'Todas las validaciones deben estar en verde',
      'Los errores aquí causan multas del SAT',
      'No avances si hay validaciones pendientes'
    ]
  },
  {
    step: 5,
    title: 'Confirma y Genera Documentos',
    content: 'Revisa toda la información antes de generar la Carta Porte XML y PDF oficiales.',
    tips: [
      'Una vez generados, los documentos son fiscalmente válidos',
      'Verifica todos los datos antes de confirmar',
      'Los documentos se almacenan automáticamente'
    ]
  }
];

export function WizardTutorial({ currentWizardStep, onNext, onSkip }: WizardTutorialProps) {
  const { isWizardTutorialActive, completeWizardTutorial } = useOnboarding();
  const [neverShowAgain, setNeverShowAgain] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Check if user has opted out permanently
  useEffect(() => {
    const neverShow = localStorage.getItem('never_show_wizard_tutorial');
    if (neverShow === 'true') {
      setIsVisible(false);
      return;
    }
  }, []);

  // Check if tutorial was completed this session
  useEffect(() => {
    const completedThisSession = sessionStorage.getItem('wizard_tutorial_completed_session');
    if (completedThisSession === 'true') {
      setIsVisible(false);
      return;
    }
  }, []);

  const handleSkip = () => {
    if (neverShowAgain) {
      localStorage.setItem('never_show_wizard_tutorial', 'true');
    }
    sessionStorage.setItem('wizard_tutorial_completed_session', 'true');
    completeWizardTutorial();
    setIsVisible(false);
    onSkip();
  };

  const handleNext = () => {
    onNext();
  };

  const handleComplete = () => {
    if (neverShowAgain) {
      localStorage.setItem('never_show_wizard_tutorial', 'true');
    }
    sessionStorage.setItem('wizard_tutorial_completed_session', 'true');
    completeWizardTutorial();
    setIsVisible(false);
  };

  if (!isWizardTutorialActive || !isVisible) {
    return null;
  }

  const currentStep = WIZARD_STEPS.find(step => step.step === currentWizardStep);
  if (!currentStep) return null;

  const progress = (currentWizardStep / WIZARD_STEPS.length) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 left-4 z-50 max-w-md"
      >
        <Card className="shadow-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Tutorial de Viajes</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Paso {currentWizardStep} de {WIZARD_STEPS.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Paso {currentStep.step}
                </Badge>
                <h3 className="font-semibold text-base">{currentStep.title}</h3>
              </div>
              
              <p className="text-sm text-gray-700 leading-relaxed">
                {currentStep.content}
              </p>

              {currentStep.tips && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-600">💡 Tips importantes:</p>
                  <ul className="space-y-1">
                    {currentStep.tips.map((tip, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              {currentWizardStep < WIZARD_STEPS.length ? (
                <Button
                  onClick={handleNext}
                  size="sm"
                  className="flex-1 text-xs h-8 bg-blue-600 hover:bg-blue-700"
                >
                  Siguiente
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  size="sm"
                  className="flex-1 text-xs h-8 bg-green-600 hover:bg-green-700"
                >
                  Completar Tutorial
                  <CheckCircle className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>

            {/* Opciones adicionales */}
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="never-show" 
                  checked={neverShowAgain}
                  onCheckedChange={(checked) => setNeverShowAgain(checked === true)}
                />
                <label htmlFor="never-show" className="text-xs text-gray-500">
                  No mostrar más
                </label>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="text-xs text-gray-400 h-6 px-2"
              >
                <SkipForward className="h-3 w-3 mr-1" />
                Saltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
