
import { useCallback, useMemo } from 'react';
import { useCartaPorteFormState } from '@/hooks/carta-porte/useCartaPorteFormState';
import { useCartaPorteValidationEnhanced } from '@/hooks/carta-porte/useCartaPorteValidationEnhanced';
import { useCartaPorteIntegration } from '@/hooks/carta-porte/useCartaPorteIntegration';
import { useCartaPorteMappersExtendidos, CartaPorteFormDataExtendido } from '@/hooks/carta-porte/useCartaPorteMappersExtendidos';
import { useCartaPorteDataConverters } from '@/hooks/carta-porte/useCartaPorteDataConverters';
import { useCartaPorteMappers, CartaPorteFormData } from '@/hooks/carta-porte/useCartaPorteMappers';
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

  // Mappers normales para validación - renombrados para evitar conflictos
  const { 
    formDataToCartaPorteData: mapperFormDataToCartaPorteData, 
    cartaPorteDataToFormData 
  } = useCartaPorteMappers();

  // Converters para datos
  const { convertExtendedToCartaPorteData } = useCartaPorteDataConverters();

  // Estabilizar la conversión de datos - usar JSON.stringify para comparación estable
  const formDataString = useMemo(() => JSON.stringify(formData), [formData]);
  
  // Conversión estable sin re-renders - solo depende del string serializado
  const cartaPorteDataForValidation = useMemo((): CartaPorteData => {
    try {
      const parsedFormData = JSON.parse(formDataString);
      return convertExtendedToCartaPorteData(parsedFormData);
    } catch (error) {
      console.error('[CartaPorteForm] Error converting data for validation:', error);
      // Retornar datos mínimos válidos en caso de error
      const parsedFormData = JSON.parse(formDataString);
      return {
        tipoCreacion: parsedFormData.tipoCreacion || 'manual',
        tipoCfdi: parsedFormData.tipoCfdi || 'Traslado',
        rfcEmisor: parsedFormData.rfcEmisor || '',
        nombreEmisor: parsedFormData.nombreEmisor || '',
        rfcReceptor: parsedFormData.rfcReceptor || '',
        nombreReceptor: parsedFormData.nombreReceptor || '',
        transporteInternacional: parsedFormData.transporteInternacional || false,
        registroIstmo: parsedFormData.registroIstmo || false,
        cartaPorteVersion: parsedFormData.cartaPorteVersion || '3.1',
        ubicaciones: [],
        mercancias: [],
        autotransporte: parsedFormData.autotransporte || {},
        figuras: [],
        cartaPorteId: parsedFormData.cartaPorteId,
      };
    }
  }, [formDataString, convertExtendedToCartaPorteData]);

  // Convertir a formato compatible con validación - estabilizado
  const formDataForValidation = useMemo((): CartaPorteFormData => {
    try {
      return cartaPorteDataToFormData(cartaPorteDataForValidation);
    } catch (error) {
      console.error('[CartaPorteForm] Error converting to form data:', error);
      // Retornar datos mínimos válidos en caso de error
      const parsedFormData = JSON.parse(formDataString);
      return {
        configuracion: {
          version: parsedFormData.cartaPorteVersion || '3.1',
          tipoComprobante: parsedFormData.tipoCfdi === 'Traslado' ? 'T' : 'I',
          emisor: {
            rfc: parsedFormData.rfcEmisor || '',
            nombre: parsedFormData.nombreEmisor || '',
            regimenFiscal: '',
          },
          receptor: {
            rfc: parsedFormData.rfcReceptor || '',
            nombre: parsedFormData.nombreReceptor || '',
          },
        },
        ubicaciones: [],
        mercancias: [],
        autotransporte: {
          placaVm: '',
          configuracionVehicular: '',
          seguro: {
            aseguradora: '',
            poliza: '',
            vigencia: '',
          },
        },
        figuras: [],
        tipoCreacion: parsedFormData.tipoCreacion || 'manual',
        tipoCfdi: parsedFormData.tipoCfdi || 'Traslado',
        rfcEmisor: parsedFormData.rfcEmisor || '',
        nombreEmisor: parsedFormData.nombreEmisor || '',
        rfcReceptor: parsedFormData.rfcReceptor || '',
        nombreReceptor: parsedFormData.nombreReceptor || '',
        transporteInternacional: parsedFormData.transporteInternacional || false,
        registroIstmo: parsedFormData.registroIstmo || false,
        cartaPorteVersion: parsedFormData.cartaPorteVersion || '3.1',
        cartaPorteId: parsedFormData.cartaPorteId,
      };
    }
  }, [cartaPorteDataForValidation, cartaPorteDataToFormData, formDataString]);

  // Usar validaciones mejoradas con IA - estabilizado
  const validationResult = useCartaPorteValidationEnhanced({ 
    formData: formDataForValidation,
    enableAI 
  });

  const { 
    stepValidations: rawStepValidations, 
    totalProgress,
    aiValidation,
    hasAIEnhancements,
    validationMode,
    overallScore,
    validateComplete
  } = validationResult;

  // Convertir las validaciones al formato correcto - memoizado para estabilidad
  const stepValidations: StepValidations = useMemo(() => ({
    configuracion: rawStepValidations?.configuracion || false,
    ubicaciones: rawStepValidations?.ubicaciones || false,
    mercancias: rawStepValidations?.mercancias || false,
    autotransporte: rawStepValidations?.autotransporte || false,
    figuras: rawStepValidations?.figuras || false,
  }), [rawStepValidations]);

  // Función estable para actualizar datos - usando useCallback para prevenir re-renders
  const stableSetFormData = useCallback((data: CartaPorteData) => {
    try {
      const extendedData = cartaPorteDataToFormDataExtendido(data);
      setFormData(extendedData);
    } catch (error) {
      console.error('[CartaPorteForm] Error converting data to extended format:', error);
    }
  }, [cartaPorteDataToFormDataExtendido, setFormData]);

  // Integración completa con auto-save y sincronización - usar formDataForValidation
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

  // Mappers específicos para convertir datos del formulario - estabilizados
  const formDataToCartaPorteDataStable = useCallback(() => {
    return cartaPorteDataForValidation;
  }, [cartaPorteDataForValidation]);

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
    totalProgress: totalProgress || 0,
    
    // Capacidades IA
    aiValidation,
    hasAIEnhancements: hasAIEnhancements || false,
    validationMode: validationMode || 'standard',
    overallScore: overallScore || 0,
    validateComplete,
    
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
