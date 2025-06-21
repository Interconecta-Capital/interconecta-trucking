
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  X, 
  Check, 
  Lightbulb,
  SkipForward,
  Eye,
  EyeOff
} from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingProvider';

export function OnboardingOverlay() {
  const { 
    isOnboardingActive, 
    currentStep, 
    onboardingProgress, 
    completeStep, 
    skipOnboarding 
  } = useOnboarding();

  const handleSkipWithOption = (neverShow: boolean = false) => {
    if (neverShow) {
      localStorage.setItem('never_show_onboarding_overlay', 'true');
    }
    skipOnboarding();
  };

  // No mostrar si el usuario optó por no verlo más
  const neverShow = localStorage.getItem('never_show_onboarding_overlay');
  if (neverShow === 'true' || !isOnboardingActive || !currentStep) {
    return null;
  }

  const highlightElement = () => {
    if (currentStep.targetElement) {
      const element = document.querySelector(currentStep.targetElement);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        
        // Agregar highlight temporal
        element.classList.add('ring-4', 'ring-blue-500', 'ring-opacity-50');
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-blue-500', 'ring-opacity-50');
        }, 3000);
      }
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 right-4 z-40 max-w-sm"
      >
        <Card className="shadow-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Lightbulb className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Tutorial Interconecta</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSkipWithOption(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Progreso del Tutorial</span>
                <span>{Math.round(onboardingProgress)}%</span>
              </div>
              <Progress value={onboardingProgress} className="h-2" />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {currentStep.id}
                </Badge>
                <h3 className="font-semibold text-base">{currentStep.title}</h3>
              </div>
              
              <p className="text-sm text-gray-700 leading-relaxed">
                {currentStep.description}
              </p>

              {currentStep.detailedExplanation && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-800 leading-relaxed">
                    💡 {currentStep.detailedExplanation}
                  </p>
                </div>
              )}

              {currentStep.tips && currentStep.tips.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-600">Tips útiles:</p>
                  <ul className="space-y-1">
                    {currentStep.tips.map((tip, index) => (
                      <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                        <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              {currentStep.targetElement && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={highlightElement}
                  className="flex-1 text-xs h-8"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Mostrar
                </Button>
              )}
              
              <Button
                onClick={() => completeStep(currentStep.id)}
                size="sm"
                className="flex-1 text-xs h-8 bg-blue-600 hover:bg-blue-700"
              >
                Siguiente
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>

            {/* Opciones adicionales */}
            <div className="flex items-center justify-between pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSkipWithOption(false)}
                className="text-xs text-gray-500 h-6 px-2"
              >
                <SkipForward className="h-3 w-3 mr-1" />
                Saltar tutorial
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSkipWithOption(true)}
                className="text-xs text-gray-400 h-6 px-2"
              >
                <EyeOff className="h-3 w-3 mr-1" />
                No mostrar más
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
