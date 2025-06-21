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
  detailedExplanation?: string;
  actionRequired?: string;
  tips?: string[];
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
  startWizardTutorial: () => void;
  isWizardTutorialActive: boolean;
  wizardStep: string | null;
  nextWizardStep: () => void;
  skipWizardTutorial: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const WIZARD_TUTORIAL_STEPS: Record<string, OnboardingStepData> = {
  welcome: {
    id: 'welcome',
    title: '¡Bienvenido al Asistente de Viajes!',
    description: 'Te guiaré paso a paso para crear tu primer viaje con todos los documentos SAT requeridos.',
    detailedExplanation: 'Este asistente te ayudará a generar automáticamente una Carta Porte CFDI 3.1 completamente válida. No te preocupes por los detalles técnicos, el sistema se encarga de todo.',
    tips: [
      'Todos los campos se validan automáticamente',
      'El sistema detecta errores antes de que sucedan',
      'Los documentos se generan al finalizar'
    ],
    completed: false
  },
  cliente: {
    id: 'cliente',
    title: 'Seleccionar Cliente',
    description: 'Primero necesitamos identificar para quién es este viaje.',
    targetElement: '[data-onboarding="cliente-section"]',
    detailedExplanation: 'El cliente es la persona o empresa que recibirá la mercancía. Su RFC debe estar registrado en el SAT y será validado automáticamente.',
    actionRequired: 'Busca y selecciona un cliente de tu base de datos',
    tips: [
      'Puedes buscar por nombre o RFC',
      'El RFC se valida automáticamente',
      'Solo clientes con RFC válido pueden continuar'
    ],
    completed: false
  },
  tipoServicio: {
    id: 'tipoServicio',
    title: 'Tipo de Servicio',
    description: 'Define si es un flete pagado o traslado propio.',
    targetElement: '[data-onboarding="tipo-servicio-section"]',
    detailedExplanation: 'Esto determina el tipo de CFDI que se generará: Ingreso (si cobras por el transporte) o Traslado (si es mercancía propia).',
    actionRequired: 'Selecciona el tipo de operación que realizarás',
    tips: [
      'Flete Pagado: Generas un CFDI de Ingreso',
      'Traslado Propio: Generas un CFDI de Traslado',
      'Esta decisión afecta la documentación fiscal'
    ],
    completed: false
  },
  mercancia: {
    id: 'mercancia',
    title: 'Descripción de Mercancía',
    description: 'Describe qué vas a transportar con ayuda de IA.',
    targetElement: '[data-onboarding="mercancia-section"]',
    detailedExplanation: 'Nuestro sistema de IA analizará tu descripción y sugerirá automáticamente las claves SAT correctas, alertas de cumplimiento y datos técnicos.',
    actionRequired: 'Describe detalladamente la mercancía a transportar',
    tips: [
      'Incluye peso, tipo de producto y cantidad',
      'El sistema detecta productos peligrosos automáticamente',
      'Para exportación, menciona "exportación" en la descripción'
    ],
    completed: false
  },
  ruta: {
    id: 'ruta',
    title: 'Establecer Ruta',
    description: 'Define origen y destino con cálculo automático de distancia.',
    targetElement: '[data-onboarding="ruta-section"]',
    detailedExplanation: 'El sistema calculará automáticamente la distancia real usando Google Maps API. Esta información es requerida para la Carta Porte.',
    actionRequired: 'Ingresa las direcciones de origen y destino',
    tips: [
      'Las direcciones se validan automáticamente',
      'La distancia se calcula con Google Maps',
      'El tiempo estimado se genera automáticamente'
    ],
    completed: false
  },
  activos: {
    id: 'activos',
    title: 'Asignar Vehículo y Conductor',
    description: 'Selecciona los activos que realizarán el viaje.',
    targetElement: '[data-onboarding="activos-section"]',
    detailedExplanation: 'Tanto el vehículo como el conductor deben estar registrados en tu sistema y tener la documentación vigente.',
    actionRequired: 'Selecciona vehículo y conductor del viaje',
    tips: [
      'Solo aparecen vehículos con documentos vigentes',
      'Los conductores deben tener licencia actualizada',
      'La capacidad del vehículo debe ser suficiente'
    ],
    completed: false
  },
  validaciones: {
    id: 'validaciones',
    title: 'Validaciones Avanzadas',
    description: 'El sistema verifica el cumplimiento normativo automáticamente.',
    targetElement: '[data-onboarding="validaciones-step"]',
    detailedExplanation: 'Nuestro motor de IA revisa más de 50 puntos de cumplimiento SAT para asegurar que tu documento será aceptado sin rechazos.',
    actionRequired: 'Revisa y corrige cualquier alerta mostrada',
    tips: [
      'Las validaciones se ejecutan automáticamente',
      'Los errores críticos bloquean el avance',
      'Las sugerencias mejoran la calidad del documento'
    ],
    completed: false
  },
  confirmacion: {
    id: 'confirmacion',
    title: 'Confirmar y Generar Documentos',
    description: 'Revisa todo y genera los documentos fiscales.',
    targetElement: '[data-onboarding="confirm-viaje-btn"]',
    detailedExplanation: 'Al confirmar se generarán automáticamente: Carta Porte XML, PDF imprimible, y el registro del viaje en tu sistema.',
    actionRequired: 'Confirma todos los datos y genera los documentos',
    tips: [
      'Los documentos se generan automáticamente',
      'El XML está firmado digitalmente',
      'El viaje queda registrado para seguimiento'
    ],
    completed: false
  }
};

