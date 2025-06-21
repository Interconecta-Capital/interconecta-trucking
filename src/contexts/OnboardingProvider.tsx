
import React, { createContext, useContext, useState, useEffect } from 'react';

interface OnboardingContextType {
  isWizardTutorialActive: boolean;
  completeWizardTutorial: () => void;
  resetWizardTutorial: () => void;
  isOnboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
}

const OnboardingContext = createContext<OnboardingContextType>({
  isWizardTutorialActive: true,
  completeWizardTutorial: () => {},
  resetWizardTutorial: () => {},
  isOnboardingComplete: false,
  setOnboardingComplete: () => {}
});

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [isWizardTutorialActive, setIsWizardTutorialActive] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  useEffect(() => {
    // Check if tutorial was permanently disabled
    const neverShow = localStorage.getItem('never_show_wizard_tutorial');
    const completedSession = sessionStorage.getItem('wizard_tutorial_completed_session');
    
    if (neverShow === 'true' || completedSession === 'true') {
      setIsWizardTutorialActive(false);
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

  return (
    <OnboardingContext.Provider value={{
      isWizardTutorialActive,
      completeWizardTutorial,
      resetWizardTutorial,
      isOnboardingComplete,
      setOnboardingComplete
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
