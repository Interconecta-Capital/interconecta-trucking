
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

type UserRole = 'transportista' | 'administrador' | 'operador' | 'nuevo';

interface OnboardingStepData {
  id: string;
  title: string;
  description: string;
  targetElement?: string;
  role?: UserRole[];
  prerequisite?: string;
  completed: boolean;
}

interface OnboardingContextType {
  isOnboardingActive: boolean;
  currentStep: OnboardingStepData | null;
  userRole: UserRole;
  completedSteps: string[];
  onboardingProgress: number;
  startOnboarding: (role?: UserRole) => void;
  completeStep: (stepId: string) => void;
  skipOnboarding: () => void;
  showHint: (hintId: string) => void;
  hideHint: () => void;
  isStepCompleted: (stepId: string) => boolean;
  shouldShowHint: (hintId: string) => boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const ONBOARDING_STEPS: Record<string, OnboardingStepData> = {
  welcome: {
    id: 'welcome',
    title: '¡Bienvenido a InterConecta!',
    description: 'Te guiaremos paso a paso para que domines la plataforma en minutos.',
    completed: false
  },
  navigation: {
    id: 'navigation',
    title: 'Navegación Principal',
    description: 'Aquí están las principales secciones de la plataforma.',
    targetElement: '[data-onboarding="sidebar"]',
    completed: false
  },
  crear_viaje: {
    id: 'crear_viaje',
    title: 'Crear tu Primer Viaje',
    description: 'El corazón de la plataforma: programa viajes con cero errores SAT.',
    targetElement: '[data-onboarding="nuevo-viaje-btn"]',
    role: ['transportista', 'operador'],
    completed: false
  },
  validaciones: {
    id: 'validaciones',
    title: 'Validaciones Inteligentes',
    description: 'Nuestro sistema IA previene errores antes de que sucedan.',
    prerequisite: 'crear_viaje',
    completed: false
  },
  documentos: {
    id: 'documentos',
    title: 'Gestión de Documentos',
    description: 'Genera, firma y gestiona todos tus documentos SAT.',
    targetElement: '[data-onboarding="documentos-tab"]',
    completed: false
  }
};

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [currentStep, setCurrentStep] = useState<OnboardingStepData | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('nuevo');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [activeHint, setActiveHint] = useState<string | null>(null);

  // Determinar rol del usuario
  useEffect(() => {
    if (user?.profile) {
      const profile = user.profile;
      if (profile.empresa?.includes('Admin')) {
        setUserRole('administrador');
      } else if (profile.created_at && new Date(profile.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        setUserRole('nuevo');
      } else {
        setUserRole('transportista');
      }
    }
  }, [user]);

  // Cargar progreso de onboarding desde localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(`onboarding_${user?.id}`);
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setCompletedSteps(progress.completedSteps || []);
      
      // Auto-iniciar onboarding para usuarios nuevos
      if (progress.completedSteps?.length === 0 && userRole === 'nuevo') {
        setIsOnboardingActive(true);
        setCurrentStep(ONBOARDING_STEPS.welcome);
      }
    } else if (userRole === 'nuevo') {
      // Primera vez - iniciar onboarding automáticamente
      setTimeout(() => {
        setIsOnboardingActive(true);
        setCurrentStep(ONBOARDING_STEPS.welcome);
      }, 1000);
    }
  }, [user?.id, userRole]);

  const startOnboarding = useCallback((role?: UserRole) => {
    if (role) setUserRole(role);
    setIsOnboardingActive(true);
    setCurrentStep(ONBOARDING_STEPS.welcome);
    setCompletedSteps([]);
  }, []);

  const completeStep = useCallback((stepId: string) => {
    const newCompletedSteps = [...completedSteps, stepId];
    setCompletedSteps(newCompletedSteps);
    
    // Guardar progreso
    localStorage.setItem(`onboarding_${user?.id}`, JSON.stringify({
      completedSteps: newCompletedSteps,
      userRole,
      lastUpdate: Date.now()
    }));

    // Avanzar al siguiente paso
    const stepIds = Object.keys(ONBOARDING_STEPS);
    const currentIndex = stepIds.indexOf(stepId);
    const nextStepId = stepIds[currentIndex + 1];
    
    if (nextStepId) {
      const nextStep = ONBOARDING_STEPS[nextStepId];
      
      // Verificar si el paso es relevante para el rol
      if (!nextStep.role || nextStep.role.includes(userRole)) {
        setCurrentStep(nextStep);
      } else {
        // Saltar pasos no relevantes
        completeStep(nextStepId);
      }
    } else {
      // Onboarding completado
      setIsOnboardingActive(false);
      setCurrentStep(null);
    }
  }, [completedSteps, user?.id, userRole]);

  const skipOnboarding = useCallback(() => {
    setIsOnboardingActive(false);
    setCurrentStep(null);
    
    // Marcar como completado pero saltado
    localStorage.setItem(`onboarding_${user?.id}`, JSON.stringify({
      completedSteps: ['skipped'],
      userRole,
      lastUpdate: Date.now()
    }));
  }, [user?.id, userRole]);

  const showHint = useCallback((hintId: string) => {
    setActiveHint(hintId);
  }, []);

  const hideHint = useCallback(() => {
    setActiveHint(null);
  }, []);

  const isStepCompleted = useCallback((stepId: string) => {
    return completedSteps.includes(stepId);
  }, [completedSteps]);

  const shouldShowHint = useCallback((hintId: string) => {
    // Lógica para determinar si mostrar un hint contextual
    const hintFrequency = localStorage.getItem(`hint_${hintId}_frequency`);
    const lastShown = localStorage.getItem(`hint_${hintId}_last_shown`);
    
    if (!hintFrequency) return true; // Primera vez
    if (Date.now() - parseInt(lastShown || '0') > 24 * 60 * 60 * 1000) return true; // Mostrar cada 24h
    
    return false;
  }, []);

  const onboardingProgress = (completedSteps.length / Object.keys(ONBOARDING_STEPS).length) * 100;

  const value: OnboardingContextType = {
    isOnboardingActive,
    currentStep,
    userRole,
    completedSteps,
    onboardingProgress,
    startOnboarding,
    completeStep,
    skipOnboarding,
    showHint,
    hideHint,
    isStepCompleted,
    shouldShowHint
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
