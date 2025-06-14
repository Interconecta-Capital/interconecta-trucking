
import { CartaPorteData } from '@/types/cartaPorte';
import { AutotransporteCompleto, FiguraCompleta, MercanciaCompleta, UbicacionCompleta } from '@/types/cartaPorte';

// Interfaces para el formulario extendido
export interface CartaPorteFormDataExtendido {
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
  
  // Campos adicionales para compatibilidad
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

export const useCartaPorteMappersExtendidos = () => {
  // Mapper de CartaPorteFormDataExtendido a CartaPorteData
  const formDataExtendidoToCartaPorteData = (formData: CartaPorteFormDataExtendido): CartaPorteData => {
    return {
      tipoCreacion: formData.tipoCreacion,
      tipoCfdi: formData.tipoCfdi,
      rfcEmisor: formData.rfcEmisor,
      nombreEmisor: formData.nombreEmisor,
      rfcReceptor: formData.rfcReceptor,
      nombreReceptor: formData.nombreReceptor,
      transporteInternacional: formData.transporteInternacional ? 'Sí' : 'No',
      registroIstmo: formData.registroIstmo,
      cartaPorteVersion: formData.cartaPorteVersion,
      ubicaciones: formData.ubicaciones.map(mapUbicacionCompleta),
      mercancias: formData.mercancias.map(mapMercanciaCompleta),
      autotransporte: mapAutotransporteCompleto(formData.autotransporte),
      figuras: formData.figuras.map(mapFiguraCompleta),
      cartaPorteId: formData.cartaPorteId,
    };
  };

  // Mappers individuales
  const mapUbicacionCompleta = (ubicacion: UbicacionCompleta): UbicacionCompleta => {
    return {
      id: ubicacion.id || '',
      tipo_ubicacion: ubicacion.tipo_ubicacion,
      id_ubicacion: ubicacion.id_ubicacion,
      rfc_remitente_destinatario: ubicacion.rfc_remitente_destinatario,
      nombre_remitente_destinatario: ubicacion.nombre_remitente_destinatario,
      fecha_hora_salida_llegada: ubicacion.fecha_hora_salida_llegada,
      distancia_recorrida: ubicacion.distancia_recorrida,
      tipo_estacion: ubicacion.tipo_estacion,
      numero_estacion: ubicacion.numero_estacion,
      kilometro: ubicacion.kilometro,
      coordenadas: ubicacion.coordenadas,
      domicilio: ubicacion.domicilio,
    };
  };

  const mapMercanciaCompleta = (mercancia: MercanciaCompleta): MercanciaCompleta => {
    return {
      id: mercancia.id || '',
      bienes_transp: mercancia.bienes_transp,
      descripcion: mercancia.descripcion,
      cantidad: mercancia.cantidad,
      clave_unidad: mercancia.clave_unidad,
      peso_kg: mercancia.peso_kg,
      valor_mercancia: mercancia.valor_mercancia,
      material_peligroso: mercancia.material_peligroso,
      cve_material_peligroso: mercancia.cve_material_peligroso,
      fraccion_arancelaria: mercancia.fraccion_arancelaria,
      tipo_embalaje: mercancia.tipo_embalaje,
      dimensiones: mercancia.dimensiones,
      peso_bruto_total: mercancia.peso_bruto_total,
      unidad_peso_bruto: mercancia.unidad_peso_bruto,
      material_embalaje: mercancia.material_embalaje,
      descripcion_embalaje: mercancia.descripcion_embalaje,
      moneda: mercancia.moneda,
      uuid_comercio_exterior: mercancia.uuid_comercio_exterior,
      embalaje: mercancia.embalaje,
    };
  };

  const mapAutotransporteCompleto = (autotransporte: AutotransporteCompleto): AutotransporteCompleto => {
    return {
      placa_vm: autotransporte.placa_vm,
      anio_modelo_vm: autotransporte.anio_modelo_vm,
      config_vehicular: autotransporte.config_vehicular,
      perm_sct: autotransporte.perm_sct,
      num_permiso_sct: autotransporte.num_permiso_sct,
      asegura_resp_civil: autotransporte.asegura_resp_civil,
      poliza_resp_civil: autotransporte.poliza_resp_civil,
      asegura_med_ambiente: autotransporte.asegura_med_ambiente,
      poliza_med_ambiente: autotransporte.poliza_med_ambiente,
      remolques: autotransporte.remolques,
      marca_vehiculo: autotransporte.marca_vehiculo,
      modelo_vehiculo: autotransporte.modelo_vehiculo,
      numero_serie_vin: autotransporte.numero_serie_vin,
      tipo_carroceria: autotransporte.tipo_carroceria,
      capacidad_carga: autotransporte.capacidad_carga,
      peso_bruto_vehicular: autotransporte.peso_bruto_vehicular,
      vigencia_permiso: autotransporte.vigencia_permiso,
      numero_permisos_adicionales: autotransporte.numero_permisos_adicionales,
      dimensiones: autotransporte.dimensiones,
    };
  };

  const mapFiguraCompleta = (figura: FiguraCompleta): FiguraCompleta => {
    return {
      id: figura.id || '',
      tipo_figura: figura.tipo_figura,
      rfc_figura: figura.rfc_figura,
      nombre_figura: figura.nombre_figura,
      num_licencia: figura.num_licencia,
      vigencia_licencia: figura.vigencia_licencia,
      curp: figura.curp,
      residencia_fiscal_figura: figura.residencia_fiscal_figura,
      num_reg_id_trib_figura: figura.num_reg_id_trib_figura,
      tipo_licencia: figura.tipo_licencia,
      operador_sct: figura.operador_sct,
      domicilio: figura.domicilio,
    };
  };

  // Mappers inversos para cargar datos existentes
  const cartaPorteDataToFormDataExtendido = (data: CartaPorteData): CartaPorteFormDataExtendido => {
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
      ubicaciones: (data.ubicaciones || []).map(mapToUbicacionCompleta),
      mercancias: (data.mercancias || []).map(mapToMercanciaCompleta),
      autotransporte: mapToAutotransporteCompleto(data.autotransporte),
      figuras: (data.figuras || []).map(mapToFiguraCompleta),
      tipoCreacion: data.tipoCreacion || 'manual',
      tipoCfdi: data.tipoCfdi || 'Traslado',
      rfcEmisor: data.rfcEmisor || '',
      nombreEmisor: data.nombreEmisor || '',
      rfcReceptor: data.rfcReceptor || '',
      nombreReceptor: data.nombreReceptor || '',
      transporteInternacional: typeof data.transporteInternacional === 'string' 
        ? data.transporteInternacional === 'Sí' 
        : Boolean(data.transporteInternacional),
      registroIstmo: Boolean(data.registroIstmo),
      cartaPorteVersion: data.cartaPorteVersion || '3.1',
      cartaPorteId: data.cartaPorteId,
    };
  };

