
import { CartaPorteFormDataExtendido } from './useCartaPorteMappersExtendidos';
import { MercanciaCompleta, AutotransporteCompleto, FiguraCompleta, UbicacionCompleta } from '@/types/cartaPorte';

export const useCartaPorteDataConverters = () => {
  // Convertir ubicaciones extendidas a formato simple
  const convertUbicacionesToSimple = (ubicaciones: UbicacionCompleta[]) => {
    return ubicaciones.map(ubicacion => ({
      id: ubicacion.id || '',
      tipo: ubicacion.tipo_ubicacion === 'Origen' ? 'origen' as const : 
            ubicacion.tipo_ubicacion === 'Destino' ? 'destino' as const : 'origen' as const,
      direccion: `${ubicacion.domicilio?.calle || ''} ${ubicacion.domicilio?.numero_exterior || ''}`,
      codigoPostal: ubicacion.domicilio?.codigo_postal || '',
      estado: ubicacion.domicilio?.estado || '',
      municipio: ubicacion.domicilio?.municipio || '',
      coordenadas: ubicacion.coordenadas,
    }));
  };

  // Convertir mercancías extendidas a formato simple
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

  // Convertir autotransporte extendido a formato simple
  const convertAutotransporteToSimple = (autotransporte: AutotransporteCompleto) => {
    return {
      placaVm: autotransporte.placa_vm || '',
      configuracionVehicular: autotransporte.config_vehicular || '',
      anioModelo: autotransporte.anio_modelo_vm || new Date().getFullYear(),
      marcaVehiculo: autotransporte.marca_vehiculo,
      modeloVehiculo: autotransporte.modelo_vehiculo,
      numeroSerieVin: autotransporte.numero_serie_vin,
      capacidadCarga: autotransporte.capacidad_carga,
      tipoCarroceria: autotransporte.tipo_carroceria,
      pesoBrutoVehicular: autotransporte.peso_bruto_vehicular,
      dimensiones: autotransporte.dimensiones,
      permisoSct: autotransporte.perm_sct || '',
      numeroPermisoSct: autotransporte.num_permiso_sct || '',
      vigenciaPermiso: autotransporte.vigencia_permiso,
      numerosPermisosAdicionales: autotransporte.numero_permisos_adicionales,
      seguro: {
        aseguradora: autotransporte.asegura_resp_civil || '',
        poliza: autotransporte.poliza_resp_civil || '',
        vigencia: '',
      },
      seguroMedioAmbiente: {
        aseguradora: autotransporte.asegura_med_ambiente,
        poliza: autotransporte.poliza_med_ambiente,
      },
      remolques: autotransporte.remolques || [],
    };
  };

  // Convertir figuras extendidas a formato simple
  const convertFigurasToSimple = (figuras: FiguraCompleta[]) => {
    return figuras.map(figura => ({
      id: figura.id || '',
      tipoFigura: figura.tipo_figura || '',
      rfc: figura.rfc_figura || '',
      nombre: figura.nombre_figura || '',
      licencia: figura.num_licencia,
      vigenciaLicencia: figura.vigencia_licencia,
      curp: figura.curp,
      residenciaFiscal: figura.residencia_fiscal_figura || 'MEX',
      numeroRegistroIdentidadTributaria: figura.num_reg_id_trib_figura,
      tipoLicencia: figura.tipo_licencia,
      operadorSct: figura.operador_sct,
      domicilio: figura.domicilio,
    }));
  };

  // Convertir datos extendidos completos a formato CartaPorteData
  const convertExtendedToCartaPorteData = (formData: CartaPorteFormDataExtendido) => {
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
      ubicaciones: convertUbicacionesToSimple(formData.ubicaciones),
      mercancias: convertMercanciasToSimple(formData.mercancias),
      autotransporte: convertAutotransporteToSimple(formData.autotransporte),
      figuras: convertFigurasToSimple(formData.figuras),
      cartaPorteId: formData.cartaPorteId,
    };
  };

  return {
    convertUbicacionesToSimple,
    convertMercanciasToSimple,
    convertAutotransporteToSimple,
    convertFigurasToSimple,
    convertExtendedToCartaPorteData,
  };
};
