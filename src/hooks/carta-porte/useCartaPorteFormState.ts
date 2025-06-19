import { useState, useCallback, useEffect } from 'react';
import { CartaPorteFormData } from './useCartaPorteMappers';
import { AutotransporteCompleto } from '@/types/cartaPorte';

const defaultAutotransporte: AutotransporteCompleto = {
  placa_vm: '',
  anio_modelo_vm: new Date().getFullYear(),
  config_vehicular: '',
  perm_sct: '',
  num_permiso_sct: '',
  asegura_resp_civil: '',
  poliza_resp_civil: '',
  asegura_med_ambiente: '',
  poliza_med_ambiente: '',
  peso_bruto_vehicular: 0,
  tipo_carroceria: '',
  remolques: [],
  marca_vehiculo: '',
  modelo_vehiculo: '',
  numero_serie_vin: '',
  vigencia_permiso: '',
  numero_permisos_adicionales: [],
  capacidad_carga: 0,
  dimensiones: {
    largo: 0,
    ancho: 0,
    alto: 0
  }
};

const initialFormData: CartaPorteFormData = {
  configuracion: {
    version: '3.1',
    tipoComprobante: 'T',
    emisor: {
      rfc: '',
      nombre: '',
      regimenFiscal: '',
    },
    receptor: {
      rfc: '',
      nombre: '',
    },
  },
  ubicaciones: [],
  mercancias: [],
  autotransporte: defaultAutotransporte,
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

export function useCartaPorteFormState({ cartaPorteId }: UseCartaPorteFormStateOptions = {}) {
  const [formData, setFormData] = useState<CartaPorteFormData>(initialFormData);
  const [currentCartaPorteId, setCurrentCartaPorteId] = useState<string | null>(cartaPorteId || null);
  const [isLoading, setIsLoading] = useState(false);

  const updateFormData = useCallback((updates: Partial<CartaPorteFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    formData,
    setFormData,
    currentCartaPorteId,
    setCurrentCartaPorteId,
    isLoading,
    setIsLoading,
    updateFormData,
  };
}
