
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
    detailedExplanation: 'Interconecta es tu centro de comando para gestión logística.',
    tips: ['Explora cada sección', 'Configura tu perfil primero', 'Usa los atajos de teclado']
  },
  {
    id: 'dashboard',
    title: 'Panel Principal',
    description: 'Aquí verás un resumen de tus viajes y métricas importantes.',
    targetElement: '[data-onboarding="dashboard"]',
    detailedExplanation: 'El dashboard te muestra métricas en tiempo real.',
    tips: ['Revisa las métricas diariamente', 'Personaliza tu vista']
  },
  {
    id: 'crear-viaje',
    title: 'Crear Nuevo Viaje',
    description: 'Aprende a programar viajes de manera eficiente.',
    targetElement: '[data-onboarding="crear-viaje-btn"]',
    detailedExplanation: 'El wizard de viajes simplifica la creación de documentos.',
    tips: ['Completa todos los campos', 'Verifica la información antes de confirmar']
  }
];

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isWizardTutorialActive, setIsWizardTutorialActive] = useState(false); // Cambiado a false
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userRole, setUserRole] = useState<UserRole>('nuevo');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    // Solo cargar el estado del tutorial, pero no activarlo automáticamente
    const neverShow = localStorage.getItem('never_show_wizard_tutorial');
    if (neverShow === 'true') {
      setIsWizardTutorialActive(false);
    }

    // Load user role
    const savedRole = localStorage.getItem('user_role') || 'nuevo';
    setUserRole(savedRole as UserRole);
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
    
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setIsOnboardingActive(false);
      setIsOnboardingComplete(true);
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
