
import { useCallback } from 'react';
import { useCartaPorteFormState } from '@/hooks/carta-porte/useCartaPorteFormState';
import { useCartaPorteValidationEnhanced } from '@/hooks/carta-porte/useCartaPorteValidationEnhanced';
import { useCartaPorteIntegration } from '@/hooks/carta-porte/useCartaPorteIntegration';

interface UseCartaPorteFormOptions {
  cartaPorteId?: string;
}

export function useCartaPorteForm({ cartaPorteId }: UseCartaPorteFormOptions = {}) {
  // Estado del formulario
  const {
    formData,
    setFormData,
    currentCartaPorteId,
    setCurrentCartaPorteId,
    isLoading,
    setIsLoading,
    updateFormData: updateFormDataBase,
  } = useCartaPorteFormState({ cartaPorteId });

  // Usar validaciones mejoradas con IA
  const { 
    stepValidations, 
    totalProgress,
    aiValidation,
    hasAIEnhancements,
    validationMode,
    overallScore
  } = useCartaPorteValidationEnhanced({ 
    formData,
    enableAI: true 
  });

  // Integración completa con auto-save y sincronización
  const {
    formDataToCartaPorteData,
    cartaPorteDataToFormData,
    loadCartaPorte,
    saveCartaPorte,
    createNewCartaPorte,
    resetForm,
    clearSavedData,
  } = useCartaPorteIntegration({
    formData,
    currentCartaPorteId,
    isLoading,
    isCreating: false, // TODO: obtener del estado
    isUpdating: false, // TODO: obtener del estado
    setFormData,
    setCurrentCartaPorteId,
  });

  // Enhanced updateFormData con mejor manejo
  const updateFormData = useCallback((section: string, data: any) => {
    console.log('[CartaPorteForm] Actualizando sección:', section);
    updateFormDataBase({ [section]: data });
  }, [updateFormDataBase]);

  return {
    // Estado del formulario
    formData,
    currentCartaPorteId,
    isLoading,
    
    // Acciones básicas
    updateFormData,
    loadCartaPorte,
    saveCartaPorte,
    createNewCartaPorte,
    resetForm,
    
    // Validaciones tradicionales
    stepValidations,
    totalProgress,
    
    // Capacidades IA
    aiValidation,
    hasAIEnhancements,
    validationMode,
    overallScore,
    
    // Auto-save
    clearSavedData,
    
    // Estados de sincronización
    isCreating: false, // TODO: implementar estado real
    isUpdating: false, // TODO: implementar estado real
    
    // Mappers
    formDataToCartaPorteData,
    cartaPorteDataToFormData,
  };
}
