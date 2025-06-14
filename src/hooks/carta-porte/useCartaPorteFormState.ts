
import { useState, useCallback, useEffect } from 'react';
import { useCartaPorteValidation } from './useCartaPorteValidation';

interface CartaPorteFormData {
  configuracion: {
    version: '3.0' | '3.1';
    tipoComprobante: string;
    emisor: {
      rfc: string;
      nombre: string;
      regimenFiscal: string;
    };
    receptor: {
      rfc: string;
      nombre: string;
    };
  };
  ubicaciones: Array<{
    id: string;
    tipo: 'origen' | 'destino';
    direccion: string;
    codigoPostal: string;
    estado: string;
    municipio: string;
    coordenadas?: {
      latitud: number;
      longitud: number;
    };
  }>;
  mercancias: Array<{
    id: string;
    descripcion: string;
    cantidad: number;
    unidadMedida: string;
    peso: number;
    valor: number;
    claveProdServ?: string;
  }>;
  autotransporte: {
    placaVm: string;
    configuracionVehicular: string;
    seguro: {
      aseguradora: string;
      poliza: string;
      vigencia: string;
    };
    remolques?: Array<{
      placa: string;
      subtipo: string;
    }>;
  };
  figuras: Array<{
    id: string;
    tipoFigura: string;
    rfc: string;
    nombre: string;
    licencia?: string;
    vigenciaLicencia?: string;
  }>;
}

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
  figuras: []
};

export const useCartaPorteFormState = () => {
  const [formData, setFormData] = useState<CartaPorteFormData>(initialFormData);
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
    currentStep,
    isDirty,
    isLoading,
    error,
    updateFormData,
    updateSection,
    setCurrentStep,
    resetForm,
    validateCurrentState
  };
};
