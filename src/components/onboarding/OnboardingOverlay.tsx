
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Lightbulb, 
  Target, 
  CheckCircle,
  Star,
  Zap,
  Shield
} from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingProvider';

interface TooltipPosition {
  top: number;
  left: number;
  placement: 'top' | 'bottom' | 'left' | 'right';
}

export function OnboardingOverlay() {
  const {
    isOnboardingActive,
    currentStep,
    onboardingProgress,
    completeStep,
    skipOnboarding,
    userRole
  } = useOnboarding();

  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Calcular posición del tooltip basado en el elemento target
  useEffect(() => {
    if (!currentStep?.targetElement || !isOnboardingActive) {
      setTooltipPosition(null);
      setHighlightedElement(null);
      return;
    }

    const targetElement = document.querySelector(currentStep.targetElement) as HTMLElement;
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    // Determinar mejor posición para el tooltip
    let placement: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
    let top = rect.bottom + scrollTop + 10;
    let left = rect.left + scrollLeft + rect.width / 2;

    // Ajustar si no hay espacio abajo
    if (rect.bottom + 200 > window.innerHeight) {
      placement = 'top';
      top = rect.top + scrollTop - 10;
    }

    // Ajustar si se sale de los lados
    if (left + 200 > window.innerWidth) {
      left = window.innerWidth - 220;
    }
    if (left < 20) {
      left = 20;
    }

    setTooltipPosition({ top, left, placement });
    setHighlightedElement(targetElement);

    // Scroll suave al elemento
    targetElement.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
  }, [currentStep, isOnboardingActive]);

  const handleNext = () => {
    if (currentStep) {
      completeStep(currentStep.id);
    }
  };

  const getRoleWelcomeMessage = () => {
    switch (userRole) {
      case 'transportista':
        return 'Como transportista, te ayudaremos a dominar la gestión de viajes y documentación SAT.';
      case 'administrador':
        return 'Como administrador, te mostraremos todas las herramientas de gestión y supervisión.';
      case 'operador':
        return 'Como operador, aprenderás a usar eficientemente todas las funciones operativas.';
      default:
        return 'Te guiaremos paso a paso para que aproveches al máximo InterConecta.';
    }
  };

  if (!isOnboardingActive || !currentStep) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={overlayRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 pointer-events-none"
      >
        {/* Overlay semi-transparente */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

        {/* Highlight del elemento target */}
        {highlightedElement && (
          <div
            className="absolute border-4 border-blue-500 rounded-lg shadow-lg pointer-events-none"
            style={{
              top: highlightedElement.getBoundingClientRect().top + window.pageYOffset - 4,
              left: highlightedElement.getBoundingClientRect().left + window.pageXOffset - 4,
              width: highlightedElement.offsetWidth + 8,
              height: highlightedElement.offsetHeight + 8,
              background: 'rgba(59, 130, 246, 0.1)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          />
        )}

        {/* Tooltip Principal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="absolute pointer-events-auto"
          style={{
            top: tooltipPosition?.top || '50%',
            left: tooltipPosition?.left || '50%',
            transform: tooltipPosition 
              ? 'translateX(-50%)' 
              : 'translate(-50%, -50%)',
            maxWidth: '400px',
            zIndex: 60
          }}
        >
          <Card className="shadow-2xl border-2 border-blue-200 bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {currentStep.id === 'welcome' ? (
                    <Star className="h-5 w-5 text-yellow-500" />
                  ) : currentStep.id === 'validaciones' ? (
                    <Shield className="h-5 w-5 text-green-500" />
                  ) : (
                    <Target className="h-5 w-5 text-blue-500" />
                  )}
                  <CardTitle className="text-lg">{currentStep.title}</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipOnboarding}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Progress bar */}
              <div className="space-y-2 mt-3">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Progreso del Tutorial</span>
                  <span>{Math.round(onboardingProgress)}%</span>
                </div>
                <Progress value={onboardingProgress} className="h-2" />
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-gray-700">{currentStep.description}</p>
                
                {currentStep.id === 'welcome' && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium">
                      {getRoleWelcomeMessage()}
                    </p>
                  </div>
                )}

                {currentStep.id === 'crear_viaje' && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded">
                    <Zap className="h-4 w-4" />
                    <span>Este es el paso más importante: aquí crearás viajes sin errores SAT</span>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    Paso {Object.keys({}).length + 1}
                  </Badge>
                  {userRole !== 'nuevo' && (
                    <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                      {userRole}
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={skipOnboarding}
                  >
                    Saltar Tutorial
                  </Button>
                  <Button
                    onClick={handleNext}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {currentStep.id === 'welcome' ? 'Comenzar' : 'Siguiente'}
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Indicador flotante de progreso */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="fixed top-4 right-4 pointer-events-auto"
        >
          <Card className="p-3 shadow-lg bg-white/95 backdrop-blur">
            <div className="flex items-center gap-2 text-sm">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">Tutorial Activo</span>
              <Badge variant="outline" className="text-xs">
                {Math.round(onboardingProgress)}%
              </Badge>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
