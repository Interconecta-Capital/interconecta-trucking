
import { useCallback, useMemo, useRef } from 'react';
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
  // Referencias para evitar re-renders
  const lastValidationDataRef = useRef<string>('');
  const lastCartaPorteDataRef = useRef<CartaPorteData | null>(null);
  
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

  // Mappers normales para validación
  const { 
    formDataToCartaPorteData: mapperFormDataToCartaPorteData, 
    cartaPorteDataToFormData 
  } = useCartaPorteMappers();

  // Converters para datos
  const { convertExtendedToCartaPorteData } = useCartaPorteDataConverters();

  // Crear una versión estable de los datos para validación
  const stableFormDataForValidation = useMemo((): CartaPorteData => {
    const currentDataString = JSON.stringify({
      tipoCreacion: formData.tipoCreacion || 'manual',
      tipoCfdi: formData.tipoCfdi || 'Traslado',
      rfcEmisor: formData.rfcEmisor || '',
      nombreEmisor: formData.nombreEmisor || '',
      rfcReceptor: formData.rfcReceptor || '',
      nombreReceptor: formData.nombreReceptor || '',
      transporteInternacional: formData.transporteInternacional || false,
      registroIstmo: formData.registroIstmo || false,
      cartaPorteVersion: formData.cartaPorteVersion || '3.1',
      ubicacionesLength: formData.ubicaciones?.length || 0,
      mercanciasLength: formData.mercancias?.length || 0,
      hasAutotransporte: !!formData.autotransporte,
      figurasLength: formData.figuras?.length || 0,
    });

    // Solo recalcular si los datos han cambiado realmente
    if (currentDataString === lastValidationDataRef.current && lastCartaPorteDataRef.current) {
      return lastCartaPorteDataRef.current;
    }

    lastValidationDataRef.current = currentDataString;

    try {
      const cartaPorteData = convertExtendedToCartaPorteData(formData);
      lastCartaPorteDataRef.current = cartaPorteData;
      return cartaPorteData;
    } catch (error) {
      console.error('[CartaPorteForm] Error converting data for validation:', error);
      
      // Retornar datos mínimos válidos
      const fallbackData: CartaPorteData = {
        tipoCreacion: formData.tipoCreacion || 'manual',
        tipoCfdi: formData.tipoCfdi || 'Traslado',
        rfcEmisor: formData.rfcEmisor || '',
        nombreEmisor: formData.nombreEmisor || '',
        rfcReceptor: formData.rfcReceptor || '',
        nombreReceptor: formData.nombreReceptor || '',
        transporteInternacional: formData.transporteInternacional || false,
        registroIstmo: formData.registroIstmo || false,
        cartaPorteVersion: formData.cartaPorteVersion || '3.1',
        ubicaciones: formData.ubicaciones || [],
        mercancias: formData.mercancias || [],
        autotransporte: formData.autotransporte || {},
        figuras: formData.figuras || [],
        cartaPorteId: formData.cartaPorteId,
      };
      
      lastCartaPorteDataRef.current = fallbackData;
      return fallbackData;
    }
  }, [
    formData.tipoCreacion,
    formData.tipoCfdi,
    formData.rfcEmisor,
    formData.nombreEmisor,
    formData.rfcReceptor,
    formData.nombreReceptor,
    formData.transporteInternacional,
    formData.registroIstmo,
    formData.cartaPorteVersion,
    formData.ubicaciones?.length,
    formData.mercancias?.length,
    formData.autotransporte,
    formData.figuras?.length,
    formData.cartaPorteId,
    convertExtendedToCartaPorteData
  ]);

  // Convertir a formato compatible con validación de forma estable
  const formDataForValidation = useMemo((): CartaPorteFormData => {
    try {
      return cartaPorteDataToFormData(stableFormDataForValidation);
    } catch (error) {
      console.error('[CartaPorteForm] Error converting to form data for validation:', error);
      
      // Retornar datos mínimos válidos
      return {
        configuracion: {
          version: formData.cartaPorteVersion || '3.1',
          tipoComprobante: formData.tipoCfdi === 'Traslado' ? 'T' : 'I',
          emisor: {
            rfc: formData.rfcEmisor || '',
            nombre: formData.nombreEmisor || '',
            regimenFiscal: '',
          },
          receptor: {
            rfc: formData.rfcReceptor || '',
            nombre: formData.nombreReceptor || '',
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
        tipoCreacion: formData.tipoCreacion || 'manual',
        tipoCfdi: formData.tipoCfdi || 'Traslado',
        rfcEmisor: formData.rfcEmisor || '',
        nombreEmisor: formData.nombreEmisor || '',
        rfcReceptor: formData.rfcReceptor || '',
        nombreReceptor: formData.nombreReceptor || '',
        transporteInternacional: formData.transporteInternacional || false,
        registroIstmo: formData.registroIstmo || false,
        cartaPorteVersion: formData.cartaPorteVersion || '3.1',
        cartaPorteId: formData.cartaPorteId,
      };
    }
  }, [stableFormDataForValidation, cartaPorteDataToFormData, formData]);

  // Usar validaciones mejoradas con IA con datos estables
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

  // Convertir las validaciones al formato correcto
  const stepValidations: StepValidations = useMemo(() => ({
    configuracion: rawStepValidations?.configuracion || false,
    ubicaciones: rawStepValidations?.ubicaciones || false,
    mercancias: rawStepValidations?.mercancias || false,
    autotransporte: rawStepValidations?.autotransporte || false,
    figuras: rawStepValidations?.figuras || false,
  }), [rawStepValidations]);

  // Función estable para actualizar datos sin causar loops
  const stableSetFormData = useCallback((data: CartaPorteData) => {
    try {
      // Evitar updates circulares comparando datos
      const currentDataString = JSON.stringify(stableFormDataForValidation);
      const newDataString = JSON.stringify(data);
      
      if (currentDataString === newDataString) {
        console.log('[CartaPorteForm] Datos iguales, evitando update circular');
        return;
      }
      
      const extendedData = cartaPorteDataToFormDataExtendido(data);
      setFormData(extendedData);
    } catch (error) {
      console.error('[CartaPorteForm] Error converting data to extended format:', error);
    }
  }, [stableFormDataForValidation, cartaPorteDataToFormDataExtendido, setFormData]);

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

  // Mappers específicos para convertir datos del formulario
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
