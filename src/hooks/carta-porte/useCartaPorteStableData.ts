
import { useMemo } from 'react';
import { CartaPorteFormData } from './useCartaPorteMappers';
import { CartaPorteData, AutotransporteCompleto } from '@/types/cartaPorte';

interface UseCartaPorteStableDataOptions {
  formData: CartaPorteFormData;
}

export const useCartaPorteStableData = ({ formData }: UseCartaPorteStableDataOptions) => {
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

  const stableFormDataForValidation = useMemo((): CartaPorteData => {
    return {
      version: formData.cartaPorteVersion || '3.1',
      tipoCreacion: formData.tipoCreacion,
      tipoCfdi: formData.tipoCfdi,
      rfcEmisor: formData.rfcEmisor,
      nombreEmisor: formData.nombreEmisor,
      rfcReceptor: formData.rfcReceptor,
      nombreReceptor: formData.nombreReceptor,
      transporteInternacional: formData.transporteInternacional,
      registroIstmo: formData.registroIstmo,
      cartaPorteVersion: formData.cartaPorteVersion,
      cartaPorteId: formData.cartaPorteId,
      idCCP: formData.idCCP,
      ubicaciones: formData.ubicaciones || [],
      mercancias: formData.mercancias || [],
      autotransporte: formData.autotransporte || getDefaultAutotransporte(),
      figuras: formData.figuras || [],
      regimenAduanero: formData.regimenAduanero,
      regimenesAduaneros: formData.regimenesAduaneros
    };
  }, [formData]);

  const formDataForValidation = useMemo((): CartaPorteData => {
    return {
      version: formData.cartaPorteVersion || '3.1',
      tipoCreacion: formData.tipoCreacion,
      tipoCfdi: formData.tipoCfdi,
      rfcEmisor: formData.rfcEmisor,
      nombreEmisor: formData.nombreEmisor,
      rfcReceptor: formData.rfcReceptor,
      nombreReceptor: formData.nombreReceptor,
      transporteInternacional: formData.transporteInternacional,
      registroIstmo: formData.registroIstmo,
      cartaPorteVersion: formData.cartaPorteVersion,
      cartaPorteId: formData.cartaPorteId,
      idCCP: formData.idCCP,
      ubicaciones: formData.ubicaciones || [],
      mercancias: formData.mercancias || [],
      autotransporte: formData.autotransporte || getDefaultAutotransporte(),
      figuras: formData.figuras || [],
      regimenAduanero: formData.regimenAduanero,
      regimenesAduaneros: formData.regimenesAduaneros
    };
  }, [formData]);

  return {
    stableFormDataForValidation,
    formDataForValidation
  };
};
