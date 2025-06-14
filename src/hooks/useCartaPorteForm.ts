
import { useCallback } from 'react';
import { useCartaPorteFormState } from '@/hooks/carta-porte/useCartaPorteFormState';
import { useCartaPorteIntegration } from '@/hooks/carta-porte/useCartaPorteIntegration';
import { useCartaPorteMappersExtendidos, CartaPorteFormDataExtendido } from '@/hooks/carta-porte/useCartaPorteMappersExtendidos';
import { useCartaPorteStableData } from '@/hooks/carta-porte/useCartaPorteStableData';
import { useCartaPorteFormValidation } from '@/hooks/carta-porte/useCartaPorteFormValidation';
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';
import { UseCartaPorteFormOptions } from '@/hooks/carta-porte/types/useCartaPorteFormTypes';

export function useCartaPorteForm({ cartaPorteId, enableAI = true }: UseCartaPorteFormOptions = {}) {
  // Estado del formulario con tipos extendidos
  const {
    formData,
    setFormData,
    currentCartaPorteId,
    setCurrentCartaPorteId,
    isLoading,
    setIsLoading,
    updateFormData: updateFormDataBase,
  } = useCartaPorteFormState({ cartaPorteId });

  // Mappers estables
  const {
    formDataExtendidoToCartaPorteData,
    cartaPorteDataToFormDataExtendido,
  } = useCartaPorteMappersExtendidos();

  // Datos estables para validación
  const { stableFormDataForValidation, formDataForValidation } = useCartaPorteStableData({ 
    formData 
  });

  // Validaciones
  const validationData = useCartaPorteFormValidation({
    formDataForValidation,
    enableAI
  });

  // Función estable para actualizar datos sin causar loops
  const stableSetFormData = useCallback((data: CartaPorteData) => {
    try {
      // Evitar updates circulares comparando solo datos relevantes
      const currentSignature = [
        stableFormDataForValidation.rfcEmisor,
        stableFormDataForValidation.nombreEmisor,
        stableFormDataForValidation.rfcReceptor,
        stableFormDataForValidation.nombreReceptor,
        String(stableFormDataForValidation.ubicaciones?.length || 0),
        String(stableFormDataForValidation.mercancias?.length || 0)
      ].join('|');
      
      const newSignature = [
        data.rfcEmisor,
        data.nombreEmisor,
        data.rfcReceptor,
        data.nombreReceptor,
        String(data.ubicaciones?.length || 0),
        String(data.mercancias?.length || 0)
      ].join('|');
      
      if (currentSignature === newSignature) {
        console.log('[CartaPorteForm] Datos similares, evitando update circular');
        return;
      }
      
      const extendedData = cartaPorteDataToFormDataExtendido(data);
      setFormData(extendedData);
    } catch (error) {
      console.error('[CartaPorteForm] Error converting data to extended format:', error);
    }
  }, [cartaPorteDataToFormDataExtendido, setFormData, stableFormDataForValidation]);

  // Integración completa con auto-save y sincronización
  const integrationResult = useCartaPorteIntegration({
    formData: formDataForValidation,
    currentCartaPorteId,
    isLoading,
    isCreating: false,
    isUpdating: false,
    setFormData: stableSetFormData,
    setCurrentCartaPorteId,
  });

  const {
    loadCartaPorte,
    saveCartaPorte,
    createNewCartaPorte,
    resetForm,
    clearSavedData,
  } = integrationResult;

  // Enhanced updateFormData con mejor manejo
  const updateFormData = useCallback((section: string, data: any) => {
    console.log('[CartaPorteForm] Actualizando sección:', section);
    updateFormDataBase({ [section]: data });
  }, [updateFormDataBase]);

  // Mappers específicos estables
  const formDataToCartaPorteDataStable = useCallback(() => {
    return stableFormDataForValidation;
  }, [stableFormDataForValidation]);

  const formAutotransporteToData = useCallback((autotransporteForm: any) => {
    return autotransporteForm || formData.autotransporte;
  }, [formData.autotransporte]);

  const formFigurasToData = useCallback((figurasForm: any) => {
    return figurasForm || formData.figuras;
  }, [formData.figuras]);

  return {
    // Estado del formulario (siempre extendido)
    formData,
    currentCartaPorteId,
    isLoading,
    
    // Acciones básicas
    updateFormData,
    loadCartaPorte,
    saveCartaPorte,
    createNewCartaPorte,
    resetForm,
    
    // Validaciones y capacidades IA
    ...validationData,
    
    // Auto-save
    clearSavedData,
    
    // Estados de sincronización
    isCreating: false,
    isUpdating: false,
    
    // Mappers
    formDataExtendidoToCartaPorteData,
    cartaPorteDataToFormDataExtendido,
    formDataToCartaPorteData: formDataToCartaPorteDataStable,
    formAutotransporteToData,
    formFigurasToData,
  };
}
