
import React, { createContext, useContext, useState, useEffect } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  detailedExplanation?: string;
  tips?: string[];
}

type UserRole = 'nuevo' | 'transportista' | 'administrador' | 'operador';

interface OnboardingContextType {
  // Wizard Tutorial
  isWizardTutorialActive: boolean;
  completeWizardTutorial: () => void;
  resetWizardTutorial: () => void;
  startWizardTutorial: () => void;
  wizardStep: number;
  
  // General Onboarding
  isOnboardingActive: boolean;
  isOnboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
  currentStep: OnboardingStep | null;
  onboardingProgress: number;
  completeStep: (stepId: string) => void;
  skipOnboarding: () => void;
  startOnboarding: (role: UserRole) => void;
  
  // User and Hints
  userRole: UserRole;
  shouldShowHint: (hintId: string) => boolean;
  hideHint: (hintId: string) => void;
}

const OnboardingContext = createContext<OnboardingContextType>({
  isWizardTutorialActive: false, // Cambiado a false por defecto
  completeWizardTutorial: () => {},
  resetWizardTutorial: () => {},
  startWizardTutorial: () => {},
  wizardStep: 1,
  isOnboardingActive: false,
  isOnboardingComplete: false,
  setOnboardingComplete: () => {},
  currentStep: null,
  onboardingProgress: 0,
  completeStep: () => {},
  skipOnboarding: () => {},
  startOnboarding: () => {},
  userRole: 'nuevo',
  shouldShowHint: () => true,
  hideHint: () => {}
});

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenido a Interconecta',
    description: 'Te guiaremos paso a paso para que conozcas todas las funcionalidades.',
    detailedExplanation: 'Interconecta es tu centro de comando para gestión logística completa.',
    tips: ['Explora cada sección', 'Configura tu perfil primero', 'Aprovecha los atajos de teclado']
  },
  {
    id: 'dashboard',
    title: 'Explora el Dashboard',
    description: 'Este es tu centro de control. Aquí verás métricas clave de tu operación.',
    targetElement: '[data-onboarding="dashboard"]',
    detailedExplanation: 'El dashboard muestra viajes activos, métricas de rendimiento y alertas importantes en tiempo real.',
    tips: ['Revisa las métricas diariamente', 'Usa los filtros para analizar períodos específicos', 'Personaliza tu vista según tus necesidades']
  },
  {
    id: 'nav-menu',
    title: 'Menú de Navegación',
    description: 'Desde aquí puedes acceder a todas las secciones: viajes, conductores, vehículos y más.',
    targetElement: 'nav',
    detailedExplanation: 'El menú lateral te da acceso rápido a todas las funcionalidades de la plataforma.',
    tips: ['Usa el buscador para encontrar secciones rápidamente', 'Las notificaciones aparecen en la campana superior']
  },
  {
    id: 'crear-viaje',
    title: 'Crea Tu Primer Viaje',
    description: 'Es momento de programar tu primer viaje. Haz clic en "Nuevo Viaje" para comenzar.',
    targetElement: '[data-onboarding="crear-viaje-btn"]',
    detailedExplanation: 'El wizard te guiará paso a paso para crear documentos fiscalmente válidos.',
    tips: ['Completa todos los campos obligatorios', 'El sistema te ayudará con las validaciones SAT', 'Puedes guardar borradores en cualquier momento']
  },
  {
    id: 'viaje-completado',
    title: '¡Excelente Trabajo!',
    description: 'Has completado la configuración de tu primer viaje. Ya conoces lo esencial de Interconecta.',
    detailedExplanation: 'Ahora puedes gestionar tu flota de manera profesional y eficiente.',
    tips: ['Explora los reportes automáticos', 'Configura alertas personalizadas', 'Revisa el centro de ayuda para funciones avanzadas']
  }
];

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isWizardTutorialActive, setIsWizardTutorialActive] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userRole, setUserRole] = useState<UserRole>('nuevo');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    const neverShow = localStorage.getItem('never_show_wizard_tutorial');
    if (neverShow === 'true') {
      setIsWizardTutorialActive(false);
    }

    // Load saved progress
    const savedRole = localStorage.getItem('user_role') || 'nuevo';
    setUserRole(savedRole as UserRole);
    
    const savedProgress = localStorage.getItem('onboarding_progress');
    if (savedProgress) {
      try {
        const progress = JSON.parse(savedProgress);
        setCompletedSteps(progress.completedSteps || []);
        setIsOnboardingComplete(progress.onboardingCompleted || false);
        
        // Find current step index based on saved progress
        const stepIndex = ONBOARDING_STEPS.findIndex(s => s.id === progress.currentStep);
        if (stepIndex >= 0) {
          setCurrentStepIndex(stepIndex);
        }
      } catch (error) {
        console.error('Error loading onboarding progress:', error);
      }
    }
  }, []);

  const completeWizardTutorial = () => {
    setIsWizardTutorialActive(false);
    sessionStorage.setItem('wizard_tutorial_completed_session', 'true');
  };

  const resetWizardTutorial = () => {
    setIsWizardTutorialActive(true);
    localStorage.removeItem('never_show_wizard_tutorial');
    sessionStorage.removeItem('wizard_tutorial_completed_session');
  };

  // Esta función solo se llamará desde el ViajeWizard
  const startWizardTutorial = () => {
    // Verificar si el tutorial ya fue completado o marcado para no mostrar
    const neverShow = localStorage.getItem('never_show_wizard_tutorial');
    const completedSession = sessionStorage.getItem('wizard_tutorial_completed_session');
    
    if (neverShow !== 'true' && completedSession !== 'true') {
      setIsWizardTutorialActive(true);
      setWizardStep(1);
    }
  };

  const startOnboarding = (role: UserRole) => {
    setUserRole(role);
    setIsOnboardingActive(true);
    setCurrentStepIndex(0);
    localStorage.setItem('user_role', role);
  };

  const skipOnboarding = () => {
    setIsOnboardingActive(false);
    setIsOnboardingComplete(true);
  };

  const completeStep = (stepId: string) => {
    const newCompletedSteps = [...completedSteps, stepId];
    setCompletedSteps(newCompletedSteps);
    
    // Save progress to localStorage
    const progress = {
      currentStep: stepId,
      completedSteps: newCompletedSteps,
      onboardingCompleted: false,
      firstTripCreated: stepId === 'viaje-completado'
    };
    localStorage.setItem('onboarding_progress', JSON.stringify(progress));
    
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Onboarding completed!
      setIsOnboardingActive(false);
      setIsOnboardingComplete(true);
      setShowCelebration(true);
      
      const finalProgress = {
        ...progress,
        onboardingCompleted: true,
        completedAt: new Date().toISOString()
      };
      localStorage.setItem('onboarding_progress', JSON.stringify(finalProgress));
    }
  };

  const shouldShowHint = (hintId: string) => {
    const dismissed = localStorage.getItem('dismissed_hints');
    const dismissedHints = dismissed ? JSON.parse(dismissed) : [];
    return !dismissedHints.includes(hintId);
  };

  const hideHint = (hintId: string) => {
    const dismissed = localStorage.getItem('dismissed_hints');
    const dismissedHints = dismissed ? JSON.parse(dismissed) : [];
    const newDismissed = [...dismissedHints, hintId];
    localStorage.setItem('dismissed_hints', JSON.stringify(newDismissed));
  };

  const currentStep = isOnboardingActive ? ONBOARDING_STEPS[currentStepIndex] : null;
  const onboardingProgress = ((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100;

  const closeCelebration = () => {
    setShowCelebration(false);
  };

  return (
    <OnboardingContext.Provider value={{
      isWizardTutorialActive,
      completeWizardTutorial,
      resetWizardTutorial,
      startWizardTutorial,
      wizardStep,
      isOnboardingActive,
      isOnboardingComplete,
      setOnboardingComplete: setIsOnboardingComplete,
      currentStep,
      onboardingProgress,
      completeStep,
      skipOnboarding,
      startOnboarding,
      userRole,
      shouldShowHint,
      hideHint
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
