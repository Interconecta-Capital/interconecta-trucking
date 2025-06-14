
import { CartaPorteData } from '@/components/carta-porte/CartaPorteForm';
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
      transporteInternacional: formData.transporteInternacional,
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
  const mapUbicacionCompleta = (ubicacion: UbicacionCompleta) => {
    return {
      id: ubicacion.id || '',
      tipo: ubicacion.tipo_ubicacion === 'Origen' ? 'origen' : 
            ubicacion.tipo_ubicacion === 'Destino' ? 'destino' : 'intermedia',
      direccion: `${ubicacion.domicilio?.calle || ''} ${ubicacion.domicilio?.numero_exterior || ''}`,
      codigoPostal: ubicacion.domicilio?.codigo_postal || '',
      estado: ubicacion.domicilio?.estado || '',
      municipio: ubicacion.domicilio?.municipio || '',
      coordenadas: ubicacion.coordenadas || undefined,
      rfcRemitenteDestinatario: ubicacion.rfc_remitente_destinatario,
      nombreRemitenteDestinatario: ubicacion.nombre_remitente_destinatario,
      fechaHoraSalidaLlegada: ubicacion.fecha_hora_salida_llegada,
      distanciaRecorrida: ubicacion.distancia_recorrida,
      tipoEstacion: ubicacion.tipo_estacion,
      numeroEstacion: ubicacion.numero_estacion,
      kilometro: ubicacion.kilometro,
    };
  };

  const mapMercanciaCompleta = (mercancia: MercanciaCompleta) => {
    return {
      id: mercancia.id || '',
      descripcion: mercancia.descripcion,
      cantidad: mercancia.cantidad,
      unidadMedida: mercancia.clave_unidad,
      peso: mercancia.peso_kg,
      valor: mercancia.valor_mercancia,
      claveProdServ: mercancia.bienes_transp,
      materialPeligroso: mercancia.material_peligroso,
      claveMaterialPeligroso: mercancia.cve_material_peligroso,
      fraccionArancelaria: mercancia.fraccion_arancelaria,
      tipoEmbalaje: mercancia.tipo_embalaje,
      dimensiones: mercancia.dimensiones,
      pesoBrutoTotal: mercancia.peso_bruto_total,
      unidadPesoBruto: mercancia.unidad_peso_bruto,
      materialEmbalaje: mercancia.material_embalaje,
      descripcionEmbalaje: mercancia.descripcion_embalaje,
    };
  };

  const mapAutotransporteCompleto = (autotransporte: AutotransporteCompleto) => {
    return {
      placaVm: autotransporte.placa_vm,
      configuracionVehicular: autotransporte.config_vehicular,
      anioModelo: autotransporte.anio_modelo_vm,
      marcaVehiculo: autotransporte.marca_vehiculo,
      modeloVehiculo: autotransporte.modelo_vehiculo,
      numeroSerieVin: autotransporte.numero_serie_vin,
      capacidadCarga: autotransporte.capacidad_carga,
      tipoCarroceria: autotransporte.tipo_carroceria,
      pesoBrutoVehicular: autotransporte.peso_bruto_vehicular,
      dimensiones: autotransporte.dimensiones,
      permisoSct: autotransporte.perm_sct,
      numeroPermisoSct: autotransporte.num_permiso_sct,
      vigenciaPermiso: autotransporte.vigencia_permiso,
      numerosPermisosAdicionales: autotransporte.numero_permisos_adicionales,
      seguro: {
        aseguradora: autotransporte.asegura_resp_civil,
        poliza: autotransporte.poliza_resp_civil,
        vigencia: '',
      },
      seguroMedioAmbiente: {
        aseguradora: autotransporte.asegura_med_ambiente,
        poliza: autotransporte.poliza_med_ambiente,
      },
      remolques: autotransporte.remolques,
    };
  };

  const mapFiguraCompleta = (figura: FiguraCompleta) => {
    return {
      id: figura.id || '',
      tipoFigura: figura.tipo_figura,
      rfc: figura.rfc_figura,
      nombre: figura.nombre_figura,
      licencia: figura.num_licencia,
      vigenciaLicencia: figura.vigencia_licencia,
      curp: figura.curp,
      residenciaFiscal: figura.residencia_fiscal_figura,
      numeroRegistroIdentidadTributaria: figura.num_reg_id_trib_figura,
      tipoLicencia: figura.tipo_licencia,
      operadorSct: figura.operador_sct,
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

  // Mappers inversos individuales
  const mapToUbicacionCompleta = (ubicacion: any): UbicacionCompleta => {
    return {
      id: ubicacion.id,
      tipo_ubicacion: ubicacion.tipo === 'origen' ? 'Origen' : 
                     ubicacion.tipo === 'destino' ? 'Destino' : 'Paso Intermedio',
      id_ubicacion: ubicacion.id || '',
      rfc_remitente_destinatario: ubicacion.rfcRemitenteDestinatario,
      nombre_remitente_destinatario: ubicacion.nombreRemitenteDestinatario,
      fecha_hora_salida_llegada: ubicacion.fechaHoraSalidaLlegada,
      distancia_recorrida: ubicacion.distanciaRecorrida,
      tipo_estacion: ubicacion.tipoEstacion,
      numero_estacion: ubicacion.numeroEstacion,
      kilometro: ubicacion.kilometro,
      coordenadas: ubicacion.coordenadas,
      domicilio: {
        codigo_postal: ubicacion.codigoPostal || '',
        estado: ubicacion.estado || '',
        municipio: ubicacion.municipio || '',
        colonia: '',
        calle: ubicacion.direccion || '',
        numero_exterior: '',
        pais: 'México',
      },
    };
  };

  const mapToMercanciaCompleta = (mercancia: any): MercanciaCompleta => {
    return {
      id: mercancia.id,
      descripcion: mercancia.descripcion || '',
      bienes_transp: mercancia.claveProdServ || '',
      clave_unidad: mercancia.unidadMedida || '',
      cantidad: mercancia.cantidad || 0,
      peso_kg: mercancia.peso || 0,
      valor_mercancia: mercancia.valor || 0,
      material_peligroso: mercancia.materialPeligroso || false,
      cve_material_peligroso: mercancia.claveMaterialPeligroso,
      moneda: 'MXN',
      fraccion_arancelaria: mercancia.fraccionArancelaria,
      tipo_embalaje: mercancia.tipoEmbalaje,
      material_embalaje: mercancia.materialEmbalaje,
      descripcion_embalaje: mercancia.descripcionEmbalaje,
      peso_bruto_total: mercancia.pesoBrutoTotal,
      unidad_peso_bruto: mercancia.unidadPesoBruto,
      dimensiones: mercancia.dimensiones,
    };
  };

  const mapToAutotransporteCompleto = (autotransporte: any): AutotransporteCompleto => {
    return {
      placa_vm: autotransporte?.placaVm || '',
      anio_modelo_vm: autotransporte?.anioModelo || new Date().getFullYear(),
      config_vehicular: autotransporte?.configuracionVehicular || '',
      marca_vehiculo: autotransporte?.marcaVehiculo,
      modelo_vehiculo: autotransporte?.modeloVehiculo,
      numero_serie_vin: autotransporte?.numeroSerieVin,
      capacidad_carga: autotransporte?.capacidadCarga,
      tipo_carroceria: autotransporte?.tipoCarroceria,
      peso_bruto_vehicular: autotransporte?.pesoBrutoVehicular,
      dimensiones: autotransporte?.dimensiones,
      perm_sct: autotransporte?.permisoSct || '',
      num_permiso_sct: autotransporte?.numeroPermisoSct || '',
      vigencia_permiso: autotransporte?.vigenciaPermiso,
      numero_permisos_adicionales: autotransporte?.numerosPermisosAdicionales,
      asegura_resp_civil: autotransporte?.seguro?.aseguradora || '',
      poliza_resp_civil: autotransporte?.seguro?.poliza || '',
      asegura_med_ambiente: autotransporte?.seguroMedioAmbiente?.aseguradora,
      poliza_med_ambiente: autotransporte?.seguroMedioAmbiente?.poliza,
      remolques: autotransporte?.remolques || [],
    };
  };

  const mapToFiguraCompleta = (figura: any): FiguraCompleta => {
    return {
      id: figura.id,
      tipo_figura: figura.tipoFigura || '',
      rfc_figura: figura.rfc || '',
      nombre_figura: figura.nombre || '',
      num_licencia: figura.licencia,
      vigencia_licencia: figura.vigenciaLicencia,
      curp: figura.curp,
      residencia_fiscal_figura: figura.residenciaFiscal || 'MEX',
      num_reg_id_trib_figura: figura.numeroRegistroIdentidadTributaria,
      tipo_licencia: figura.tipoLicencia,
      operador_sct: figura.operadorSct,
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
