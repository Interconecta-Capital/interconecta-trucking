import { useMemo } from 'react';
import { CartaPorteFormData } from './useCartaPorteMappers';
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

interface UseCartaPorteStableDataOptions {
  formData: CartaPorteFormData;
}

export function useCartaPorteStableData({ formData }: UseCartaPorteStableDataOptions) {
  const stableFormDataForValidation = useMemo((): CartaPorteData => {
    return {
      rfcEmisor: formData.rfcEmisor || '',
      nombreEmisor: formData.nombreEmisor || '',
      rfcReceptor: formData.rfcReceptor || '',
      nombreReceptor: formData.nombreReceptor || '',
      tipoCfdi: formData.tipoCfdi || 'Traslado',
      cartaPorteVersion: formData.cartaPorteVersion || '3.1',
      transporteInternacional: formData.transporteInternacional || false,
      registroIstmo: formData.registroIstmo || false,
      ubicaciones: formData.ubicaciones || [],
      mercancias: formData.mercancias || [],
      autotransporte: formData.autotransporte || defaultAutotransporte,
      figuras: formData.figuras || [],
    };
  }, [
    formData.rfcEmisor,
    formData.nombreEmisor,
    formData.rfcReceptor,
    formData.nombreReceptor,
    formData.tipoCfdi,
    formData.cartaPorteVersion,
    formData.transporteInternacional,
    formData.registroIstmo,
    formData.ubicaciones,
    formData.mercancias,
    formData.autotransporte,
    formData.figuras,
  ]);

  const formDataForValidation = useMemo((): CartaPorteFormData => {
    return {
      ...formData,
      autotransporte: formData.autotransporte || defaultAutotransporte,
    };
  }, [formData]);

  const memoizedData = useMemo(() => {
    return {
      ubicacionesArray: formData.ubicaciones || [],
      mercanciasArray: formData.mercancias || [],
      autotransporteData: formData.autotransporte || defaultAutotransporte,
      figurasArray: formData.figuras || [],
    };
  }, [
    formData.ubicaciones,
    formData.mercancias,
    formData.autotransporte,
    formData.figuras,
  ]);

  // Signature for change detection
  const dataSignature = useMemo(() => {
    return [
      formData.rfcEmisor,
      formData.nombreEmisor,
      formData.rfcReceptor,
      formData.nombreReceptor,
      String(formData.ubicaciones?.length || 0),
      String(formData.mercancias?.length || 0),
      String(formData.figuras?.length || 0),
      formData.autotransporte?.placa_vm || '',
    ].join('|');
  }, [
    formData.rfcEmisor,
    formData.nombreEmisor,
    formData.rfcReceptor,
    formData.nombreReceptor,
    formData.ubicaciones,
    formData.mercancias,
    formData.figuras,
    formData.autotransporte,
  ]);

  const defaultCompleteAutotransporte = useMemo(() => defaultAutotransporte, []);

  return {
    stableFormDataForValidation,
    formDataForValidation,
    memoizedData,
    dataSignature,
    defaultCompleteAutotransporte,
  };
}
