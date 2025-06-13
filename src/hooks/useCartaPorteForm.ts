
import { useCallback } from 'react';
import { useCartaPorteFormState } from '@/hooks/carta-porte/useCartaPorteFormState';
import { useCartaPorteValidation } from '@/hooks/carta-porte/useCartaPorteValidation';
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

  // Validaciones y progreso
  const { stepValidations, totalProgress } = useCartaPorteValidation({ formData });

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

  // Enhanced updateFormData with carta porte update logic
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
    stepValidations,
    totalProgress,
    clearSavedData,
    isCreating,
    isUpdating,
  };
}
