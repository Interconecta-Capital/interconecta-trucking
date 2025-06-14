
import { useCallback } from 'react';
import { useCartaPorteFormState } from '@/hooks/carta-porte/useCartaPorteFormState';
import { useCartaPorteValidationEnhanced } from '@/hooks/carta-porte/useCartaPorteValidationEnhanced';
import { useCartaPorteIntegration } from '@/hooks/carta-porte/useCartaPorteIntegration';
import { useCartaPorteMappersExtendidos, CartaPorteFormDataExtendido } from '@/hooks/carta-porte/useCartaPorteMappersExtendidos';
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';

interface UseCartaPorteFormOptions {
  cartaPorteId?: string;
  enableAI?: boolean;
}

// Interfaz para validaciones de pasos
interface StepValidations {
  [key: string]: boolean;
  configuracion: boolean;
  ubicaciones: boolean;
  mercancias: boolean;
  autotransporte: boolean;
  figuras: boolean;
  xml: boolean;
}

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

  // Mappers extendidos
  const {
    formDataExtendidoToCartaPorteData,
    cartaPorteDataToFormDataExtendido,
  } = useCartaPorteMappersExtendidos();

  // Convertir formData extendido a CartaPorteData para validaciones
  const cartaPorteDataForValidation = useCallback((): CartaPorteData => {
    return formDataExtendidoToCartaPorteData(formData);
  }, [formData, formDataExtendidoToCartaPorteData]);

  // Usar validaciones mejoradas con IA
  const { 
    stepValidations: rawStepValidations, 
    totalProgress,
    aiValidation,
    hasAIEnhancements,
    validationMode,
    overallScore,
    validateComplete
  } = useCartaPorteValidationEnhanced({ 
    formData: cartaPorteDataForValidation(),
    enableAI 
  });

  // Convertir las validaciones al formato correcto
  const stepValidations: StepValidations = {
    configuracion: rawStepValidations.configuracion || false,
    ubicaciones: rawStepValidations.ubicaciones || false,
    mercancias: rawStepValidations.mercancias || false,
    autotransporte: rawStepValidations.autotransporte || false,
    figuras: rawStepValidations.figuras || false,
    xml: rawStepValidations.xml || false,
  };

  // Integración completa con auto-save y sincronización
  const {
    loadCartaPorte,
    saveCartaPorte,
    createNewCartaPorte,
    resetForm,
    clearSavedData,
  } = useCartaPorteIntegration({
    formData: cartaPorteDataForValidation(),
    currentCartaPorteId,
    isLoading,
    isCreating: false,
    isUpdating: false,
    setFormData: (data: CartaPorteData) => {
      const extendedData = cartaPorteDataToFormDataExtendido(data);
      setFormData(extendedData);
    },
    setCurrentCartaPorteId,
  });

  // Enhanced updateFormData con mejor manejo
  const updateFormData = useCallback((section: string, data: any) => {
    console.log('[CartaPorteForm] Actualizando sección:', section);
    updateFormDataBase({ [section]: data });
  }, [updateFormDataBase]);

  // Mappers específicos para convertir datos del formulario
  const formDataToCartaPorteData = useCallback(() => {
    return formDataExtendidoToCartaPorteData(formData);
  }, [formData, formDataExtendidoToCartaPorteData]);

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
    
    // Validaciones tradicionales
    stepValidations,
    totalProgress,
    
    // Capacidades IA
    aiValidation,
    hasAIEnhancements,
    validationMode,
    overallScore,
    validateComplete,
    
    // Auto-save
    clearSavedData,
    
    // Estados de sincronización
    isCreating: false,
    isUpdating: false,
    
    // Mappers
    formDataExtendidoToCartaPorteData,
    cartaPorteDataToFormDataExtendido,
    formDataToCartaPorteData,
    formAutotransporteToData,
    formFigurasToData,
  };
}
