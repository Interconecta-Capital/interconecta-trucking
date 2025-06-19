import { useState, useCallback } from 'react';
import { CartaPorteData, AutotransporteCompleto } from '@/types/cartaPorte';

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

const initialData: CartaPorteData = {
  rfcEmisor: '',
  nombreEmisor: '',
  rfcReceptor: '',
  nombreReceptor: '',
  tipoCfdi: 'Traslado',
  cartaPorteVersion: '3.1',
  transporteInternacional: false,
  registroIstmo: false,
  ubicaciones: [],
  mercancias: [],
  autotransporte: defaultAutotransporte,
  figuras: [],
};

export function useCartaPorteFormSimplified() {
  const [formData, setFormData] = useState<CartaPorteData>(initialData);

  const updateField = useCallback((field: keyof CartaPorteData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialData);
  }, []);

  return {
    formData,
    setFormData,
    updateField,
    resetForm,
  };
}
