
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';
import { UseCartaPorteFormOptions } from '@/hooks/carta-porte/types/useCartaPorteFormTypes';

const initialData: CartaPorteData = {
  tipoCreacion: 'manual',
  tipoCfdi: 'Traslado',
  rfcEmisor: '',
  nombreEmisor: '',
  rfcReceptor: '',
  nombreReceptor: '',
  transporteInternacional: false,
  registroIstmo: false,
  cartaPorteVersion: '3.1',
  ubicaciones: [],
  mercancias: [],
  autotransporte: {},
  figuras: [],
};

// Validaciones básicas y estables
const getBasicStepValidations = (formData: CartaPorteData) => ({
  configuracion: Boolean(formData.rfcEmisor && formData.nombreEmisor && formData.rfcReceptor && formData.nombreReceptor),
  ubicaciones: Boolean(formData.ubicaciones && formData.ubicaciones.length > 0),
  mercancias: Boolean(formData.mercancias && formData.mercancias.length > 0),
  autotransporte: Boolean(formData.autotransporte && Object.keys(formData.autotransporte).length > 0),
  figuras: Boolean(formData.figuras && formData.figuras.length > 0),
});

const calculateProgress = (validations: Record<string, boolean>) => {
  const validCount = Object.values(validations).filter(Boolean).length;
  const totalSteps = Object.keys(validations).length;
  return Math.round((validCount / totalSteps) * 100);
};

export function useCartaPorteFormSimplified({ cartaPorteId }: UseCartaPorteFormOptions = {}) {
  const [formData, setFormData] = useState<CartaPorteData>({ ...initialData, cartaPorteId });
  const [currentCartaPorteId, setCurrentCartaPorteId] = useState<string | undefined>(cartaPorteId);
  const [isLoading, setIsLoading] = useState(false);

  // Validaciones estables
  const stepValidations = getBasicStepValidations(formData);
  const totalProgress = calculateProgress(stepValidations);

  const updateFormData = useCallback((section: keyof CartaPorteData, data: any) => {
    setFormData(prev => ({ ...prev, [section]: data }));
  }, []);

  const loadCartaPorte = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('cartas_porte')
        .select('datos_formulario')
        .eq('id', id)
        .single();
      if (error) throw error;
      if (data?.datos_formulario) {
        // Safe type conversion with validation
        const loadedData = data.datos_formulario as unknown;
        if (loadedData && typeof loadedData === 'object') {
          const cartaPorteData = loadedData as CartaPorteData;
          setFormData({ ...initialData, ...cartaPorteData });
          setCurrentCartaPorteId(id);
        }
      }
    } catch (error) {
      console.error('Error loading carta porte:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveCartaPorte = useCallback(async () => {
    if (!currentCartaPorteId) return;
    setIsLoading(true);
    try {
      // Convert to JSON-safe format for Supabase
      const jsonData = JSON.parse(JSON.stringify(formData));
      await supabase
        .from('cartas_porte')
        .update({ datos_formulario: jsonData })
        .eq('id', currentCartaPorteId);
    } catch (error) {
      console.error('Error saving carta porte:', error);
    } finally {
      setIsLoading(false);
    }
  }, [formData, currentCartaPorteId]);

  const createNewCartaPorte = useCallback((initial?: Partial<CartaPorteData>) => {
    setFormData({ ...initialData, ...initial });
    setCurrentCartaPorteId(undefined);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialData);
    setCurrentCartaPorteId(undefined);
  }, []);

  // Funciones estables que no cambian
  const formDataToCartaPorteData = useCallback(() => formData, [formData]);
  const formAutotransporteToData = useCallback((data: any) => data || formData.autotransporte, [formData.autotransporte]);
  const formFigurasToData = useCallback((data: any) => data || formData.figuras, [formData.figuras]);

  return {
    formData,
    currentCartaPorteId,
    isLoading,
    updateFormData,
    loadCartaPorte,
    saveCartaPorte,
    createNewCartaPorte,
    resetForm,
    stepValidations,
    totalProgress,
    clearSavedData: () => {},
    isCreating: false,
    isUpdating: false,
    aiValidation: null,
    hasAIEnhancements: false,
    validationMode: 'off' as const,
    overallScore: totalProgress,
    formDataToCartaPorteData,
    formAutotransporteToData,
    formFigurasToData,
    formDataExtendidoToCartaPorteData: formDataToCartaPorteData,
    cartaPorteDataToFormDataExtendido: formDataToCartaPorteData,
  };
}
