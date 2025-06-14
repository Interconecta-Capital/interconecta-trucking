
import { useCallback, useRef } from 'react';
import { useCartaPorteFormState } from '@/hooks/carta-porte/useCartaPorteFormState';
import { useCartaPorteIntegration } from '@/hooks/carta-porte/useCartaPorteIntegration';
import { useCartaPorteMappersExtendidos } from '@/hooks/carta-porte/useCartaPorteMappersExtendidos';
import { useCartaPorteStableData } from '@/hooks/carta-porte/useCartaPorteStableData';
import { useCartaPorteFormValidation } from '@/hooks/carta-porte/useCartaPorteFormValidation';
import { CartaPorteData } from '@/types/cartaPorte';
import { UseCartaPorteFormOptions } from '@/hooks/carta-porte/types/useCartaPorteFormTypes';

export function useCartaPorteForm({ cartaPorteId, enableAI = true }: UseCartaPorteFormOptions = {}) {
  console.log('[useCartaPorteForm] Hook called with:', { cartaPorteId, enableAI });
  
  // Referencias para evitar bucles infinitos
  const lastSetDataRef = useRef<string>('');
  const renderCountRef = useRef(0);
  
  // Incrementar contador de renders para debug
  renderCountRef.current += 1;
  console.log('[useCartaPorteForm] Render #', renderCountRef.current);
  
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

  console.log('[useCartaPorteForm] Form state:', {
    hasFormData: !!formData,
    currentCartaPorteId,
    isLoading
  });

  // Mappers estables
  const {
    formDataExtendidoToCartaPorteData,
    cartaPorteDataToFormDataExtendido,
  } = useCartaPorteMappersExtendidos();

  // Datos estables para validación
  const { stableFormDataForValidation, formDataForValidation } = useCartaPorteStableData({ 
    formData 
  });

  console.log('[useCartaPorteForm] Stable data created');

  // Validaciones
  const validationData = useCartaPorteFormValidation({
    formDataForValidation,
    enableAI
  });

  console.log('[useCartaPorteForm] Validation completed');

  // Función estable para actualizar datos sin causar loops
  const stableSetFormData = useCallback((data: CartaPorteData) => {
    console.log('[useCartaPorteForm] stableSetFormData called');
    
    try {
      // Crear signature para evitar updates circulares
      const newSignature = [
        data.rfcEmisor,
        data.nombreEmisor,
        data.rfcReceptor,
        data.nombreReceptor,
        String(data.ubicaciones?.length || 0),
        String(data.mercancias?.length || 0)
      ].join('|');
      
      // Evitar updates circulares
      if (lastSetDataRef.current === newSignature) {
        console.log('[CartaPorteForm] Datos similares, evitando update circular');
        return;
      }
      
      lastSetDataRef.current = newSignature;
      const extendedData = cartaPorteDataToFormDataExtendido(data);
      setFormData(extendedData);
      console.log('[useCartaPorteForm] Data set successfully');
    } catch (error) {
      console.error('[CartaPorteForm] Error converting data to extended format:', error);
    }
  }, [cartaPorteDataToFormDataExtendido, setFormData]);

  // Integración completa con auto-save y sincronización
  const integrationResult = useCartaPorteIntegration({
    formData: formDataForValidation, // Use the converted form data
    currentCartaPorteId,
    isLoading,
    isCreating: false,
    isUpdating: false,
    setFormData: (data) => {
      // Convert CartaPorteFormData back to CartaPorteData for stableSetFormData
      const cartaPorteData = formDataExtendidoToCartaPorteData({
        ...formData,
        configuracion: data.configuracion,
        ubicaciones: data.ubicaciones,
        mercancias: data.mercancias.map(m => ({
          ...m,
          bienes_transp: m.claveProdServ || m.descripcion || '',
        })),
        autotransporte: {
          placa_vm: data.autotransporte.placaVm,
          anio_modelo_vm: new Date().getFullYear(),
          config_vehicular: data.autotransporte.configuracionVehicular,
          perm_sct: 'TPAF02',
          num_permiso_sct: '',
          asegura_resp_civil: data.autotransporte.seguro.aseguradora,
          poliza_resp_civil: data.autotransporte.seguro.poliza,
          asegura_med_ambiente: '',
          poliza_med_ambiente: '',
        },
        figuras: data.figuras,
        tipoCreacion: data.tipoCreacion,
        tipoCfdi: data.tipoCfdi,
        rfcEmisor: data.rfcEmisor,
        nombreEmisor: data.nombreEmisor,
        rfcReceptor: data.rfcReceptor,
        nombreReceptor: data.nombreReceptor,
        transporteInternacional: data.transporteInternacional,
        registroIstmo: data.registroIstmo,
        cartaPorteVersion: data.cartaPorteVersion,
        cartaPorteId: data.cartaPorteId,
      });
      stableSetFormData(cartaPorteData);
    },
    setCurrentCartaPorteId,
  });

  console.log('[useCartaPorteForm] Integration completed');

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

  console.log('[useCartaPorteForm] Hook completed successfully');

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
