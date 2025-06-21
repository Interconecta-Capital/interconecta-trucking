
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'nuevo' | 'transportista' | 'dispatcher' | 'admin';

interface OnboardingStep {
  id: string;
  title: string;
  content: string;
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
  
  // Acciones principales
  startOnboarding: () => void;
  nextStep: () => void;
  skipOnboarding: () => void;
  completeOnboarding: () => void;
  
  // Acciones del wizard tutorial
  startWizardTutorial: () => void;
  completeWizardTutorial: () => void;
  
  // Control de usuario
  setUserRole: (role: UserRole) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenido a Interconecta',
    content: 'Te guiaremos para que aproveches al máximo la plataforma.'
  },
  {
    id: 'dashboard',
    title: 'Tu Centro de Comando',
    content: 'Aquí puedes ver todas tus métricas y actividades importantes.',
    targetElement: '[data-onboarding="dashboard-overview"]'
  },
  {
    id: 'quick-actions',
    title: 'Acciones Rápidas',
    content: 'Crea viajes, cartas porte y gestiona tu flota desde aquí.',
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

  const currentStep = ONBOARDING_STEPS[currentStepIndex] || null;

  const value: OnboardingContextType = {
    isOnboardingActive,
    isWizardTutorialActive,
    currentStep,
    wizardStep,
    userRole,
    startOnboarding,
    nextStep,
    skipOnboarding,
    completeOnboarding,
    startWizardTutorial,
    completeWizardTutorial,
    setUserRole,
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
