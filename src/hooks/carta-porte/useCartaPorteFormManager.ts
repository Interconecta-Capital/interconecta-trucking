
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
  remolques: []
});

const initialData: CartaPorteData = {
  cartaPorteVersion: '3.1',
  tipoCfdi: 'Traslado',
  rfcEmisor: '',
  nombreEmisor: '',
  rfcReceptor: '',
  nombreReceptor: '',
  transporteInternacional: false,
  registroIstmo: false,
  ubicaciones: [],
  mercancias: [],
  autotransporte: getDefaultAutotransporte(),
  figuras: [],
  currentStep: 0
};

export const useCartaPorteFormManager = () => {
  const [data, setData] = useState<CartaPorteData>(initialData);
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const updateData = useCallback((updates: Partial<CartaPorteData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  const resetForm = useCallback(() => {
    setData(initialData);
    setCurrentStep(0);
    setErrors({});
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    const stepErrors: string[] = [];
    
    switch (step) {
      case 0: // Configuración
        if (!data.rfcEmisor) stepErrors.push('RFC del emisor es requerido');
        if (!data.rfcReceptor) stepErrors.push('RFC del receptor es requerido');
        break;
      case 1: // Ubicaciones
        if (!data.ubicaciones || data.ubicaciones.length < 2) {
          stepErrors.push('Se requieren al menos 2 ubicaciones');
        }
        break;
      case 2: // Mercancías
        if (!data.mercancias || data.mercancias.length === 0) {
          stepErrors.push('Se requiere al menos una mercancía');
        }
        break;
      case 3: // Autotransporte
        if (!data.autotransporte?.placa_vm) {
          stepErrors.push('Placa del vehículo es requerida');
        }
        break;
      case 4: // Figuras
        if (!data.figuras || data.figuras.length === 0) {
          stepErrors.push('Se requiere al menos una figura de transporte');
        }
        break;
    }

    setErrors(prev => ({ ...prev, [step]: stepErrors }));
    return stepErrors.length === 0;
  }, [data]);

  const nextStep = useCallback(() => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  }, [currentStep, validateStep]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step <= 5) {
      setCurrentStep(step);
    }
  }, []);

  return {
    data,
    currentStep,
    isLoading,
    errors,
    updateData,
    setIsLoading,
    nextStep,
    prevStep,
    goToStep,
    validateStep,
    resetForm
  };
};
