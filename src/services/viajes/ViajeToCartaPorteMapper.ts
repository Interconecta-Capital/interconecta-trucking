
import { ViajeWizardData } from '@/components/viajes/ViajeWizard';
import { CartaPorteData, MercanciaCompleta } from '@/types/cartaPorte';

export class ViajeToCartaPorteMapper {
  static mapToCartaPorteData(wizardData: ViajeWizardData) {
    // Mapear datos básicos de configuración
    const configuracion = {
      version: '3.1',
      tipoComprobante: 'T', // Traslado
      emisor: {
        rfc: '', // Se debe configurar desde el perfil del usuario
        nombre: '',
        regimenFiscal: ''
      },
      receptor: {
        rfc: wizardData.cliente?.rfc || '',
        nombre: wizardData.cliente?.nombre_razon_social || '',
        usoCfdi: 'S01'
      }
    };

    // Mapear ubicaciones (origen y destino)
    const ubicaciones = [];
    
    if (wizardData.origen) {
      ubicaciones.push({
        tipoUbicacion: 'Origen',
        idUbicacion: 'OR000001',
        direccion: wizardData.origen.direccion,
        codigoPostal: wizardData.origen.codigoPostal,
        coordenadas: wizardData.origen.coordenadas,
        fechaHoraSalidaLlegada: new Date().toISOString()
      });
    }

    if (wizardData.destino) {
      ubicaciones.push({
        tipoUbicacion: 'Destino',
        idUbicacion: 'DE000001',
        direccion: wizardData.destino.direccion,
        codigoPostal: wizardData.destino.codigoPostal,
        coordenadas: wizardData.destino.coordenadas,
        distanciaRecorrida: wizardData.distanciaRecorrida,
        fechaHoraSalidaLlegada: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Mañana por defecto
      });
    }

    // Mapear mercancías con el tipo correcto MercanciaCompleta
    const mercancias: MercanciaCompleta[] = [{
      id: `mercancia-${Date.now()}`,
      bienes_transp: '99999999',
      descripcion: wizardData.descripcionMercancia || 'Mercancía general',
      cantidad: 1,
      clave_unidad: 'H87', // Pieza
      peso_kg: 100, // Peso por defecto
      valor_mercancia: 1000, // Valor por defecto
      moneda: 'MXN',
      material_peligroso: false,
      especie_protegida: false,
      fraccion_arancelaria: '99999999'
    }];

    // Mapear autotransporte
    const autotransporte = {
      placa: wizardData.vehiculo?.placa || '',
      configVehicular: wizardData.vehiculo?.configuracion_vehicular || 'C2',
      pesoBrutoVehicular: wizardData.vehiculo?.peso_bruto_vehicular || 3500,
      anioModeloVm: wizardData.vehiculo?.anio || new Date().getFullYear()
    };

    // Mapear figuras de transporte
    const figuras = [];
    if (wizardData.conductor) {
      figuras.push({
        tipoFigura: '01', // Operador
        nombreFigura: wizardData.conductor.nombre,
        rfcFigura: wizardData.conductor.rfc || 'XEXX010101000',
        numLicencia: wizardData.conductor.num_licencia || '',
        tipoLicencia: wizardData.conductor.tipo_licencia || 'C'
      });
    }

    return {
      configuracion,
      ubicaciones,
      mercancias,
      autotransporte,
      figuras,
      // Metadatos del viaje
      tipoServicio: wizardData.tipoServicio,
      descripcionMercancia: wizardData.descripcionMercancia
    };
  }

  static mapToValidCartaPorteFormat(wizardData: ViajeWizardData): CartaPorteData {
    const baseData = this.mapToCartaPorteData(wizardData);
    
    // Validar datos requeridos
    if (!baseData.configuracion.receptor.rfc) {
      throw new Error('RFC del cliente es requerido');
    }

    if (baseData.ubicaciones.length < 2) {
      throw new Error('Se requieren al menos origen y destino');
    }

    if (baseData.mercancias.length === 0) {
      throw new Error('Se requiere al menos una mercancía');
    }

    // Retornar en formato CartaPorteData
    return {
      cartaPorteVersion: '3.1',
      rfcEmisor: baseData.configuracion.emisor.rfc,
      nombreEmisor: baseData.configuracion.emisor.nombre,
      regimenFiscalEmisor: baseData.configuracion.emisor.regimenFiscal,
      rfcReceptor: baseData.configuracion.receptor.rfc,
      nombreReceptor: baseData.configuracion.receptor.nombre,
      usoCfdi: baseData.configuracion.receptor.usoCfdi,
      tipoCfdi: 'T', // Traslado
      transporteInternacional: false,
      registroIstmo: false,
      viaTransporte: '01', // Autotransporte
      mercancias: baseData.mercancias,
      ubicaciones: baseData.ubicaciones.map(ub => ({
        id: ub.idUbicacion,
        tipo_ubicacion: ub.tipoUbicacion,
        rfc: baseData.configuracion.receptor.rfc,
        nombre: baseData.configuracion.receptor.nombre,
        fecha_llegada_salida: ub.fechaHoraSalidaLlegada,
        fecha_hora_salida_llegada: ub.fechaHoraSalidaLlegada,
        distancia_recorrida: ub.distanciaRecorrida || 0,
        coordenadas: ub.coordenadas,
        domicilio: {
          pais: 'MEX',
          codigo_postal: ub.codigoPostal || '06600',
          estado: 'Ciudad de México',
          municipio: 'Ciudad de México',
          colonia: 'Centro',
          calle: ub.direccion || 'Calle sin número'
        }
      })),
      autotransporte: {
        placa_vm: baseData.autotransporte.placa,
        anio_modelo_vm: baseData.autotransporte.anioModeloVm,
        config_vehicular: baseData.autotransporte.configVehicular,
        perm_sct: 'TPAF03',
        num_permiso_sct: 'SCT-123456',
        asegura_resp_civil: 'SEGUROS SA',
        poliza_resp_civil: 'POL123456',
        asegura_med_ambiente: 'SEGUROS SA',
        poliza_med_ambiente: 'POL123456',
        peso_bruto_vehicular: baseData.autotransporte.pesoBrutoVehicular,
        tipo_carroceria: '01'
      },
      figuras: baseData.figuras.map(fig => ({
        id: `figura-${Date.now()}`,
        tipo_figura: fig.tipoFigura,
        rfc_figura: fig.rfcFigura,
        nombre_figura: fig.nombreFigura,
        num_licencia: fig.numLicencia,
        tipo_licencia: fig.tipoLicencia
      }))
    };
  }
}
