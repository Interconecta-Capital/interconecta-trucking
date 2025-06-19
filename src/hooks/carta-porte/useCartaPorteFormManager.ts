
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

const getInitialCartaPorteData = (): CartaPorteData => ({
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
  tipoCreacion: 'manual',
  xmlGenerado: null,
});

export const useCartaPorteFormManager = () => {
  const [cartaPorteData, setCartaPorteData] = useState<CartaPorteData>(getInitialCartaPorteData());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateSection = useCallback((section: keyof CartaPorteData, data: any) => {
    setCartaPorteData(prev => ({
      ...prev,
      [section]: data
    }));
  }, []);

  const saveCartaPorte = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Here you would implement the actual save logic
      console.log('Saving carta porte:', cartaPorteData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsLoading(false);
    }
  }, [cartaPorteData]);

  const resetForm = useCallback(() => {
    setCartaPorteData(getInitialCartaPorteData());
    setError(null);
  }, []);

  return {
    cartaPorteData,
    updateSection,
    saveCartaPorte,
    resetForm,
    isLoading,
    error
  };
};
