
import {
  CartaPorteData,
  UbicacionCompleta,
  MercanciaCompleta,
  AutotransporteCompleto,
  FiguraCompleta,
} from '@/types/cartaPorte';

// Se unifica el tipo de datos del formulario bajo un solo nombre.
export interface CartaPorteFormData {
  configuracion: {
    version: '3.0' | '3.1';
    tipoComprobante: string;
    emisor: {
      rfc: string;
      nombre: string;
      regimenFiscal: string;
    };
    receptor: {
      rfc: string;
      nombre: string;
    };
  };
  ubicaciones: UbicacionCompleta[];
  mercancias: MercanciaCompleta[];
  autotransporte: AutotransporteCompleto;
  figuras: FiguraCompleta[];
  tipoCreacion: 'plantilla' | 'carga' | 'manual';
  tipoCfdi: 'Ingreso' | 'Traslado';
  rfcEmisor: string;
  nombreEmisor: string;
  rfcReceptor: string;
  nombreReceptor: string;
  transporteInternacional: boolean;
  registroIstmo: boolean;
  cartaPorteVersion: '3.0' | '3.1';
  cartaPorteId?: string;
}

// Hook principal de mapeo
export const useCartaPorteMappers = () => {
  const formDataToCartaPorteData = (formData: CartaPorteFormData): CartaPorteData => {
    return {
      tipoCreacion: formData.tipoCreacion,
      tipoCfdi: formData.tipoCfdi,
      rfcEmisor: formData.rfcEmisor,
      nombreEmisor: formData.nombreEmisor,
      rfcReceptor: formData.rfcReceptor,
      nombreReceptor: formData.nombreReceptor,
      transporteInternacional: formData.transporteInternacional,
      registroIstmo: formData.registroIstmo,
      cartaPorteVersion: formData.cartaPorteVersion,
      ubicaciones: formData.ubicaciones,
      mercancias: formData.mercancias,
      autotransporte: formData.autotransporte,
      figuras: formData.figuras,
      cartaPorteId: formData.cartaPorteId,
    };
  };

  const cartaPorteDataToFormData = (cartaPorteData: CartaPorteData): CartaPorteFormData => {
    return {
      configuracion: {
        version: (cartaPorteData.cartaPorteVersion as '3.0' | '3.1') || '3.1',
        tipoComprobante: cartaPorteData.tipoCfdi === 'Traslado' ? 'T' : 'I',
        emisor: {
          rfc: cartaPorteData.rfcEmisor || '',
          nombre: cartaPorteData.nombreEmisor || '',
          regimenFiscal: '',
        },
        receptor: {
          rfc: cartaPorteData.rfcReceptor || '',
          nombre: cartaPorteData.nombreReceptor || '',
        },
      },
      ubicaciones: cartaPorteData.ubicaciones || [],
      mercancias: cartaPorteData.mercancias || [],
      autotransporte: cartaPorteData.autotransporte || {
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
        remolques: []
      },
      figuras: cartaPorteData.figuras || [],
      tipoCreacion: (cartaPorteData.tipoCreacion as 'plantilla' | 'carga' | 'manual') || 'manual',
      tipoCfdi: (cartaPorteData.tipoCfdi as 'Ingreso' | 'Traslado') || 'Traslado',
      rfcEmisor: cartaPorteData.rfcEmisor || '',
      nombreEmisor: cartaPorteData.nombreEmisor || '',
      rfcReceptor: cartaPorteData.rfcReceptor || '',
      nombreReceptor: cartaPorteData.nombreReceptor || '',
      transporteInternacional: cartaPorteData.transporteInternacional === true || cartaPorteData.transporteInternacional === 'Sí',
      registroIstmo: !!cartaPorteData.registroIstmo,
      cartaPorteVersion: (cartaPorteData.cartaPorteVersion as '3.0' | '3.1') || '3.1',
      cartaPorteId: cartaPorteData.cartaPorteId,
    };
  };

  return {
    formDataToCartaPorteData,
    cartaPorteDataToFormData,
  };
};