  // Mappers inversos individuales
  const mapToUbicacionCompleta = (ubicacion: any): UbicacionCompleta => {
    return {
      id: ubicacion.id,
      tipo_ubicacion: ubicacion.tipo_ubicacion || 'Origen',
      id_ubicacion: ubicacion.id_ubicacion || ubicacion.id || '',
      rfc_remitente_destinatario: ubicacion.rfc_remitente_destinatario,
      nombre_remitente_destinatario: ubicacion.nombre_remitente_destinatario,
      fecha_hora_salida_llegada: ubicacion.fecha_hora_salida_llegada,
      distancia_recorrida: ubicacion.distancia_recorrida,
      tipo_estacion: ubicacion.tipo_estacion,
      numero_estacion: ubicacion.numero_estacion,
      kilometro: ubicacion.kilometro,
      coordenadas: ubicacion.coordenadas,
      domicilio: ubicacion.domicilio || {
        pais: 'México',
        codigo_postal: '',
        estado: '',
        municipio: '',
        colonia: '',
        calle: '',
        numero_exterior: '',
      },
    };
  };

  const mapToMercanciaCompleta = (mercancia: any): MercanciaCompleta => {
    return {
      id: mercancia.id,
      bienes_transp: mercancia.bienes_transp || '',
      descripcion: mercancia.descripcion || '',
      cantidad: mercancia.cantidad || 0,
      clave_unidad: mercancia.clave_unidad || '',
      peso_kg: mercancia.peso_kg || 0,
      valor_mercancia: mercancia.valor_mercancia || 0,
      material_peligroso: mercancia.material_peligroso || false,
      cve_material_peligroso: mercancia.cve_material_peligroso,
      moneda: mercancia.moneda || 'MXN',
      fraccion_arancelaria: mercancia.fraccion_arancelaria,
      tipo_embalaje: mercancia.tipo_embalaje,
      material_embalaje: mercancia.material_embalaje,
      descripcion_embalaje: mercancia.descripcion_embalaje,
      peso_bruto_total: mercancia.peso_bruto_total,
      unidad_peso_bruto: mercancia.unidad_peso_bruto,
      dimensiones: mercancia.dimensiones,
      uuid_comercio_exterior: mercancia.uuid_comercio_exterior,
      embalaje: mercancia.embalaje,
    };
  };