const ONBOARDING_STEPS: Record<string, OnboardingStepData> = {
  welcome: {
    id: 'welcome',
    title: '¡Bienvenido a Interconecta!',
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
  
  // Wizard Tutorial State
  const [isWizardTutorialActive, setIsWizardTutorialActive] = useState(false);
  const [wizardStep, setWizardStep] = useState<string | null>(null);

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
    // Verificar si el usuario optó por no mostrar la bienvenida
    const neverShowWelcome = localStorage.getItem('never_show_welcome');
    if (neverShowWelcome === 'true') return;

    const savedProgress = localStorage.getItem(`onboarding_${user?.id}`);
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setCompletedSteps(progress.completedSteps || []);
      
      // Solo auto-iniciar si no se ha marcado como "nunca mostrar"
      if (progress.completedSteps?.length === 0 && userRole === 'nuevo' && !neverShowWelcome) {
        setIsOnboardingActive(true);
        setCurrentStep(ONBOARDING_STEPS.welcome);
      }
    } else if (userRole === 'nuevo' && !neverShowWelcome) {
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

  const startWizardTutorial = useCallback(() => {
    console.log('🎓 Starting wizard tutorial for new user');
    setIsWizardTutorialActive(true);
    setWizardStep('welcome');
    
    // Save that wizard tutorial has started
    localStorage.setItem(`wizard_tutorial_${user?.id}`, JSON.stringify({
      active: true,
      currentStep: 'welcome',
      startedAt: Date.now()
    }));
  }, [user?.id]);

  const nextWizardStep = useCallback(() => {
    const stepKeys = Object.keys(WIZARD_TUTORIAL_STEPS);
    const currentIndex = stepKeys.indexOf(wizardStep || '');
    const nextStep = stepKeys[currentIndex + 1];
    
    if (nextStep) {
      setWizardStep(nextStep);
      localStorage.setItem(`wizard_tutorial_${user?.id}`, JSON.stringify({
        active: true,
        currentStep: nextStep,
        updatedAt: Date.now()
      }));
    } else {
      // Tutorial completed
      setIsWizardTutorialActive(false);
      setWizardStep(null);
      localStorage.setItem(`wizard_tutorial_${user?.id}`, JSON.stringify({
        active: false,
        completed: true,
        completedAt: Date.now()
      }));
    }
  }, [wizardStep, user?.id]);

  const skipWizardTutorial = useCallback(() => {
    setIsWizardTutorialActive(false);
    setWizardStep(null);
    localStorage.setItem(`wizard_tutorial_${user?.id}`, JSON.stringify({
      active: false,
      skipped: true,
      skippedAt: Date.now()
    }));
  }, [user?.id]);

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
    shouldShowHint,
    startWizardTutorial,
    isWizardTutorialActive,
    wizardStep,
    nextWizardStep,
    skipWizardTutorial
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

// Export wizard steps for use in components
export { WIZARD_TUTORIAL_STEPS };
