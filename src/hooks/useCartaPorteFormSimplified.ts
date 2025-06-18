
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { CartaPorteData } from '@/types/cartaPorte';
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
  autotransporte: {
    placa_vm: '',
    anio_modelo_vm: 0,
    config_vehicular: '',
    perm_sct: '',
    num_permiso_sct: '',
    asegura_resp_civil: '',
    poliza_resp_civil: '',
    remolques: []
  },
  figuras: [],
  totalDistRec: 0,
  regimenAduanero: '',
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

// Safe data serialization for Supabase
const serializeForSupabase = (data: CartaPorteData) => {
  try {
    // Create a clean object with only serializable properties
    const cleanData = {
      tipoCreacion: data.tipoCreacion,
      tipoCfdi: data.tipoCfdi,
      rfcEmisor: data.rfcEmisor || '',
      nombreEmisor: data.nombreEmisor || '',
      rfcReceptor: data.rfcReceptor || '',
      nombreReceptor: data.nombreReceptor || '',
      transporteInternacional: Boolean(data.transporteInternacional === 'Sí' || data.transporteInternacional === true),
      registroIstmo: Boolean(data.registroIstmo),
      cartaPorteVersion: data.cartaPorteVersion || '3.1',
      ubicaciones: Array.isArray(data.ubicaciones) ? data.ubicaciones : [],
      mercancias: Array.isArray(data.mercancias) ? data.mercancias : [],
      autotransporte: data.autotransporte || {},
      figuras: Array.isArray(data.figuras) ? data.figuras : [],
      cartaPorteId: data.cartaPorteId,
    };
    
    // Convert to JSON and back to ensure all data is serializable
    return JSON.parse(JSON.stringify(cleanData));
  } catch (error) {
    console.error('Error serializing data for Supabase:', error);
    return initialData;
  }
};

// Safe data deserialization from Supabase
const deserializeFromSupabase = (data: unknown): CartaPorteData => {
  try {
    if (!data || typeof data !== 'object') {
      return initialData;
    }
    
    const rawData = data as Record<string, any>;
    
    return {
      tipoCreacion: rawData.tipoCreacion || 'manual',
      tipoCfdi: rawData.tipoCfdi || 'Traslado',
      rfcEmisor: rawData.rfcEmisor || '',
      nombreEmisor: rawData.nombreEmisor || '',
      rfcReceptor: rawData.rfcReceptor || '',
      nombreReceptor: rawData.nombreReceptor || '',
      transporteInternacional: Boolean(rawData.transporteInternacional),
      registroIstmo: Boolean(rawData.registroIstmo),
      cartaPorteVersion: rawData.cartaPorteVersion || '3.1',
      ubicaciones: Array.isArray(rawData.ubicaciones) ? rawData.ubicaciones : [],
      mercancias: Array.isArray(rawData.mercancias) ? rawData.mercancias : [],
      autotransporte: rawData.autotransporte || {},
      figuras: Array.isArray(rawData.figuras) ? rawData.figuras : [],
      cartaPorteId: rawData.cartaPorteId,
    };
  } catch (error) {
    console.error('Error deserializing data from Supabase:', error);
    return initialData;
  }
};

export function useCartaPorteFormSimplified({ cartaPorteId }: UseCartaPorteFormOptions = {}) {
  const { user } = useAuth();
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
      
      if (error) {
        console.error('Error loading carta porte:', error);
        throw error;
      }
      
      if (data?.datos_formulario) {
        const loadedData = deserializeFromSupabase(data.datos_formulario);
        setFormData(loadedData);
        setCurrentCartaPorteId(id);
      }
    } catch (error) {
      console.error('Error loading carta porte:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createNewCartaPorte = useCallback(async (initial?: Partial<CartaPorteData>) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    setIsLoading(true);
    try {
      const newFormData = { ...initialData, ...initial };
      const serializedData = serializeForSupabase(newFormData);
      
      const { data, error } = await supabase
        .from('cartas_porte')
        .insert({
          usuario_id: user.id,
          datos_formulario: serializedData,
          rfc_emisor: newFormData.rfcEmisor || 'TEMP',
          rfc_receptor: newFormData.rfcReceptor || 'TEMP',
          nombre_emisor: newFormData.nombreEmisor,
          nombre_receptor: newFormData.nombreReceptor,
          tipo_cfdi: newFormData.tipoCfdi,
          transporte_internacional: Boolean(newFormData.transporteInternacional === 'Sí' || newFormData.transporteInternacional === true),
          registro_istmo: Boolean(newFormData.registroIstmo),
          status: 'borrador'
        })
        .select('id')
        .single();
        
      if (error) {
        console.error('Error creating carta porte:', error);
        throw new Error(`Error al crear carta porte: ${error.message}`);
      }
      
      if (data?.id) {
        setFormData(newFormData);
        setCurrentCartaPorteId(data.id);
        return data.id;
      }
    } catch (error: any) {
      console.error('Error creating carta porte:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const saveCartaPorte = useCallback(async () => {
    if (!currentCartaPorteId || !user) {
      throw new Error('No se puede guardar: falta ID de carta porte o usuario no autenticado');
    }
    
    setIsLoading(true);
    try {
      const serializedData = serializeForSupabase(formData);
      
      const { error } = await supabase
        .from('cartas_porte')
        .update({ 
          datos_formulario: serializedData,
          rfc_emisor: formData.rfcEmisor || 'TEMP',
          nombre_emisor: formData.nombreEmisor,
          rfc_receptor: formData.rfcReceptor || 'TEMP',
          nombre_receptor: formData.nombreReceptor,
          tipo_cfdi: formData.tipoCfdi,
          transporte_internacional: Boolean(formData.transporteInternacional === 'Sí' || formData.transporteInternacional === true),
          registro_istmo: Boolean(formData.registroIstmo),
          updated_at: new Date().toISOString()
        })
        .eq('id', currentCartaPorteId)
        .eq('usuario_id', user.id);
        
      if (error) {
        console.error('Error saving carta porte:', error);
        throw new Error(`Error al guardar carta porte: ${error.message}`);
      }
    } catch (error: any) {
      console.error('Error saving carta porte:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [formData, currentCartaPorteId, user]);

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
