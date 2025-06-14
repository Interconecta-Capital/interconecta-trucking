
import { useMemo, useRef, useCallback } from 'react';
import { useCartaPorteDataConverters } from './useCartaPorteDataConverters';
import { useCartaPorteMappers, CartaPorteFormData } from './useCartaPorteMappers';
import { CartaPorteFormDataExtendido } from './useCartaPorteMappersExtendidos';
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';
import { CartaPorteFormCache } from './types/useCartaPorteFormTypes';

interface UseCartaPorteStableDataOptions {
  formData: CartaPorteFormDataExtendido;
}

export const useCartaPorteStableData = ({ formData }: UseCartaPorteStableDataOptions) => {
  // Referencias para evitar re-renders
  const lastValidationDataRef = useRef<string>('');
  const lastCartaPorteDataRef = useRef<CartaPorteData | null>(null);
  const convertersRef = useRef<any>(null);

  const { cartaPorteDataToFormData } = useCartaPorteMappers();

  // Converters estables con ref
  if (!convertersRef.current) {
    convertersRef.current = useCartaPorteDataConverters();
  }
  const { convertExtendedToCartaPorteData } = convertersRef.current;

  // Crear datos estables para validación usando solo valores primitivos como dependencias
  const stableFormDataForValidation = useMemo((): CartaPorteData => {
    // Crear un hash simple de los datos para detectar cambios reales
    const dataSignature = [
      formData.tipoCreacion || 'manual',
      formData.tipoCfdi || 'Traslado',
      formData.rfcEmisor || '',
      formData.nombreEmisor || '',
      formData.rfcReceptor || '',
      formData.nombreReceptor || '',
      String(formData.transporteInternacional || false),
      String(formData.registroIstmo || false),
      formData.cartaPorteVersion || '3.1',
      String(formData.ubicaciones?.length || 0),
      String(formData.mercancias?.length || 0),
      String(!!formData.autotransporte),
      String(formData.figuras?.length || 0),
      formData.cartaPorteId || ''
    ].join('|');

    // Solo recalcular si los datos han cambiado realmente
    if (dataSignature === lastValidationDataRef.current && lastCartaPorteDataRef.current) {
      return lastCartaPorteDataRef.current;
    }

    lastValidationDataRef.current = dataSignature;

    try {
      const cartaPorteData = convertExtendedToCartaPorteData(formData);
      lastCartaPorteDataRef.current = cartaPorteData;
      return cartaPorteData;
    } catch (error) {
      console.error('[CartaPorteForm] Error converting data for validation:', error);
      
      // Retornar datos mínimos válidos
      const fallbackData: CartaPorteData = {
        tipoCreacion: formData.tipoCreacion || 'manual',
        tipoCfdi: formData.tipoCfdi || 'Traslado',
        rfcEmisor: formData.rfcEmisor || '',
        nombreEmisor: formData.nombreEmisor || '',
        rfcReceptor: formData.rfcReceptor || '',
        nombreReceptor: formData.nombreReceptor || '',
        transporteInternacional: formData.transporteInternacional || false,
        registroIstmo: formData.registroIstmo || false,
        cartaPorteVersion: formData.cartaPorteVersion || '3.1',
        ubicaciones: formData.ubicaciones || [],
        mercancias: formData.mercancias || [],
        autotransporte: formData.autotransporte || {},
        figuras: formData.figuras || [],
        cartaPorteId: formData.cartaPorteId,
      };
      
      lastCartaPorteDataRef.current = fallbackData;
      return fallbackData;
    }
  }, [
    // Solo dependencias primitivas para evitar bucles
    formData.tipoCreacion,
    formData.tipoCfdi,
    formData.rfcEmisor,
    formData.nombreEmisor,
    formData.rfcReceptor,
    formData.nombreReceptor,
    formData.transporteInternacional,
    formData.registroIstmo,
    formData.cartaPorteVersion,
    formData.ubicaciones?.length,
    formData.mercancias?.length,
    !!formData.autotransporte,
    formData.figuras?.length,
    formData.cartaPorteId,
    convertExtendedToCartaPorteData
  ]);

  // Convertir a formato compatible con validación de forma estable
  const formDataForValidation = useMemo((): CartaPorteFormData => {
    try {
      return cartaPorteDataToFormData(stableFormDataForValidation);
    } catch (error) {
      console.error('[CartaPorteForm] Error converting to form data for validation:', error);
      
      // Retornar datos mínimos válidos
      return {
        configuracion: {
          version: formData.cartaPorteVersion || '3.1',
          tipoComprobante: formData.tipoCfdi === 'Traslado' ? 'T' : 'I',
          emisor: {
            rfc: formData.rfcEmisor || '',
            nombre: formData.nombreEmisor || '',
            regimenFiscal: '',
          },
          receptor: {
            rfc: formData.rfcReceptor || '',
            nombre: formData.nombreReceptor || '',
          },
        },
        ubicaciones: [],
        mercancias: [],
        autotransporte: {
          placaVm: '',
          configuracionVehicular: '',
          seguro: {
            aseguradora: '',
            poliza: '',
            vigencia: '',
          },
        },
        figuras: [],
        tipoCreacion: formData.tipoCreacion || 'manual',
        tipoCfdi: formData.tipoCfdi || 'Traslado',
        rfcEmisor: formData.rfcEmisor || '',
        nombreEmisor: formData.nombreEmisor || '',
        rfcReceptor: formData.rfcReceptor || '',
        nombreReceptor: formData.nombreReceptor || '',
        transporteInternacional: formData.transporteInternacional || false,
        registroIstmo: formData.registroIstmo || false,
        cartaPorteVersion: formData.cartaPorteVersion || '3.1',
        cartaPorteId: formData.cartaPorteId,
      };
    }
  }, [stableFormDataForValidation, cartaPorteDataToFormData, formData.cartaPorteVersion, formData.tipoCfdi, formData.rfcEmisor, formData.nombreEmisor, formData.rfcReceptor, formData.nombreReceptor, formData.transporteInternacional, formData.registroIstmo, formData.tipoCreacion, formData.cartaPorteId]);

  const cache: CartaPorteFormCache = {
    lastValidationDataRef,
    lastCartaPorteDataRef,
    convertersRef
  };

  return {
    stableFormDataForValidation,
    formDataForValidation,
    cache
  };
};
