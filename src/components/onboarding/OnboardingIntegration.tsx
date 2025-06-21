
import React from 'react';
import { OnboardingOverlay } from './OnboardingOverlay';
import { ContextualHints } from './ContextualHints';
import { PersonalizedWelcome } from './PersonalizedWelcome';
import { WizardTutorial } from './WizardTutorial';
import { useOnboarding } from '@/contexts/OnboardingProvider';

export function OnboardingIntegration() {
  const { 
    isOnboardingActive, 
    currentStep, 
    isWizardTutorialActive 
  } = useOnboarding();

  return (
    <>
      {/* Bienvenida personalizada - solo al inicio */}
      {isOnboardingActive && currentStep?.id === 'welcome' && (
        <PersonalizedWelcome />
      )}

      {/* Overlay principal del onboarding */}
      <OnboardingOverlay />

      {/* Tutorial del wizard - solo en el wizard de viajes */}
      {isWizardTutorialActive && (
        <WizardTutorial 
          currentWizardStep={1}
          onNext={() => console.log('Tutorial next from integration')}
          onSkip={() => console.log('Tutorial skipped from integration')}
        />
      )}

      {/* Hints contextuales - siempre activos */}
      <ContextualHints />
    </>
  );
}
