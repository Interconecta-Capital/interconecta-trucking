
import { useState, useEffect, useCallback } from 'react';
import { CartaPorteFormData } from './carta-porte/useCartaPorteMappers';
import { CartaPorteData } from '@/types/cartaPorte';

const getInitialFormData = (): CartaPorteFormData => ({
  // Basic configuration
  tipoCreacion: 'manual',
  tipoCfdi: 'Traslado',
  rfcEmisor: '',
  nombreEmisor: '',
  rfcReceptor: '',
  nombreReceptor: '',
  transporteInternacional: false,
  registroIstmo: false,
  cartaPorteVersion: '3.1',
  cartaPorteId: '',
  idCCP: '',

  // Data arrays
  ubicaciones: [],
  mercancias: [],
  autotransporte: {
    placa_vm: '',
    anio_modelo_vm: new Date().getFullYear(),
    config_vehicular: '',
    perm_sct: '',
    num_permiso_sct: '',
    asegura_resp_civil: '',
    poliza_resp_civil: '',
    peso_bruto_vehicular: 0,
    capacidad_carga: 0,
    remolques: []
  },
  figuras: []
});

export const useCartaPorteForm = (cartaPorteId?: string) => {
  const [formData, setFormData] = useState<CartaPorteFormData>(getInitialFormData());
  const [currentStep, setCurrentStep] = useState(0);
  const [isDirty, setIsDirty] = useState(false);

  const updateFormData = useCallback((updates: Partial<CartaPorteFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(getInitialFormData());
    setCurrentStep(0);
    setIsDirty(false);
  }, []);

  // Load existing data if cartaPorteId is provided
  useEffect(() => {
    if (cartaPorteId) {
      // Load carta porte data here when needed
      console.log('Loading carta porte:', cartaPorteId);
    }
  }, [cartaPorteId]);

  return {
    formData,
    setFormData,
    currentStep,
    setCurrentStep,
    isDirty,
    updateFormData,
    resetForm
  };
};
