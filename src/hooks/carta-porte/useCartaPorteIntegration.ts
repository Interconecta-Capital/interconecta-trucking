import { useState } from 'react';
import { AutotransporteCompleto } from '@/types/cartaPorte';

export const useCartaPorteIntegration = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return {
    isLoading,
    setIsLoading,
    error,
    setError,
    getDefaultAutotransporte
  };
};