  const mapToAutotransporteCompleto = (autotransporte: any): AutotransporteCompleto => {
    if (!autotransporte) {
      return {
        placa_vm: '',
        anio_modelo_vm: new Date().getFullYear(),
        config_vehicular: '',
        perm_sct: '',
        num_permiso_sct: '',
        asegura_resp_civil: '',
        poliza_resp_civil: '',
        remolques: [],
      };
    }

    return {
      placa_vm: autotransporte.placa_vm || '',
      anio_modelo_vm: autotransporte.anio_modelo_vm || new Date().getFullYear(),
      config_vehicular: autotransporte.config_vehicular || '',
      perm_sct: autotransporte.perm_sct || '',
      num_permiso_sct: autotransporte.num_permiso_sct || '',
      asegura_resp_civil: autotransporte.asegura_resp_civil || '',
      poliza_resp_civil: autotransporte.poliza_resp_civil || '',
      asegura_med_ambiente: autotransporte.asegura_med_ambiente,
      poliza_med_ambiente: autotransporte.poliza_med_ambiente,
      remolques: autotransporte.remolques || [],
      marca_vehiculo: autotransporte.marca_vehiculo,
      modelo_vehiculo: autotransporte.modelo_vehiculo,
      numero_serie_vin: autotransporte.numero_serie_vin,
      tipo_carroceria: autotransporte.tipo_carroceria,
      capacidad_carga: autotransporte.capacidad_carga,
      peso_bruto_vehicular: autotransporte.peso_bruto_vehicular,
      vigencia_permiso: autotransporte.vigencia_permiso,
      numero_permisos_adicionales: autotransporte.numero_permisos_adicionales,
      dimensiones: autotransporte.dimensiones,
    };
  };

  const mapToFiguraCompleta = (figura: any): FiguraCompleta => {
    return {
      id: figura.id,
      tipo_figura: figura.tipo_figura || '',
      rfc_figura: figura.rfc_figura || '',
      nombre_figura: figura.nombre_figura || '',
      num_licencia: figura.num_licencia,
      vigencia_licencia: figura.vigencia_licencia,
      curp: figura.curp,
      residencia_fiscal_figura: figura.residencia_fiscal_figura || 'MEX',
      num_reg_id_trib_figura: figura.num_reg_id_trib_figura,
      tipo_licencia: figura.tipo_licencia,
      operador_sct: figura.operador_sct,
      domicilio: figura.domicilio || {
        pais: 'México',
        codigo_postal: '',
        estado: '',
        municipio: '',
        colonia: '',
        calle: '',
        numero_exterior: '',
      },
    };
  };

  return {
    formDataExtendidoToCartaPorteData,
    cartaPorteDataToFormDataExtendido,
    mapUbicacionCompleta,
    mapMercanciaCompleta,
    mapAutotransporteCompleto,
    mapFiguraCompleta,
    mapToUbicacionCompleta,
    mapToMercanciaCompleta,
    mapToAutotransporteCompleto,
    mapToFiguraCompleta,
  };
};
