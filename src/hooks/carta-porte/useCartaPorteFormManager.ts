
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
  remolques: []
});

const initialFormData: CartaPorteData = {
  version: '3.1',
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
  tipoCreacion: 'manual'
};

export const useCartaPorteFormManager = () => {
  const [formData, setFormData] = useState<CartaPorteData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(0);
  const [isDirty, setIsDirty] = useState(false);

  const updateFormData = useCallback((updates: Partial<CartaPorteData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setCurrentStep(0);
    setIsDirty(false);
  }, []);

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
