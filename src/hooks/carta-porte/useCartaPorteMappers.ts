
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

// Funciones de conversión (antes en cartaPorteDataConverters.ts)
const convertUbicacionesToSimple = (ubicaciones: UbicacionCompleta[]) => {
  return ubicaciones.map(ubicacion => ({
    id: ubicacion.id || '',
    tipo:
      ubicacion.tipo_ubicacion === 'Origen'
        ? 'origen'
        : ubicacion.tipo_ubicacion === 'Destino'
        ? 'destino'
        : 'origen',
    direccion: `${ubicacion.domicilio?.calle || ''} ${
      ubicacion.domicilio?.numero_exterior || ''
    }`,
    codigoPostal: ubicacion.domicilio?.codigo_postal || '',
    estado: ubicacion.domicilio?.estado || '',
    municipio: ubicacion.domicilio?.municipio || '',
    coordenadas: ubicacion.coordenadas,
  }));
};

const convertMercanciasToSimple = (mercancias: MercanciaCompleta[]) => {
  return mercancias.map(mercancia => ({
    id: mercancia.id || '',
    descripcion: mercancia.descripcion || '',
    cantidad: mercancia.cantidad || 0,
    unidadMedida: mercancia.clave_unidad || '',
    peso: mercancia.peso_kg || 0,
    valor: mercancia.valor_mercancia || 0,
    claveProdServ: mercancia.bienes_transp,
    materialPeligroso: mercancia.material_peligroso,
    claveMaterialPeligroso: mercancia.cve_material_peligroso,
    fraccionArancelaria: mercancia.fraccion_arancelaria,
    tipoEmbalaje: mercancia.tipo_embalaje,
    dimensiones: mercancia.dimensiones,
  }));
};

const convertAutotransporteToSimple = (autotransporte?: AutotransporteCompleto) => {
  if (!autotransporte) {
    return {
      placaVm: '',
      configuracionVehicular: '',
      seguro: { aseguradora: '', poliza: '', vigencia: '' },
    };
  }
  return {
    placaVm: autotransporte.placa_vm || '',
    configuracionVehicular: autotransporte.config_vehicular || '',
    anioModelo: autotransporte.anio_modelo_vm || new Date().getFullYear(),
    seguro: {
      aseguradora: autotransporte.asegura_resp_civil || '',
      poliza: autotransporte.poliza_resp_civil || '',
      vigencia: '', // Este campo no existe en el origen
    },
    remolques: autotransporte.remolques?.map(r => ({
      placa: r.placa,
      subtipo: r.subtipo_rem,
    })) || [],
  };
};

const convertFigurasToSimple = (figuras: FiguraCompleta[]) => {
  return figuras.map(figura => ({
    id: figura.id || '',
    tipoFigura: figura.tipo_figura || '',
    rfc: figura.rfc_figura || '',
    nombre: figura.nombre_figura || '',
    licencia: figura.num_licencia,
  }));
};

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
        version: cartaPorteData.cartaPorteVersion || '3.1',
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
      autotransporte: cartaPorteData.autotransporte,
      figuras: cartaPorteData.figuras || [],
      tipoCreacion: cartaPorteData.tipoCreacion || 'manual',
      tipoCfdi: cartaPorteData.tipoCfdi || 'Traslado',
      rfcEmisor: cartaPorteData.rfcEmisor || '',
      nombreEmisor: cartaPorteData.nombreEmisor || '',
      rfcReceptor: cartaPorteData.rfcReceptor || '',
      nombreReceptor: cartaPorteData.nombreReceptor || '',
      transporteInternacional: cartaPorteData.transporteInternacional || false,
      registroIstmo: cartaPorteData.registroIstmo || false,
      cartaPorteVersion: cartaPorteData.cartaPorteVersion || '3.1',
      cartaPorteId: cartaPorteData.cartaPorteId,
    };
  };

  return {
    formDataToCartaPorteData,
    cartaPorteDataToFormData,
  };
};

