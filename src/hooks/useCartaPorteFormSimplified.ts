
import { useState, useCallback } from 'react';
import { CartaPorteData, AutotransporteCompleto } from '@/types/cartaPorte';

const getDefaultAutotransporte = (): AutotransporteCompleto => ({
  placa_vm: '',
  anio_modelo_vm: new Date().getFullYear(),
  config_vehicular: '',
  perm_sct: '',
  num_permiso_sct: '',
  asegura_resp_civil: '',
  poliza_resp_civil: '',
  peso_bruto_vehicular: 0,
  capacidad_carga: 0,
  remolques: [],
});

const getInitialData = (): CartaPorteData => ({
  version: '3.1',
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
  autotransporte: getDefaultAutotransporte(),
  figuras: [],
});

export const useCartaPorteFormSimplified = () => {
  const [data, setData] = useState<CartaPorteData>(getInitialData());
  const [currentStep, setCurrentStep] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateData = useCallback((section: keyof CartaPorteData, value: any) => {
    setData(prev => ({
      ...prev,
      [section]: value
    }));
    setIsDirty(true);
  }, []);

  const updateField = useCallback((field: keyof CartaPorteData, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
  }, []);

  const resetForm = useCallback(() => {
    setData(getInitialData());
    setCurrentStep(0);
    setIsDirty(false);
    setError(null);
  }, []);

  const saveForm = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsDirty(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateData = useCallback(() => {
    const compatibleData: CartaPorteData = {
      version: data.cartaPorteVersion || '3.1',
      tipoCreacion: data.tipoCreacion,
      tipoCfdi: data.tipoCfdi,
      rfcEmisor: data.rfcEmisor,
      nombreEmisor: data.nombreEmisor,
      rfcReceptor: data.rfcReceptor,
      nombreReceptor: data.nombreReceptor,
      transporteInternacional: data.transporteInternacional,
      registroIstmo: data.registroIstmo,
      cartaPorteVersion: data.cartaPorteVersion,
      ubicaciones: data.ubicaciones,
      mercancias: data.mercancias,
      autotransporte: data.autotransporte,
      figuras: data.figuras,
      cartaPorteId: data.cartaPorteId,
    };
    
    // Basic validation
    const errors: string[] = [];
    if (!compatibleData.rfcEmisor) errors.push('RFC Emisor requerido');
    if (!compatibleData.rfcReceptor) errors.push('RFC Receptor requerido');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, [data]);

  return {
    data,
    currentStep,
    isDirty,
    isLoading,
    error,
    updateData,
    updateField,
    setCurrentStep,
    resetForm,
    saveForm,
    validateData
  };
};
