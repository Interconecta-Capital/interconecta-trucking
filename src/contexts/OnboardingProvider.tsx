
import React, { createContext, useContext, useState, useEffect } from 'react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  detailedExplanation?: string;
  tips?: string[];
}

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
  startOnboarding: (role: string) => void;
  
  // User and Hints
  userRole: string;
  shouldShowHint: (hintId: string) => boolean;
  hideHint: (hintId: string) => void;
}

const OnboardingContext = createContext<OnboardingContextType>({
  isWizardTutorialActive: true,
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
    description: 'Te guiaremos paso a paso para que conozcas todas las funcionalidades.'
  },
  {
    id: 'dashboard',
    title: 'Panel Principal',
    description: 'Aquí verás un resumen de tus viajes y métricas importantes.',
    targetElement: '[data-onboarding="dashboard"]'
  },
  {
    id: 'crear-viaje',
    title: 'Crear Nuevo Viaje',
    description: 'Aprende a programar viajes de manera eficiente.',
    targetElement: '[data-onboarding="crear-viaje-btn"]'
  }
];

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isWizardTutorialActive, setIsWizardTutorialActive] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userRole, setUserRole] = useState('nuevo');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    // Check if tutorial was permanently disabled
    const neverShow = localStorage.getItem('never_show_wizard_tutorial');
    const completedSession = sessionStorage.getItem('wizard_tutorial_completed_session');
    
    if (neverShow === 'true' || completedSession === 'true') {
      setIsWizardTutorialActive(false);
    }

    // Load user role
    const savedRole = localStorage.getItem('user_role') || 'nuevo';
    setUserRole(savedRole);
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

  const startWizardTutorial = () => {
    setIsWizardTutorialActive(true);
    setWizardStep(1);
  };

  const startOnboarding = (role: string) => {
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
