
import React, { useState } from 'react';
import { OnboardingOverlay } from './OnboardingOverlay';
import { ContextualHints } from './ContextualHints';
import { PersonalizedWelcome } from './PersonalizedWelcome';
import { WizardTutorial } from './WizardTutorial';
import { OnboardingCelebration } from './OnboardingCelebration';
import { useOnboarding } from '@/contexts/OnboardingProvider';
import { useAuth } from '@/hooks/useAuth';

export function OnboardingIntegration() {
  const { 
    isOnboardingActive, 
    currentStep, 
    isWizardTutorialActive,
    isOnboardingComplete
  } = useOnboarding();
  const { user } = useAuth();
  const [showCelebration, setShowCelebration] = useState(false);

  // Check if user just completed first trip
  React.useEffect(() => {
    const onboardingProgress = localStorage.getItem('onboarding_progress');
    if (onboardingProgress) {
      try {
        const progress = JSON.parse(onboardingProgress);
        if (progress.firstTripCreated && !progress.celebrationShown) {
          setShowCelebration(true);
          // Mark celebration as shown
          localStorage.setItem('onboarding_progress', JSON.stringify({
            ...progress,
            celebrationShown: true
          }));
        }
      } catch (error) {
        console.error('Error checking celebration status:', error);
      }
    }
  }, [isOnboardingComplete]);

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

      {/* Celebración al completar primer viaje */}
      <OnboardingCelebration 
        isVisible={showCelebration}
        onClose={() => setShowCelebration(false)}
        userName={user?.email?.split('@')[0] || 'Usuario'}
      />
    </>
  );
}
