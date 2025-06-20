
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Lightbulb, 
  X, 
  Zap, 
  Shield, 
  Clock, 
  TrendingUp,
  FileText,
  AlertCircle
} from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingProvider';

interface Hint {
  id: string;
  trigger: string;
  title: string;
  message: string;
  icon: React.ComponentType<any>;
  color: string;
  priority: 'low' | 'medium' | 'high';
  timing: number; // ms después del trigger
}

const CONTEXTUAL_HINTS: Hint[] = [
  {
    id: 'first_validation_error',
    trigger: 'validation_error',
    title: '💡 Tip: Errores de Validación',
    message: 'No te preocupes por los errores rojos. Nuestro sistema IA te ayuda a corregirlos automáticamente. Haz clic en "Auto-Fix" cuando aparezca.',
    icon: Shield,
    color: 'blue',
    priority: 'high',
    timing: 2000
  },
  {
    id: 'wizard_efficiency',
    trigger: 'wizard_step_3',
    title: '⚡ Tip: Modo Express',
    message: 'Como ya tienes experiencia, puedes cambiar al "Modo Express" en el selector superior para completar viajes más rápido.',
    icon: Zap,
    color: 'purple',
    priority: 'medium',
    timing: 3000
  },
  {
    id: 'document_generation',
    trigger: 'document_ready',
    title: '📄 Tip: Documentos',
    message: 'Una vez generados, tus documentos se guardan automáticamente. Puedes acceder a ellos desde la pestaña "Documentos" en cualquier momento.',
    icon: FileText,
    color: 'green',
    priority: 'medium',
    timing: 1500
  },
  {
    id: 'time_saving',
    trigger: 'form_autocomplete',
    title: '⏱️ Tip: Auto-completado',
    message: 'Nuestro sistema aprende de tus viajes anteriores. Muchos campos se llenan automáticamente para ahorrarte tiempo.',
    icon: Clock,
    color: 'orange',
    priority: 'low',
    timing: 4000
  },
  {
    id: 'efficiency_metrics',
    trigger: 'third_trip_completed',
    title: '📈 Tip: Métricas',
    message: '¡Genial! Ya has completado varios viajes. Revisa tu dashboard para ver cuánto tiempo has ahorrado.',
    icon: TrendingUp,
    color: 'green',
    priority: 'medium',
    timing: 2000
  }
];

export function ContextualHints() {
  const { shouldShowHint, hideHint, userRole } = useOnboarding();
  const [activeHint, setActiveHint] = useState<Hint | null>(null);
  const [dismissedHints, setDismissedHints] = useState<string[]>([]);

  // Escuchar eventos del sistema para mostrar hints
  useEffect(() => {
    const handleCustomEvent = (event: CustomEvent) => {
      const trigger = event.type;
      const relevantHint = CONTEXTUAL_HINTS.find(hint => 
        hint.trigger === trigger && 
        !dismissedHints.includes(hint.id) &&
        shouldShowHint(hint.id)
      );

      if (relevantHint) {
        setTimeout(() => {
          setActiveHint(relevantHint);
        }, relevantHint.timing);
      }
    };

    // Registrar listeners para eventos personalizados
    CONTEXTUAL_HINTS.forEach(hint => {
      document.addEventListener(hint.trigger, handleCustomEvent as EventListener);
    });

    return () => {
      CONTEXTUAL_HINTS.forEach(hint => {
        document.removeEventListener(hint.trigger, handleCustomEvent as EventListener);
      });
    };
  }, [dismissedHints, shouldShowHint]);

  // Cargar hints dismissed desde localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem('dismissed_hints');
    if (dismissed) {
      setDismissedHints(JSON.parse(dismissed));
    }
  }, []);

  const dismissHint = (hintId: string, rememberChoice: boolean = false) => {
    setActiveHint(null);
    
    if (rememberChoice) {
      const newDismissed = [...dismissedHints, hintId];
      setDismissedHints(newDismissed);
      localStorage.setItem('dismissed_hints', JSON.stringify(newDismissed));
    }

    // Marcar hint como mostrado
    localStorage.setItem(`hint_${hintId}_last_shown`, Date.now().toString());
    const frequency = localStorage.getItem(`hint_${hintId}_frequency`);
    localStorage.setItem(`hint_${hintId}_frequency`, (parseInt(frequency || '0') + 1).toString());
  };

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'border-blue-200 bg-blue-50 text-blue-800',
      purple: 'border-purple-200 bg-purple-50 text-purple-800',
      green: 'border-green-200 bg-green-50 text-green-800',
      orange: 'border-orange-200 bg-orange-50 text-orange-800',
      red: 'border-red-200 bg-red-50 text-red-800'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <AnimatePresence>
      {activeHint && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, x: 20 }}
          className="fixed bottom-4 right-4 z-40 max-w-sm"
        >
          <Card className={`shadow-lg border-2 ${getColorClasses(activeHint.color)}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <activeHint.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="font-semibold text-sm">{activeHint.title}</h4>
                  <p className="text-sm leading-relaxed">{activeHint.message}</p>
                  
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissHint(activeHint.id, false)}
                      className="text-xs h-7 px-2"
                    >
                      Entendido
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissHint(activeHint.id, true)}
                      className="text-xs h-7 px-2 opacity-70"
                    >
                      No mostrar más
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dismissHint(activeHint.id, false)}
                  className="h-6 w-6 p-0 -mt-1 opacity-50 hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Helper function para trigger hints desde otros componentes
export const triggerHint = (eventType: string, data?: any) => {
  const event = new CustomEvent(eventType, { detail: data });
  document.dispatchEvent(event);
};
