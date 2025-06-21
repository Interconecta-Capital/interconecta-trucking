
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen,
  ArrowRight,
  X,
  CheckCircle,
  Lightbulb,
  Target,
  Zap,
  AlertCircle
} from 'lucide-react';
import { useOnboarding, WIZARD_TUTORIAL_STEPS } from '@/contexts/OnboardingProvider';

interface WizardTutorialProps {
  currentWizardStep: number;
  onNext?: () => void;
  onSkip?: () => void;
}

export function WizardTutorial({ currentWizardStep, onNext, onSkip }: WizardTutorialProps) {
  const { 
    isWizardTutorialActive, 
    wizardStep, 
    nextWizardStep, 
    skipWizardTutorial 
  } = useOnboarding();
  
  const [showTooltip, setShowTooltip] = useState(false);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  const [highlightStyle, setHighlightStyle] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const currentTutorialStep = wizardStep ? WIZARD_TUTORIAL_STEPS[wizardStep as keyof typeof WIZARD_TUTORIAL_STEPS] : null;

  const updateTargetElement = useCallback(() => {
    if (currentTutorialStep?.targetElement) {
      console.log('🎯 Buscando elemento:', currentTutorialStep.targetElement);
      
      // Esperar un poco para asegurar que el DOM esté actualizado
      setTimeout(() => {
        const element = document.querySelector(currentTutorialStep.targetElement!) as HTMLElement;
        
        if (element) {
          console.log('✅ Elemento encontrado:', element);
          setTargetElement(element);
          
          // Calcular posición del elemento para el highlight
          const rect = element.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
          
          setHighlightStyle({
            top: rect.top + scrollTop - 8,
            left: rect.left + scrollLeft - 8,
            width: rect.width + 16,
            height: rect.height + 16
          });
          
          setShowTooltip(true);
          
          // Scroll suave al elemento
          element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
          
          // Agregar clase temporal para mejor visibilidad
          element.classList.add('tutorial-highlight');
          setTimeout(() => {
            element.classList.remove('tutorial-highlight');
          }, 3000);
          
        } else {
          console.warn('❌ Elemento no encontrado:', currentTutorialStep.targetElement);
          setTargetElement(null);
          setHighlightStyle(null);
          setShowTooltip(false);
        }
      }, 500);
    } else {
      setTargetElement(null);
      setHighlightStyle(null);
      setShowTooltip(false);
    }
  }, [currentTutorialStep]);

  // Actualizar elemento objetivo cuando cambia el paso
  useEffect(() => {
    updateTargetElement();
  }, [updateTargetElement]);

  // Re-calcular posición en resize
  useEffect(() => {
    const handleResize = () => {
      updateTargetElement();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateTargetElement]);

  const handleNext = () => {
    setShowTooltip(false);
    setHighlightStyle(null);
    setTimeout(() => {
      nextWizardStep();
      if (onNext) onNext();
    }, 300);
  };

  const handleSkip = () => {
    setShowTooltip(false);
    setHighlightStyle(null);
    skipWizardTutorial();
    if (onSkip) onSkip();
  };

  if (!isWizardTutorialActive || !currentTutorialStep) {
    return null;
  }

  return (
    <>
      {/* CSS para el highlight */}
      <style jsx global>{`
        .tutorial-highlight {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.3) !important;
          border-radius: 8px !important;
          animation: tutorialPulse 2s infinite;
        }
        
        @keyframes tutorialPulse {
          0%, 100% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.5); }
        }
      `}</style>

      {/* Overlay de fondo */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 pointer-events-none"
            style={{
              background: 'rgba(0, 0, 0, 0.4)'
            }}
          />
        )}
      </AnimatePresence>

      {/* Highlight del elemento objetivo */}
      <AnimatePresence>
        {showTooltip && highlightStyle && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-41 pointer-events-none"
            style={{
              top: highlightStyle.top,
              left: highlightStyle.left,
              width: highlightStyle.width,
              height: highlightStyle.height,
              border: '4px solid #3b82f6',
              borderRadius: '12px',
              background: 'rgba(59, 130, 246, 0.1)',
              boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)',
              animation: 'tutorialPulse 2s infinite'
            }}
          />
        )}
      </AnimatePresence>

      {/* Main Tutorial Card */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]"
        >
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-500 rounded-lg">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                    Tutorial Paso {Object.keys(WIZARD_TUTORIAL_STEPS).indexOf(wizardStep!) + 1}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="h-8 w-8 p-0 hover:bg-blue-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg text-blue-900">
                {currentTutorialStep.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-blue-800 text-sm leading-relaxed">
                {currentTutorialStep.description}
              </p>
              
              {currentTutorialStep.detailedExplanation && (
                <div className="p-3 bg-blue-100 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">
                      {currentTutorialStep.detailedExplanation}
                    </p>
                  </div>
                </div>
              )}

              {currentTutorialStep.actionRequired && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-amber-900 text-sm">Acción requerida:</div>
                      <p className="text-sm text-amber-800">
                        {currentTutorialStep.actionRequired}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentTutorialStep.tips && currentTutorialStep.tips.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Consejos útiles:</span>
                  </div>
                  <ul className="space-y-1">
                    {currentTutorialStep.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-green-700">
                        <CheckCircle className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSkip}
                  className="flex-1"
                >
                  Saltar Tutorial
                </Button>
                <Button
                  onClick={handleNext}
                  size="sm"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
