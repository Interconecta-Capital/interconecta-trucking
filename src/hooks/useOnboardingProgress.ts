import { useState, useEffect } from 'react';

interface OnboardingProgress {
  currentStep: string;
  completedSteps: string[];
  onboardingCompleted: boolean;
  completedAt?: string;
  firstTripCreated: boolean;
}

const STORAGE_KEY = 'onboarding_progress';

const defaultProgress: OnboardingProgress = {
  currentStep: 'welcome',
  completedSteps: [],
  onboardingCompleted: false,
  firstTripCreated: false
};

export function useOnboardingProgress() {
  const [progress, setProgress] = useState<OnboardingProgress>(defaultProgress);
  const [isLoading, setIsLoading] = useState(true);

  // Load progress from localStorage
  useEffect(() => {
    const loadProgress = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setProgress(parsed);
        }
      } catch (error) {
        console.error('Error loading onboarding progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgress();
  }, []);

  // Save progress to localStorage
  const saveProgress = (newProgress: Partial<OnboardingProgress>) => {
    const updated = { ...progress, ...newProgress };
    setProgress(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const completeStep = (stepId: string) => {
    if (!progress.completedSteps.includes(stepId)) {
      saveProgress({
        completedSteps: [...progress.completedSteps, stepId]
      });
    }
  };

  const setCurrentStep = (stepId: string) => {
    saveProgress({ currentStep: stepId });
  };

  const markOnboardingComplete = () => {
    saveProgress({
      onboardingCompleted: true,
      completedAt: new Date().toISOString()
    });
  };

  const markFirstTripCreated = () => {
    saveProgress({
      firstTripCreated: true
    });
  };

  const resetProgress = () => {
    setProgress(defaultProgress);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getProgressPercentage = () => {
    const totalSteps = 7; // welcome, dashboard, crear-viaje, wizard-step-1 to 5
    return Math.round((progress.completedSteps.length / totalSteps) * 100);
  };

  return {
    progress,
    isLoading,
    completeStep,
    setCurrentStep,
    markOnboardingComplete,
    markFirstTripCreated,
    resetProgress,
    getProgressPercentage
  };
}
