
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'nuevo' | 'transportista' | 'dispatcher' | 'admin' | 'administrador' | 'operador';

interface OnboardingStep {
  id: string;
  title: string;
  content: string;
  description?: string;
  detailedExplanation?: string;
  tips?: string[];
  targetElement?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingContextType {
  // Estados principales
  isOnboardingActive: boolean;
  isWizardTutorialActive: boolean;
  currentStep: OnboardingStep | null;
  wizardStep: number;
  userRole: UserRole;
  onboardingProgress: number;
  
  // Acciones principales
  startOnboarding: () => void;
  nextStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  completeStep: (stepId: string) => void;
  
  // Acciones del wizard tutorial
  startWizardTutorial: () => void;
  completeWizardTutorial: () => void;
  
  // Control de usuario
  setUserRole: (role: UserRole) => void;
  
  // Funciones de hints
  shouldShowHint: (hintId: string) => boolean;
  hideHint: (hintId: string) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenido a Interconecta',
    content: 'Te guiaremos para que aproveches al máximo la plataforma.',
    description: 'Te guiaremos para que aproveches al máximo la plataforma.'
  },
  {
    id: 'dashboard',
    title: 'Tu Centro de Comando',
    content: 'Aquí puedes ver todas tus métricas y actividades importantes.',
    description: 'Aquí puedes ver todas tus métricas y actividades importantes.',
    targetElement: '[data-onboarding="dashboard-overview"]'
  },
  {
    id: 'quick-actions',
    title: 'Acciones Rápidas',
    content: 'Crea viajes, cartas porte y gestiona tu flota desde aquí.',
    description: 'Crea viajes, cartas porte y gestiona tu flota desde aquí.',
    targetElement: '[data-onboarding="quick-actions"]'
  }
];

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [isWizardTutorialActive, setIsWizardTutorialActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [wizardStep, setWizardStep] = useState(1);
  const [userRole, setUserRole] = useState<UserRole>('nuevo');

  // Detectar si es primera vez en el dashboard
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('onboarding_completed');
    const userProfile = localStorage.getItem('user_profile');
    
    if (!hasSeenOnboarding && userProfile) {
      const profile = JSON.parse(userProfile);
      setUserRole(profile.rol || 'nuevo');
    }
  }, []);

  const startOnboarding = () => {
    setIsOnboardingActive(true);
    setCurrentStepIndex(0);
  };

  const nextStep = () => {
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeStep = (stepId: string) => {
    const stepIndex = ONBOARDING_STEPS.findIndex(step => step.id === stepId);
    if (stepIndex !== -1 && stepIndex === currentStepIndex) {
      nextStep();
    }
  };

  const skipOnboarding = () => {
    setIsOnboardingActive(false);
    localStorage.setItem('onboarding_skipped', 'true');
  };

  const completeOnboarding = () => {
    setIsOnboardingActive(false);
    localStorage.setItem('onboarding_completed', 'true');
  };

  // Tutorial específico del wizard - SOLO se activa manualmente en ViajeWizard
  const startWizardTutorial = () => {
    console.log('🎓 Iniciando tutorial del wizard de viajes');
    setIsWizardTutorialActive(true);
    setWizardStep(1);
  };

  const completeWizardTutorial = () => {
    console.log('✅ Completando tutorial del wizard');
    setIsWizardTutorialActive(false);
    localStorage.setItem('wizard_tutorial_completed', 'true');
  };

  // Funciones para hints
  const shouldShowHint = (hintId: string): boolean => {
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

  const currentStep = ONBOARDING_STEPS[currentStepIndex] || null;
  const onboardingProgress = ((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100;

  const value: OnboardingContextType = {
    isOnboardingActive,
    isWizardTutorialActive,
    currentStep,
    wizardStep,
    userRole,
    onboardingProgress,
    startOnboarding,
    nextStep,
    skipOnboarding,
    completeOnboarding,
    completeStep,
    startWizardTutorial,
    completeWizardTutorial,
    setUserRole,
    shouldShowHint,
    hideHint,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
