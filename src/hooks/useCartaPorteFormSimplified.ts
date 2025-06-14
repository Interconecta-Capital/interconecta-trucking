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

export function useCartaPorteFormSimplified({ cartaPorteId }: UseCartaPorteFormOptions = {}) {
  const [formData, setFormData] = useState<CartaPorteData>({ ...initialData, cartaPorteId });
  const [currentCartaPorteId, setCurrentCartaPorteId] = useState<string | undefined>(cartaPorteId);
  const [isLoading, setIsLoading] = useState(false);

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
        setFormData(data.datos_formulario as CartaPorteData);
        setCurrentCartaPorteId(id);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveCartaPorte = useCallback(async () => {
    if (!currentCartaPorteId) return;
    setIsLoading(true);
    try {
      await supabase
        .from('cartas_porte')
        .update({ datos_formulario: formData })
        .eq('id', currentCartaPorteId);
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

  return {
    formData,
    currentCartaPorteId,
    isLoading,
    updateFormData,
    loadCartaPorte,
    saveCartaPorte,
    createNewCartaPorte,
    resetForm,
    stepValidations: {},
    totalProgress: 0,
    clearSavedData: () => {},
    isCreating: false,
    isUpdating: false,
    aiValidation: null,
    hasAIEnhancements: false,
    validationMode: 'off',
    overallScore: 0,
    formDataToCartaPorteData: () => formData,
    formAutotransporteToData: (data: any) => data || formData.autotransporte,
    formFigurasToData: (data: any) => data || formData.figuras,
    formDataExtendidoToCartaPorteData: (data: CartaPorteData) => data,
    cartaPorteDataToFormDataExtendido: (data: CartaPorteData) => data,
  };
}

