import { useState, useCallback, useEffect } from 'react';
import { useCartaPorteValidation } from './useCartaPorteValidation';
import { CartaPorteFormData } from './useCartaPorteMappers';
import { UUIDService } from '@/services/uuid/UUIDService';

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
    placa_vm: '',
    anio_modelo_vm: new Date().getFullYear(),
    config_vehicular: '',
    perm_sct: '',
    num_permiso_sct: '',
    asegura_resp_civil: '',
    poliza_resp_civil: ''
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
  autoGenerateIdCCP?: boolean;
}

export const useCartaPorteFormState = ({ 
  cartaPorteId,
  autoGenerateIdCCP = true 
}: UseCartaPorteFormStateOptions = {}) => {
  const [formData, setFormData] = useState<CartaPorteFormData>(initialFormData);
  const [currentCartaPorteId, setCurrentCartaPorteId] = useState<string | undefined>(cartaPorteId);
  const [idCCP, setIdCCP] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { validateComplete } = useCartaPorteValidation();

  // Generar IdCCP automáticamente al inicializar el formulario
  useEffect(() => {
    if (autoGenerateIdCCP && !idCCP && !cartaPorteId) {
      const newIdCCP = UUIDService.generateValidIdCCP();
      setIdCCP(newIdCCP);
      console.log('[CartaPorteForm] IdCCP generado automáticamente:', newIdCCP);
    }
  }, [autoGenerateIdCCP, idCCP, cartaPorteId]);

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
    
    // Generar nuevo IdCCP al resetear
    if (autoGenerateIdCCP) {
      const newIdCCP = UUIDService.generateValidIdCCP();
      setIdCCP(newIdCCP);
      console.log('[CartaPorteForm] Nuevo IdCCP generado al resetear:', newIdCCP);
    }
  }, [autoGenerateIdCCP]);

  const generateNewIdCCP = useCallback(() => {
    const newIdCCP = UUIDService.generateValidIdCCP();
    setIdCCP(newIdCCP);
    setIsDirty(true);
    console.log('[CartaPorteForm] IdCCP regenerado manualmente:', newIdCCP);
    return newIdCCP;
  }, []);

  const validateCurrentState = useCallback(() => {
    const compatibleData = {
      tipoCreacion: formData.tipoCreacion,
      tipoCfdi: formData.tipoCfdi,
      rfcEmisor: formData.rfcEmisor,
      nombreEmisor: formData.nombreEmisor,
      rfcReceptor: formData.rfcReceptor,
      nombreReceptor: formData.nombreReceptor,
      transporteInternacional: formData.transporteInternacional,
      registroIstmo: formData.registroIstmo,
      cartaPorteVersion: formData.cartaPorteVersion,
      ubicaciones: formData.ubicaciones || [],
      mercancias: formData.mercancias || [],
      autotransporte: formData.autotransporte,
      figuras: formData.figuras || [],
    };
    return validateComplete(compatibleData);
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
    idCCP,
    setIdCCP,
    currentStep,
    isDirty,
    isLoading,
    setIsLoading,
    error,
    updateFormData,
    updateSection,
    setCurrentStep,
    resetForm,
    generateNewIdCCP,
    validateCurrentState
  };
};
