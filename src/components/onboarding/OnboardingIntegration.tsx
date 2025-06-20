
import React from 'react';
import { OnboardingOverlay } from './OnboardingOverlay';
import { ContextualHints } from './ContextualHints';
import { PersonalizedWelcome } from './PersonalizedWelcome';
import { useOnboarding } from '@/contexts/OnboardingProvider';

export function OnboardingIntegration() {
  const { isOnboardingActive, currentStep } = useOnboarding();

  return (
    <>
      {/* Bienvenida personalizada - solo al inicio */}
      {isOnboardingActive && currentStep?.id === 'welcome' && (
        <PersonalizedWelcome />
      )}

      {/* Overlay principal del onboarding */}
      <OnboardingOverlay />

      {/* Hints contextuales - siempre activos */}
      <ContextualHints />
    </>
  );
}
