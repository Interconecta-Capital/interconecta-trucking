/**
 * Hook especializado para manejar el estado del ViajeWizard
 * Separa la lógica de estado de la lógica de UI
 */

import { useState, useCallback } from 'react';
import { ViajeWizardData } from '@/components/viajes/ViajeWizard';

export const useViajeWizardState = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<ViajeWizardData>({} as ViajeWizardData);
  const [showValidacionPreViaje, setShowValidacionPreViaje] = useState(false);
  const [isGeneratingDocuments, setIsGeneratingDocuments] = useState(false);
  const [viajeConfirmado, setViajeConfirmado] = useState(false);

  // Snapshot para detectar cambios no guardados
  const [initialSnapshot, setInitialSnapshot] = useState<string>('{}');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const updateData = useCallback((updates: Partial<ViajeWizardData>) => {
    setData(prev => {
      const newData = { ...prev, ...updates };
      
      // Detectar cambios
      if (JSON.stringify(newData) !== initialSnapshot) {
        setHasUnsavedChanges(true);
      }
      
      return newData;
    });
  }, [initialSnapshot]);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  }, []);

  const previousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setData({} as ViajeWizardData);
    setShowValidacionPreViaje(false);
    setIsGeneratingDocuments(false);
    setViajeConfirmado(false);
    setInitialSnapshot('{}');
    setHasUnsavedChanges(false);
  }, []);

  return {
    // Estado
    currentStep,
    data,
    showValidacionPreViaje,
    isGeneratingDocuments,
    viajeConfirmado,
    hasUnsavedChanges,
    initialSnapshot,
    
    // Acciones
    setCurrentStep,
    updateData,
    nextStep,
    previousStep,
    setShowValidacionPreViaje,
    setIsGeneratingDocuments,
    setViajeConfirmado,
    setInitialSnapshot,
    setHasUnsavedChanges,
    resetWizard
  };
};
