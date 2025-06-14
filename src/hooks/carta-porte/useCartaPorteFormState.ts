
import { useState, useCallback, useEffect, Dispatch, SetStateAction } from 'react';
import { useCartaPorteValidation } from './useCartaPorteValidation';
import { CartaPorteFormData, useCartaPorteMappers } from './useCartaPorteMappers';

const initialFormData: CartaPorteFormData = {
  configuracion: {
    version: '3.1',
    tipoComprobante: 'T',
    emisor: {
      rfc: '',
      nombre: '',
      regimenFiscal: ''
    },
    receptor: {
      rfc: '',
      nombre: ''
    }
  },
  ubicaciones: [],
  mercancias: [],
  autotransporte: {
    placaVm: '',
    configuracionVehicular: '',
    seguro: {
      aseguradora: '',
      poliza: '',
      vigencia: ''
    }
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
};

interface UseCartaPorteFormStateOptions {
  cartaPorteId?: string;
}

export const useCartaPorteFormState = ({ cartaPorteId }: UseCartaPorteFormStateOptions = {}) => {
  const [formData, setFormData] = useState<CartaPorteFormData>(initialFormData);
  const [currentCartaPorteId, setCurrentCartaPorteId] = useState<string | undefined>(cartaPorteId);
  const [currentStep, setCurrentStep] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { validateComplete } = useCartaPorteValidation();

  const updateFormData = useCallback((updates: Partial<CartaPorteFormData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
    setIsDirty(true);
    setError(null);
  }, []);

  const updateSection = useCallback((section: keyof CartaPorteFormData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
    setIsDirty(true);
    setError(null);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setCurrentStep(0);
    setIsDirty(false);
    setError(null);
  }, []);

  const validateCurrentState = useCallback(() => {
    return validateComplete(formData);
  }, [formData, validateComplete]);

  // Auto-validación cuando cambian los datos
  useEffect(() => {
    if (isDirty) {
      const timeoutId = setTimeout(() => {
        validateCurrentState();
      }, 500); // Debounce de 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [formData, isDirty, validateCurrentState]);

  return {
    formData,
    setFormData,
    currentCartaPorteId,
    setCurrentCartaPorteId,
    currentStep,
    isDirty,
    isLoading,
    setIsLoading,
    error,
    updateFormData,
    updateSection,
    setCurrentStep,
    resetForm,
    validateCurrentState
  };
};
