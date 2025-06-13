
import { useState, useCallback } from 'react';
import { useStatePersistence } from '@/hooks/useStatePeristence';
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';

interface UseCartaPorteFormStateOptions {
  cartaPorteId?: string;
}

export function useCartaPorteFormState({ cartaPorteId }: UseCartaPorteFormStateOptions = {}) {
  const [currentCartaPorteId, setCurrentCartaPorteId] = useState<string | undefined>(cartaPorteId);
  const [isLoading, setIsLoading] = useState(false);
  
  // Usar persistencia mejorada para mantener estado del formulario
  const [formData, setFormData] = useStatePersistence({
    tipoCreacion: 'manual',
    tipoCfdi: 'Traslado',
    rfcEmisor: '',
    nombreEmisor: '',
    rfcReceptor: '',
    nombreReceptor: '',
    transporteInternacional: false,
    registroIstmo: false,
    ubicaciones: [],
    mercancias: [],
    autotransporte: {},
    figuras: [],
  } as CartaPorteData, {
    key: `cartaporte-form-${currentCartaPorteId || 'new'}`,
    storage: 'sessionStorage'
  });

  const updateFormData = useCallback((section: string, data: any) => {
    console.log('[CartaPorteFormState] Updating section:', section);
    
    if (section === 'configuracion') {
      const newData = { ...formData, ...data };
      setFormData(newData);
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: data,
      }));
    }
  }, [formData, setFormData]);

  return {
    formData,
    currentCartaPorteId,
    setCurrentCartaPorteId,
    isLoading,
    setIsLoading,
    updateFormData,
    setFormData,
  };
}
