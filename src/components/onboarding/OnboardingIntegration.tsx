
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

  // Verificar si se debe mostrar la bienvenida
  const neverShowWelcome = localStorage.getItem('never_show_welcome');
  const shouldShowWelcome = isOnboardingActive && 
    currentStep?.id === 'welcome' && 
    neverShowWelcome !== 'true';

  return (
    <>
      {/* Bienvenida personalizada - solo al inicio y si no se ha marcado como "no mostrar" */}
      {shouldShowWelcome && (
        <PersonalizedWelcome />
      )}

      {/* Overlay principal del onboarding - solo aparece si el usuario eligió "explorar" */}
      {isOnboardingActive && currentStep?.id !== 'welcome' && (
        <OnboardingOverlay />
      )}

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
