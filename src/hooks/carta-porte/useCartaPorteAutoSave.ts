
import { useEffect, useCallback } from 'react';
import { useAutoSave } from '@/hooks/useAutoSave';
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';

interface UseCartaPorteAutoSaveOptions {
  formData: CartaPorteData;
  currentCartaPorteId?: string;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
}

export function useCartaPorteAutoSave({
  formData,
  currentCartaPorteId,
  isLoading,
  isCreating,
  isUpdating,
}: UseCartaPorteAutoSaveOptions) {
  
  // Auto-guardado más conservador con mejor control
  const { loadSavedData, clearSavedData } = useAutoSave({
    data: formData,
    key: `cartaporte-form-${currentCartaPorteId || 'new'}`,
    delay: 5000,
    enabled: !!(formData.rfcEmisor && formData.rfcReceptor && !isLoading && !isCreating && !isUpdating),
    useSessionStorage: true,
  });

  return {
    loadSavedData,
    clearSavedData,
  };
}
