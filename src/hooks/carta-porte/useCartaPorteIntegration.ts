
import { useCallback } from 'react';
import { useCartaPorteMappers, CartaPorteFormData } from './useCartaPorteMappers';
import { useCartaPorteSync } from './useCartaPorteSync';
import { useCartaPorteAutoSave } from './useCartaPorteAutoSave';
import { supabase } from '@/integrations/supabase/client';

interface UseCartaPorteIntegrationOptions {
  formData: CartaPorteFormData;
  currentCartaPorteId?: string;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  setFormData: (data: CartaPorteFormData) => void;
  setCurrentCartaPorteId: (id: string | undefined) => void;
}

export const useCartaPorteIntegration = ({
  formData,
  currentCartaPorteId,
  isLoading,
  isCreating,
  isUpdating,
  setFormData,
  setCurrentCartaPorteId,
}: UseCartaPorteIntegrationOptions) => {
  const { formDataToCartaPorteData, cartaPorteDataToFormData } = useCartaPorteMappers();
  
  const { updateCartaPorte } = useCartaPorteSync({
    formData,
    currentCartaPorteId,
    isLoading,
    setFormData,
    setCurrentCartaPorteId,
  });

  const { clearSavedData } = useCartaPorteAutoSave({
    formData,
    currentCartaPorteId,
    isLoading,
    isCreating,
    isUpdating,
  });

  // Cargar carta porte desde base de datos
  const loadCartaPorte = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('cartas_porte')
        .select('datos_formulario')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data?.datos_formulario) {
        // Safe type casting con validación
        const rawData = data.datos_formulario;
        if (typeof rawData === 'object' && rawData !== null && !Array.isArray(rawData)) {
          setFormData(rawData as CartaPorteFormData);
          setCurrentCartaPorteId(id);
        } else {
          throw new Error('Invalid form data format');
        }
      }
    } catch (error) {
      console.error('Error loading carta porte:', error);
      throw error;
    }
  }, [setFormData, setCurrentCartaPorteId]);

  // Guardar carta porte en base de datos
  const saveCartaPorte = useCallback(async (data?: CartaPorteFormData) => {
    const dataToSave = data || formData;
    await updateCartaPorte(dataToSave);
  }, [formData, updateCartaPorte]);

  // Crear nueva carta porte
  const createNewCartaPorte = useCallback(async (initialData?: Partial<CartaPorteFormData>) => {
    const newFormData: CartaPorteFormData = {
      configuracion: {
        version: '3.1',
        tipoComprobante: 'T',
        emisor: { rfc: '', nombre: '', regimenFiscal: '' },
        receptor: { rfc: '', nombre: '' }
      },
      ubicaciones: [],
      mercancias: [],
      autotransporte: {
        placaVm: '',
        configuracionVehicular: '',
        seguro: { aseguradora: '', poliza: '', vigencia: '' }
      },
      figuras: [],
      tipoCreacion: 'manual',
      tipoCfdi: 'Traslado',
      rfcEmisor: '',
      nombreEmisor: '',
      rfcReceptor: '',
      nombreReceptor: '',
      transporteInternacional: false,
      registroIstmo: false,
      cartaPorteVersion: '3.1',
      ...initialData
    };

    setFormData(newFormData);
    clearSavedData();
  }, [setFormData, clearSavedData]);

  // Resetear formulario
  const resetForm = useCallback(() => {
    createNewCartaPorte();
    setCurrentCartaPorteId(undefined);
  }, [createNewCartaPorte, setCurrentCartaPorteId]);

  return {
    // Mappers
    formDataToCartaPorteData,
    cartaPorteDataToFormData,
    
    // Acciones principales
    loadCartaPorte,
    saveCartaPorte,
    createNewCartaPorte,
    resetForm,
    
    // Auto-save
    clearSavedData,
  };
};
