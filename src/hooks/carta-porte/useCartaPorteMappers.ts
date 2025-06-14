
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';
import { AutotransporteData } from '@/hooks/useAutotransporte';
import { FiguraTransporte } from '@/hooks/useFigurasTransporte';

// Interfaces para el formulario
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
  ubicaciones: Array<{
    id: string;
    tipo: 'origen' | 'destino';
    direccion: string;
    codigoPostal: string;
    estado: string;
    municipio: string;
    coordenadas?: {
      latitud: number;
      longitud: number;
    };
  }>;
  mercancias: Array<{
    id: string;
    descripcion: string;
    cantidad: number;
    unidadMedida: string;
    peso: number;
    valor: number;
    claveProdServ?: string;
  }>;
  autotransporte: {
    placaVm: string;
    configuracionVehicular: string;
    seguro: {
      aseguradora: string;
      poliza: string;
      vigencia: string;
    };
    remolques?: Array<{
      placa: string;
      subtipo: string;
    }>;
  };
  figuras: Array<{
    id: string;
    tipoFigura: string;
    rfc: string;
    nombre: string;
    licencia?: string;
    vigenciaLicencia?: string;
  }>;
  
  // Campos adicionales para compatibilidad
  tipoCreacion?: 'plantilla' | 'carga' | 'manual';
  tipoCfdi?: 'Ingreso' | 'Traslado';
  rfcEmisor?: string;
  nombreEmisor?: string;
  rfcReceptor?: string;
  nombreReceptor?: string;
  transporteInternacional?: boolean;
  registroIstmo?: boolean;
  cartaPorteVersion?: '3.0' | '3.1';
  cartaPorteId?: string;
}

export const useCartaPorteMappers = () => {
  // Mapper de CartaPorteFormData a CartaPorteData
  const formDataToCartaPorteData = (formData: CartaPorteFormData): CartaPorteData => {
    return {
      tipoCreacion: formData.tipoCreacion || 'manual',
      tipoCfdi: formData.tipoCfdi || formData.configuracion.tipoComprobante === 'T' ? 'Traslado' : 'Ingreso',
      rfcEmisor: formData.rfcEmisor || formData.configuracion.emisor.rfc,
      nombreEmisor: formData.nombreEmisor || formData.configuracion.emisor.nombre,
      rfcReceptor: formData.rfcReceptor || formData.configuracion.receptor.rfc,
      nombreReceptor: formData.nombreReceptor || formData.configuracion.receptor.nombre,
      transporteInternacional: formData.transporteInternacional || false,
      registroIstmo: formData.registroIstmo || false,
      cartaPorteVersion: formData.cartaPorteVersion || formData.configuracion.version,
      ubicaciones: formData.ubicaciones,
      mercancias: formData.mercancias,
      autotransporte: formData.autotransporte,
      figuras: formData.figuras,
      cartaPorteId: formData.cartaPorteId,
    };
  };

  // Mapper de CartaPorteData a CartaPorteFormData
  const cartaPorteDataToFormData = (data: CartaPorteData): CartaPorteFormData => {
    return {
      configuracion: {
        version: data.cartaPorteVersion || '3.1',
        tipoComprobante: data.tipoCfdi === 'Traslado' ? 'T' : 'I',
        emisor: {
          rfc: data.rfcEmisor || '',
          nombre: data.nombreEmisor || '',
          regimenFiscal: '',
        },
        receptor: {
          rfc: data.rfcReceptor || '',
          nombre: data.nombreReceptor || '',
        },
      },
      ubicaciones: data.ubicaciones || [],
      mercancias: data.mercancias || [],
      autotransporte: data.autotransporte || {
        placaVm: '',
        configuracionVehicular: '',
        seguro: {
          aseguradora: '',
          poliza: '',
          vigencia: '',
        },
      },
      figuras: data.figuras || [],
      tipoCreacion: data.tipoCreacion,
      tipoCfdi: data.tipoCfdi,
      rfcEmisor: data.rfcEmisor,
      nombreEmisor: data.nombreEmisor,
      rfcReceptor: data.rfcReceptor,
      nombreReceptor: data.nombreReceptor,
      transporteInternacional: data.transporteInternacional,
      registroIstmo: data.registroIstmo,
      cartaPorteVersion: data.cartaPorteVersion,
      cartaPorteId: data.cartaPorteId,
    };
  };

  // Mapper de formData.autotransporte a AutotransporteData
  const formAutotransporteToData = (formAutotransporte: CartaPorteFormData['autotransporte']): AutotransporteData => {
    return {
      placa_vm: formAutotransporte.placaVm,
      anio_modelo_vm: new Date().getFullYear(), // Default
      config_vehicular: formAutotransporte.configuracionVehicular,
      perm_sct: 'TPAF02', // Default
      num_permiso_sct: '',
      asegura_resp_civil: formAutotransporte.seguro.aseguradora,
      poliza_resp_civil: formAutotransporte.seguro.poliza,
      asegura_med_ambiente: '',
      poliza_med_ambiente: '',
    };
  };

  // Mapper de AutotransporteData a formData.autotransporte
  const dataAutotransporteToForm = (data: AutotransporteData): CartaPorteFormData['autotransporte'] => {
    return {
      placaVm: data.placa_vm || '',
      configuracionVehicular: data.config_vehicular || '',
      seguro: {
        aseguradora: data.asegura_resp_civil || '',
        poliza: data.poliza_resp_civil || '',
        vigencia: '',
      },
    };
  };

  // Mapper de formData.figuras a FiguraTransporte[]
  const formFigurasToData = (formFiguras: CartaPorteFormData['figuras']): FiguraTransporte[] => {
    return formFiguras.map(figura => ({
      id: figura.id,
      tipo_figura: figura.tipoFigura,
      rfc_figura: figura.rfc,
      nombre_figura: figura.nombre,
      num_licencia: figura.licencia,
      vigencia_licencia: figura.vigenciaLicencia,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  };

  // Mapper de FiguraTransporte[] a formData.figuras
  const dataFigurasToForm = (data: FiguraTransporte[]): CartaPorteFormData['figuras'] => {
    return data.map(figura => ({
      id: figura.id,
      tipoFigura: figura.tipo_figura || '',
      rfc: figura.rfc_figura || '',
      nombre: figura.nombre_figura || '',
      licencia: figura.num_licencia,
      vigenciaLicencia: figura.vigencia_licencia,
    }));
  };

  return {
    formDataToCartaPorteData,
    cartaPorteDataToFormData,
    formAutotransporteToData,
    dataAutotransporteToForm,
    formFigurasToData,
    dataFigurasToForm,
  };
};
