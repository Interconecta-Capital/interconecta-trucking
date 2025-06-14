import { useCallback } from 'react';
import { useCartaPorteFormState } from '@/hooks/carta-porte/useCartaPorteFormState';
import { useCartaPorteValidationEnhanced } from '@/hooks/carta-porte/useCartaPorteValidationEnhanced';
import { useCartaPorteAutoSave } from '@/hooks/carta-porte/useCartaPorteAutoSave';
import { useCartaPorteSync } from '@/hooks/carta-porte/useCartaPorteSync';

interface UseCartaPorteFormOptions {
  cartaPorteId?: string;
}

export function useCartaPorteForm({ cartaPorteId }: UseCartaPorteFormOptions = {}) {
  // Estado del formulario
  const {
    formData,
    currentCartaPorteId,
    setCurrentCartaPorteId,
    isLoading,
    setIsLoading,
    updateFormData: updateFormDataBase,
    setFormData,
  } = useCartaPorteFormState({ cartaPorteId });

  // Usar validaciones mejoradas en lugar de las tradicionales
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

  // Auto-guardado
  const { clearSavedData } = useCartaPorteAutoSave({
    formData,
    currentCartaPorteId,
    isLoading,
    isCreating: false, // Will be updated by sync hook
    isUpdating: false, // Will be updated by sync hook
  });

  // Sincronización con base de datos
  const { isCreating, isUpdating, updateCartaPorte } = useCartaPorteSync({
    formData,
    currentCartaPorteId,
    cartaPorteId,
    isLoading,
    setFormData,
    setCurrentCartaPorteId,
  });

  // Enhanced updateFormData with AI validation feedback
  const updateFormData = useCallback((section: string, data: any) => {
    console.log('[CartaPorteForm] Updating section:', section);
    
    updateFormDataBase(section, data);
    
    // Handle configuration updates with carta porte sync
    if (section === 'configuracion') {
      const newData = { ...formData, ...data };
      updateCartaPorte(newData);
    }
  }, [formData, updateFormDataBase, updateCartaPorte]);

  return {
    formData,
    currentCartaPorteId,
    isLoading,
    updateFormData,
    
    // Mantener validaciones tradicionales para compatibilidad
    stepValidations,
    totalProgress,
    
    // Agregar nuevas capacidades IA
    aiValidation,
    hasAIEnhancements,
    validationMode,
    overallScore,
    
    clearSavedData,
    isCreating,
    isUpdating,
  };
}
